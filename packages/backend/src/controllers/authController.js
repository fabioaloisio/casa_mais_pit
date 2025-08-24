const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UsuarioRepository = require('../repository/usuarioRepository');
const Usuario = require('../models/usuario');

const usuarioRepository = new UsuarioRepository();
const JWT_SECRET = process.env.JWT_SECRET || 'casa-mais-secret-key';
const SALT_ROUNDS = 10;

class AuthController {
  async login(req, res) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({
          success: false,
          message: 'Email e senha são obrigatórios',
          errors: ['Email e senha são obrigatórios']
        });
      }

      // Buscar usuário por email
      const usuario = await usuarioRepository.findByEmail(email);
      
      if (!usuario) {
        return res.status(401).json({
          success: false,
          message: 'Credenciais inválidas',
          errors: ['Email ou senha incorretos']
        });
      }

      // Verificar senha
      const senhaValida = await bcrypt.compare(senha, usuario.senha);
      
      if (!senhaValida) {
        return res.status(401).json({
          success: false,
          message: 'Credenciais inválidas',
          errors: ['Email ou senha incorretos']
        });
      }

      // Gerar token JWT
      const token = jwt.sign(
        { 
          id: usuario.id, 
          email: usuario.email, 
          tipo: usuario.tipo 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          usuario: usuario.toJSON(),
          token
        }
      });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        errors: ['Erro interno do servidor']
      });
    }
  }

  async register(req, res) {
    try {
      const { nome, email, senha, confirmSenha } = req.body;

      // Validações básicas
      const errors = [];
      
      if (!nome) errors.push('Nome é obrigatório');
      if (!email) errors.push('Email é obrigatório');
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

      // Verificar se é o primeiro usuário no sistema (será administrador)
      const primeiroUsuario = await usuarioRepository.isFirstUser();
      
      // Criar usuário
      const novoUsuario = new Usuario({
        nome,
        email,
        senha: senhaHash,
        tipo: primeiroUsuario ? 'admin' : 'usuario'
      });

      const usuarioCriado = await usuarioRepository.create(novoUsuario);

      // Gerar token JWT
      const token = jwt.sign(
        { 
          id: usuarioCriado.id, 
          email: usuarioCriado.email, 
          tipo: usuarioCriado.tipo 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        success: true,
        message: 'Usuário cadastrado com sucesso',
        data: {
          usuario: usuarioCriado.toJSON(),
          token
        }
      });
    } catch (error) {
      console.error('Erro no cadastro:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        errors: ['Erro interno do servidor']
      });
    }
  }

  async me(req, res) {
    try {
      res.json({
        success: true,
        data: {
          usuario: req.user.toJSON()
        }
      });
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        errors: ['Erro interno do servidor']
      });
    }
  }
}

module.exports = new AuthController();