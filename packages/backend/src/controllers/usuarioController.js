const bcrypt = require('bcrypt');
const UsuarioRepository = require('../repository/usuarioRepository');
const StatusService = require('../services/statusService');
const Usuario = require('../models/usuario');
const emailService = require('../services/emailService');

const usuarioRepository = new UsuarioRepository();
const statusService = new StatusService();
const SALT_ROUNDS = 10;

class UsuarioController {
  async listarTodos(req, res) {
    try {
      console.log('🔍 [DEBUG] Iniciando listarTodos...');
      const usuarios = await usuarioRepository.getAllWithStatusDetails();
      console.log('🔍 [DEBUG] Usuários retornados:', usuarios.length);

      if (usuarios.length > 0) {
        const firstUser = usuarios[0];
        console.log('🔍 [DEBUG] Primeiro usuário tipo:', typeof firstUser);
        console.log('🔍 [DEBUG] Primeiro usuário constructor:', firstUser.constructor.name);
        console.log('🔍 [DEBUG] Primeiro usuário tem toJSON:', typeof firstUser.toJSON);
        console.log('🔍 [DEBUG] Primeiro usuário keys:', Object.keys(firstUser));
      }

      const mappedData = usuarios.map((u, index) => {
        console.log(`🔍 [DEBUG] Processando usuário ${index}: tipo=${typeof u}, constructor=${u.constructor.name}, hasToJSON=${typeof u.toJSON}`);

        // Safeguard: Check if u has toJSON method, if not create a safe object
        if (typeof u.toJSON === 'function') {
          console.log(`🔍 [DEBUG] Usuário ${index} tem toJSON, usando método normal`);
          return {
            ...u.toJSON(),
            aprovado_por_nome: u.aprovado_por_nome,
            bloqueado_por_nome: u.bloqueado_por_nome,
            suspenso_por_nome: u.suspenso_por_nome
          };
        } else {
          // Fallback: Create a safe object without toJSON
          console.warn(`🔍 [DEBUG] Usuário ${index} SEM toJSON, usando fallback:`, u);
          return {
            id: u.id,
            nome: u.nome,
            email: u.email,
            tipo: u.tipo,
            status: u.status,
            ativo: u.ativo,
            data_cadastro: u.data_cadastro,
            data_atualizacao: u.data_atualizacao,
            data_aprovacao: u.data_aprovacao,
            aprovado_por: u.aprovado_por,
            data_ativacao: u.data_ativacao,
            data_ultimo_acesso: u.data_ultimo_acesso,
            data_bloqueio: u.data_bloqueio,
            motivo_bloqueio: u.motivo_bloqueio,
            bloqueado_por: u.bloqueado_por,
            data_suspensao: u.data_suspensao,
            data_fim_suspensao: u.data_fim_suspensao,
            suspenso_por: u.suspenso_por,
            motivo_suspensao: u.motivo_suspensao,
            aprovado_por_nome: u.aprovado_por_nome,
            bloqueado_por_nome: u.bloqueado_por_nome,
            suspenso_por_nome: u.suspenso_por_nome
          };
        }
      });

      console.log('🔍 [DEBUG] Dados mapeados com sucesso, enviando resposta...');

      res.json({
        success: true,
        data: mappedData
      });
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        errors: ['Erro ao buscar usuários']
      });
    }
  }

  async criar(req, res) {
    try {
      const { nome, email, senha, tipo } = req.body;

      // Validações básicas
      const errors = [];

      if (!nome?.trim()) errors.push('Nome é obrigatório');
      if (!email?.trim()) errors.push('Email é obrigatório');
      if (!tipo?.trim()) errors.push('Tipo é obrigatório');

      // Senha é opcional - se fornecida, validar
      if (senha && senha.trim() && senha.length < 6) {
        errors.push('Senha deve ter pelo menos 6 caracteres');
      }

      if (!/\S+@\S+\.\S+/.test(email || '')) {
        errors.push('Email inválido');
      }

      if (tipo && !['Administrador', 'Financeiro', 'Colaborador'].includes(tipo)) {
        errors.push('Tipo de usuário inválido. Use: Administrador, Financeiro ou Colaborador');
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors
        });
      }

      // Verificar se email já existe para usuários ativos
      const emailExisteAtivo = await usuarioRepository.emailExistsActive(email);

      if (emailExisteAtivo) {
        return res.status(400).json({
          success: false,
          message: 'Email já está em uso',
          errors: ['Este email já está cadastrado']
        });
      }

      // Verificar se email pertence a usuário inativo
      const usuarioInativo = await usuarioRepository.findInactiveUserByEmail(email);

      if (usuarioInativo) {
        return res.status(409).json({
          success: false,
          message: 'Email pertence a um usuário inativo',
          errors: ['Este email está associado a um usuário inativo'],
          data: {
            canReactivate: true,
            inactiveUserId: usuarioInativo.id,
            inactiveUserName: usuarioInativo.nome,
            inactiveUserEmail: usuarioInativo.email,
            inactiveUserType: usuarioInativo.tipo
          }
        });
      }

      // FLUXO A: Admin forneceu senha - criar usuário ativo
      if (senha && senha.trim()) {
        const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);

        const novoUsuario = new Usuario({
          nome: nome.trim(),
          email: email.trim().toLowerCase(),
          senha: senhaHash,
          tipo: tipo || 'Colaborador',
          status: 'ativo' // Admin criou com senha = ativo imediatamente
        });

        const usuarioCriado = await usuarioRepository.create(novoUsuario);

        // Enviar email informativo ao usuário
        try {
          await emailService.sendAccountCreatedEmail(
            usuarioCriado.email,
            usuarioCriado.nome,
            usuarioCriado.tipo
          );
        } catch (emailError) {
          console.error('Erro ao enviar email informativo:', emailError);
          // Não falhar se email não for enviado
        }

        return res.status(201).json({
          success: true,
          message: 'Usuário cadastrado com sucesso. Você deve comunicar a senha ao usuário.',
          data: usuarioCriado.toJSON()
        });
      }

      // FLUXO B: Admin NÃO forneceu senha - usuário define sua senha
      const crypto = require('crypto');
      const tokenAtivacao = crypto.randomUUID();

      console.log('🔑 [DEBUG] Token gerado:', tokenAtivacao);
      console.log('👤 [DEBUG] Admin que está criando:', req.user.id, req.user.nome);

      const novoUsuario = new Usuario({
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        senha: null, // Usuário definirá sua senha
        tipo: tipo || 'Colaborador',
        status: 'aprovado', // Aprovado pelo admin, aguardando ativação
        token_ativacao: tokenAtivacao,
        aprovado_por: req.user.id, // ID do admin que está criando
        data_aprovacao: new Date()
      });

      console.log('📝 [DEBUG] Dados do novo usuário:', {
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        status: novoUsuario.status,
        token_ativacao: novoUsuario.token_ativacao,
        aprovado_por: novoUsuario.aprovado_por
      });

      const usuarioCriado = await usuarioRepository.create(novoUsuario);

      console.log('✅ [DEBUG] Usuário criado com ID:', usuarioCriado.id);
      console.log('🔍 [DEBUG] Token no usuário criado:', usuarioCriado.token_ativacao);

      // Enviar email com link de ativação
      try {
        await emailService.sendApprovalEmail(
          usuarioCriado.email,
          usuarioCriado.nome,
          tokenAtivacao
        );

        return res.status(201).json({
          success: true,
          message: 'Usuário cadastrado com sucesso. Um email foi enviado para que ele defina sua senha.',
          data: usuarioCriado.toJSON()
        });
      } catch (emailError) {
        console.error('Erro ao enviar email de ativação:', emailError);

        // Em desenvolvimento, retornar link
        if (process.env.NODE_ENV !== 'production') {
          return res.status(201).json({
            success: true,
            message: 'Usuário cadastrado. Email não enviado (modo dev).',
            data: usuarioCriado.toJSON(),
            dev_activation_url: `${process.env.FRONTEND_URL || 'http://localhost:5174'}/activate/${tokenAtivacao}`
          });
        }

        // Em produção, falhar se não conseguir enviar email
        return res.status(500).json({
          success: false,
          message: 'Usuário criado, mas falha ao enviar email de ativação',
          errors: ['Erro ao enviar email de ativação']
        });
      }
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        errors: ['Erro ao criar usuário']
      });
    }
  }

  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { nome, email, senha, tipo, ativo } = req.body;

      // Verificar se usuário existe
      const usuarioExistente = await usuarioRepository.findById(id);
      if (!usuarioExistente) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado',
          errors: ['Usuário não existe']
        });
      }

      // Validações
      const errors = [];
      
      if (nome !== undefined && !nome?.trim()) {
        errors.push('Nome não pode estar vazio');
      }
      
      if (email !== undefined) {
        if (!email?.trim()) {
          errors.push('Email não pode estar vazio');
        } else if (!/\S+@\S+\.\S+/.test(email)) {
          errors.push('Email inválido');
        } else {
          // Verificar se email já existe (exceto para o próprio usuário)
          const emailExiste = await usuarioRepository.emailExistsExceptId(email, id);
          if (emailExiste) {
            errors.push('Este email já está sendo usado por outro usuário');
          }
        }
      }
      
      if (senha !== undefined && senha?.length > 0 && senha.length < 6) {
        errors.push('Senha deve ter pelo menos 6 caracteres');
      }

      if (tipo !== undefined && !['Administrador', 'Financeiro', 'Colaborador'].includes(tipo)) {
        errors.push('Tipo de usuário inválido. Use: Administrador, Financeiro ou Colaborador');
      }

      // Verificar se está tentando alterar o próprio tipo
      if (req.user.id == id && tipo !== undefined && tipo !== req.user.tipo) {
        errors.push('Você não pode alterar seu próprio tipo de usuário');
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors
        });
      }

      // Preparar dados para atualização
      const dadosAtualizacao = {};
      
      if (nome !== undefined) dadosAtualizacao.nome = nome.trim();
      if (email !== undefined) dadosAtualizacao.email = email.trim().toLowerCase();
      if (tipo !== undefined) dadosAtualizacao.tipo = tipo;
      if (ativo !== undefined) dadosAtualizacao.ativo = ativo;
      
      if (senha !== undefined && senha?.length > 0) {
        dadosAtualizacao.senha = await bcrypt.hash(senha, SALT_ROUNDS);
      }

      const usuarioAtualizado = await usuarioRepository.update(id, dadosAtualizacao);

      res.json({
        success: true,
        message: 'Usuário atualizado com sucesso',
        data: usuarioAtualizado.toJSON()
      });
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        errors: ['Erro ao atualizar usuário']
      });
    }
  }

  async excluir(req, res) {
    try {
      const { id } = req.params;

      // Verificar se usuário existe
      const usuario = await usuarioRepository.findById(id);
      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado',
          errors: ['Usuário não existe']
        });
      }

      // Não permitir excluir a si mesmo
      if (req.user.id == id) {
        return res.status(400).json({
          success: false,
          message: 'Operação não permitida',
          errors: ['Você não pode excluir sua própria conta']
        });
      }

      // Soft delete - define status como 'inativo'
      const linhasAfetadas = await usuarioRepository.softDelete(id, req.user.id);

      if (linhasAfetadas === 0) {
        return res.status(500).json({
          success: false,
          message: 'Erro ao remover usuário',
          errors: ['Falha ao desativar usuário no banco de dados']
        });
      }

      res.json({
        success: true,
        message: 'Usuário removido com sucesso'
      });
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        errors: ['Erro ao excluir usuário']
      });
    }
  }

  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      
      const usuario = await usuarioRepository.findById(id);
      
      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado',
          errors: ['Usuário não existe']
        });
      }

      res.json({
        success: true,
        data: usuario.toJSON()
      });
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        errors: ['Erro ao buscar usuário']
      });
    }
  }

  async alterarStatus(req, res) {
    try {
      const { id } = req.params;
      const { ativo } = req.body;

      if (typeof ativo !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'Status inválido',
          errors: ['Status deve ser true ou false']
        });
      }

      // Verificar se usuário existe
      const usuario = await usuarioRepository.findById(id);
      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado',
          errors: ['Usuário não existe']
        });
      }

      // Não permitir desativar a si mesmo
      if (req.user.id == id && !ativo) {
        return res.status(400).json({
          success: false,
          message: 'Operação não permitida',
          errors: ['Você não pode desativar sua própria conta']
        });
      }

      await usuarioRepository.updateStatus(id, ativo);

      res.json({
        success: true,
        message: `Usuário ${ativo ? 'ativado' : 'desativado'} com sucesso`
      });
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        errors: ['Erro ao alterar status do usuário']
      });
    }
  }

  // Novos métodos para gerenciamento de status

  async approveUser(req, res) {
    try {
      const { id } = req.params;

      // Verificar permissão
      if (!statusService.canPerformAction(req.user, 'aprovar')) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado',
          errors: ['Você não tem permissão para aprovar usuários']
        });
      }

      const resultado = await statusService.approveUser(id, req.user.id);

      res.json({
        success: true,
        message: 'Usuário aprovado com sucesso',
        data: resultado
      });
    } catch (error) {
      console.error('Erro ao aprovar usuário:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor',
        errors: [error.message || 'Erro ao aprovar usuário']
      });
    }
  }

  async rejectUser(req, res) {
    try {
      const { id } = req.params;
      const { motivo } = req.body;

      // Verificar permissão
      if (!statusService.canPerformAction(req.user, 'rejeitar')) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado',
          errors: ['Você não tem permissão para rejeitar usuários']
        });
      }

      if (!motivo?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Motivo da rejeição é obrigatório',
          errors: ['Informe o motivo da rejeição']
        });
      }

      const resultado = await statusService.rejectUser(id, req.user.id, motivo);

      res.json({
        success: true,
        message: 'Usuário rejeitado com sucesso',
        data: resultado
      });
    } catch (error) {
      console.error('Erro ao rejeitar usuário:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor',
        errors: [error.message || 'Erro ao rejeitar usuário']
      });
    }
  }

  async blockUser(req, res) {
    try {
      const { id } = req.params;
      const { motivo } = req.body;

      // Verificar permissão
      if (!statusService.canPerformAction(req.user, 'bloquear')) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado',
          errors: ['Você não tem permissão para bloquear usuários']
        });
      }

      if (!motivo?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Motivo do bloqueio é obrigatório',
          errors: ['Informe o motivo do bloqueio']
        });
      }

      // Não permitir bloquear a si mesmo
      if (req.user.id == id) {
        return res.status(400).json({
          success: false,
          message: 'Operação não permitida',
          errors: ['Você não pode bloquear sua própria conta']
        });
      }

      const resultado = await statusService.blockUser(id, req.user.id, motivo);

      res.json({
        success: true,
        message: 'Usuário bloqueado com sucesso',
        data: resultado
      });
    } catch (error) {
      console.error('Erro ao bloquear usuário:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor',
        errors: [error.message || 'Erro ao bloquear usuário']
      });
    }
  }

  async unblockUser(req, res) {
    try {
      const { id } = req.params;

      // Verificar permissão
      if (!statusService.canPerformAction(req.user, 'desbloquear')) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado',
          errors: ['Você não tem permissão para desbloquear usuários']
        });
      }

      const resultado = await statusService.unblockUser(id, req.user.id);

      res.json({
        success: true,
        message: 'Usuário desbloqueado com sucesso',
        data: resultado
      });
    } catch (error) {
      console.error('Erro ao desbloquear usuário:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor',
        errors: [error.message || 'Erro ao desbloquear usuário']
      });
    }
  }

  async suspendUser(req, res) {
    try {
      const { id } = req.params;
      const { dataFim, motivo } = req.body;

      // Verificar permissão
      if (!statusService.canPerformAction(req.user, 'suspender')) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado',
          errors: ['Você não tem permissão para suspender usuários']
        });
      }

      const errors = [];
      if (!dataFim) errors.push('Data fim da suspensão é obrigatória');
      if (!motivo?.trim()) errors.push('Motivo da suspensão é obrigatório');

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors
        });
      }

      // Não permitir suspender a si mesmo
      if (req.user.id == id) {
        return res.status(400).json({
          success: false,
          message: 'Operação não permitida',
          errors: ['Você não pode suspender sua própria conta']
        });
      }

      const resultado = await statusService.suspendUser(id, req.user.id, dataFim, motivo);

      res.json({
        success: true,
        message: 'Usuário suspenso com sucesso',
        data: resultado
      });
    } catch (error) {
      console.error('Erro ao suspender usuário:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor',
        errors: [error.message || 'Erro ao suspender usuário']
      });
    }
  }

  async reactivateUser(req, res) {
    try {
      const { id } = req.params;

      // Verificar permissão
      if (!statusService.canPerformAction(req.user, 'reativar')) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado',
          errors: ['Você não tem permissão para reativar usuários']
        });
      }

      const usuario = await usuarioRepository.findById(id);
      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado',
          errors: ['Usuário não existe']
        });
      }

      let resultado;
      if (usuario.status === 'suspenso') {
        resultado = await statusService.reactivateSuspendedUser(id, req.user.id);
      } else if (usuario.status === 'inativo') {
        resultado = await statusService.reactivateInactiveUser(id, req.user.id);
      } else {
        return res.status(400).json({
          success: false,
          message: `Não é possível reativar usuário com status ${usuario.status}`,
          errors: [`Usuário deve estar suspenso ou inativo para ser reativado`]
        });
      }

      res.json({
        success: true,
        message: 'Usuário reativado com sucesso',
        data: resultado
      });
    } catch (error) {
      console.error('Erro ao reativar usuário:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor',
        errors: [error.message || 'Erro ao reativar usuário']
      });
    }
  }

  async reactivateAndUpdate(req, res) {
    try {
      const { id } = req.params;
      const { nome, tipo } = req.body;

      // Verificar permissão
      if (!statusService.canPerformAction(req.user, 'reativar')) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado',
          errors: ['Você não tem permissão para reativar usuários']
        });
      }

      // Verificar se usuário existe e está inativo
      const usuario = await usuarioRepository.findById(id);
      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado',
          errors: ['Usuário não existe']
        });
      }

      if (usuario.status !== 'inativo') {
        return res.status(400).json({
          success: false,
          message: 'Usuário não está inativo',
          errors: ['Apenas usuários inativos podem ser reativados com atualização']
        });
      }

      // Reativar usuário
      await statusService.reactivateInactiveUser(id, req.user.id);

      // Atualizar dados do usuário se fornecidos
      const updateData = {};
      if (nome && nome.trim()) updateData.nome = nome.trim();
      if (tipo && tipo.trim()) updateData.tipo = tipo.trim();

      if (Object.keys(updateData).length > 0) {
        await usuarioRepository.update(id, updateData);
      }

      // Gerar token de ativação e definir status como aprovado
      const crypto = require('crypto');
      const tokenAtivacao = crypto.randomUUID();

      await usuarioRepository.updateApprovalStatus(
        id,
        'aprovado',
        tokenAtivacao,
        req.user.id
      );

      // Enviar email de ativação
      const usuarioAtualizado = await usuarioRepository.findById(id);
      await emailService.sendApprovalEmail(
        usuarioAtualizado.email,
        usuarioAtualizado.nome,
        tokenAtivacao
      );

      res.json({
        success: true,
        message: 'Usuário reativado com sucesso. Email de ativação enviado.',
        data: usuarioAtualizado.toJSON()
      });
    } catch (error) {
      console.error('Erro ao reativar e atualizar usuário:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor',
        errors: [error.message || 'Erro ao reativar usuário']
      });
    }
  }

  async getUserStatusHistory(req, res) {
    try {
      const { id } = req.params;
      const { limit = 10 } = req.query;

      const historico = await statusService.getUserStatusHistory(id, parseInt(limit));

      res.json({
        success: true,
        data: historico
      });
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        errors: ['Erro ao buscar histórico de status']
      });
    }
  }

  async getStatusStatistics(req, res) {
    try {
      const estatisticas = await statusService.getStatusStatistics();

      res.json({
        success: true,
        data: estatisticas
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        errors: ['Erro ao buscar estatísticas de status']
      });
    }
  }
}

module.exports = new UsuarioController();