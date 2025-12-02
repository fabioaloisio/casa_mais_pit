const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const UsuarioRepository = require('../repository/usuarioRepository');
const StatusService = require('../services/statusService');
const emailService = require('../services/emailService');

const usuarioRepository = new UsuarioRepository();
const statusService = new StatusService();
const SALT_ROUNDS = 10;

class ApprovalController {
  /**
   * Lista todos os usuários pendentes de aprovação
   */
  async listPending(req, res) {
    try {
      const pendingUsers = await usuarioRepository.findByStatus('pendente');
      
      res.json({
        success: true,
        data: pendingUsers.map(user => user.toJSON()),
        total: pendingUsers.length
      });
    } catch (error) {
      console.error('Erro ao listar usuários pendentes:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao listar usuários pendentes',
        errors: ['Erro interno do servidor']
      });
    }
  }

  /**
   * Aprova um usuário e envia email com link de ativação
   * MIGRADO: Agora usa StatusService
   */
  async approve(req, res) {
    try {
      const { id } = req.params;
      const adminId = req.user.id;

      // CORREÇÃO: Usar StatusService em vez de Repository direto
      const resultado = await statusService.approveUser(id, adminId);

      // Enviar email ao usuário com link de ativação
      await emailService.sendApprovalEmail(
        resultado.usuario.email,
        resultado.usuario.nome,
        resultado.token
      );

      res.json({
        success: true,
        message: 'Usuário aprovado com sucesso',
        data: resultado
      });
    } catch (error) {
      console.error('Erro ao aprovar usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao aprovar usuário',
        errors: ['Erro interno do servidor']
      });
    }
  }

  /**
   * Rejeita um usuário
   * MIGRADO: Agora usa StatusService
   */
  async reject(req, res) {
    try {
      const { id } = req.params;
      const { motivo } = req.body;
      const adminId = req.user.id;

      // CORREÇÃO: Usar StatusService em vez de Repository direto
      const resultado = await statusService.rejectUser(id, adminId, motivo);

      // Enviar email ao usuário informando rejeição
      await emailService.sendRejectionEmail(
        resultado.usuario.email,
        resultado.usuario.nome,
        motivo
      );

      res.json({
        success: true,
        message: 'Usuário rejeitado',
        data: resultado
      });
    } catch (error) {
      console.error('Erro ao rejeitar usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao rejeitar usuário',
        errors: ['Erro interno do servidor']
      });
    }
  }

  /**
   * Valida token de ativação
   */
  async validateActivationToken(req, res) {
    try {
      const { token } = req.params;
      
      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Token inválido',
          errors: ['Token não fornecido']
        });
      }
      
      // Buscar usuário pelo token
      const usuario = await usuarioRepository.findByActivationToken(token);
      
      if (!usuario) {
        return res.status(400).json({
          success: false,
          message: 'Token inválido ou expirado',
          errors: ['Token de ativação não encontrado']
        });
      }
      
      if (usuario.status === 'ativo') {
        return res.status(400).json({
          success: false,
          message: 'Conta já foi ativada',
          errors: ['Esta conta já está ativa']
        });
      }
      
      if (usuario.status !== 'aprovado') {
        return res.status(400).json({
          success: false,
          message: 'Conta não está aprovada',
          errors: ['Esta conta não foi aprovada para ativação']
        });
      }
      
      // Verificar se token não expirou (7 dias)
      const dataAprovacao = new Date(usuario.data_aprovacao);
      const diasDecorridos = (Date.now() - dataAprovacao.getTime()) / (1000 * 60 * 60 * 24);
      
      if (diasDecorridos > 7) {
        return res.status(400).json({
          success: false,
          message: 'Token expirado',
          errors: ['O link de ativação expirou. Solicite um novo ao administrador.']
        });
      }
      
      res.json({
        success: true,
        message: 'Token válido',
        data: {
          nome: usuario.nome,
          email: usuario.email
        }
      });
    } catch (error) {
      console.error('Erro ao validar token:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao validar token',
        errors: ['Erro interno do servidor']
      });
    }
  }

  /**
   * Ativa conta do usuário com senha
   */
  async activateAccount(req, res) {
    try {
      const { token, senha, confirmSenha } = req.body;
      
      // Validações
      const errors = [];
      
      if (!token) errors.push('Token é obrigatório');
      if (!senha) errors.push('Senha é obrigatória');
      if (!confirmSenha) errors.push('Confirmação de senha é obrigatória');
      if (senha !== confirmSenha) errors.push('Senhas não conferem');
      if (senha && senha.length < 6) errors.push('Senha deve ter pelo menos 6 caracteres');
      
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors
        });
      }
      
      // Buscar usuário pelo token
      const usuario = await usuarioRepository.findByActivationToken(token);
      
      if (!usuario) {
        return res.status(400).json({
          success: false,
          message: 'Token inválido',
          errors: ['Token de ativação não encontrado']
        });
      }
      
      if (usuario.status === 'ativo') {
        return res.status(400).json({
          success: false,
          message: 'Conta já foi ativada',
          errors: ['Esta conta já está ativa']
        });
      }
      
      if (usuario.status !== 'aprovado') {
        return res.status(400).json({
          success: false,
          message: 'Conta não está aprovada',
          errors: ['Esta conta não foi aprovada para ativação']
        });
      }
      
      // Hash da senha
      const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);
      
      // Ativar conta
      await usuarioRepository.activateAccount(
        usuario.id,
        senhaHash
      );
      
      // Registrar no log
      await usuarioRepository.logApprovalAction(
        usuario.id,
        'ativado',
        usuario.id,
        'Conta ativada pelo usuário'
      );
      
      // Enviar email de boas-vindas
      await emailService.sendWelcomeEmail(
        usuario.email,
        usuario.nome
      );
      
      res.json({
        success: true,
        message: 'Conta ativada com sucesso',
        data: {
          nome: usuario.nome,
          email: usuario.email
        }
      });
    } catch (error) {
      console.error('Erro ao ativar conta:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao ativar conta',
        errors: ['Erro interno do servidor']
      });
    }
  }

  /**
   * Reenviar email de ativação
   */
  async resendActivationEmail(req, res) {
    try {
      const { id } = req.params;
      const adminId = req.user.id;
      
      // Buscar usuário
      const usuario = await usuarioRepository.findById(id);
      
      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado',
          errors: ['Usuário não encontrado']
        });
      }
      
      if (usuario.status !== 'aprovado') {
        return res.status(400).json({
          success: false,
          message: 'Usuário não está aprovado',
          errors: ['Apenas usuários aprovados podem receber o email de ativação']
        });
      }
      
      if (!usuario.token_ativacao) {
        return res.status(400).json({
          success: false,
          message: 'Token de ativação não encontrado',
          errors: ['Usuário não possui token de ativação']
        });
      }
      
      // Reenviar email
      await emailService.sendApprovalEmail(
        usuario.email,
        usuario.nome,
        usuario.token_ativacao
      );
      
      res.json({
        success: true,
        message: 'Email de ativação reenviado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao reenviar email:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao reenviar email',
        errors: ['Erro interno do servidor']
      });
    }
  }
}

module.exports = new ApprovalController();