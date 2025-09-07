const bcrypt = require('bcrypt');
const UsuarioRepository = require('../repository/usuarioRepository');
const Usuario = require('../models/usuario');

const usuarioRepository = new UsuarioRepository();
const SALT_ROUNDS = 10;

class UsuarioController {
  async listarTodos(req, res) {
    try {
      const usuarios = await usuarioRepository.getAllActive();
      
      res.json({
        success: true,
        data: usuarios.map(u => u.toJSON())
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
      if (!senha?.trim()) errors.push('Senha é obrigatória');
      if (!tipo?.trim()) errors.push('Tipo é obrigatório');
      
      if (senha && senha.length < 6) {
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

      // Verificar se email já existe
      const emailExiste = await usuarioRepository.emailExists(email);
      
      if (emailExiste) {
        return res.status(400).json({
          success: false,
          message: 'Email já está em uso',
          errors: ['Este email já está cadastrado']
        });
      }

      // Hash da senha
      const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);

      // Criar usuário
      const novoUsuario = new Usuario({
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        senha: senhaHash,
        tipo: tipo || 'Colaborador'
      });

      const usuarioCriado = await usuarioRepository.create(novoUsuario);

      res.status(201).json({
        success: true,
        message: 'Usuário cadastrado com sucesso',
        data: usuarioCriado.toJSON()
      });
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

      // Soft delete - apenas desativa o usuário
      await usuarioRepository.softDelete(id);

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
}

module.exports = new UsuarioController();