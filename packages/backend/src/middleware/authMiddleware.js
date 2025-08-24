const jwt = require('jsonwebtoken');
const UsuarioRepository = require('../repository/usuarioRepository');

const usuarioRepository = new UsuarioRepository();
const JWT_SECRET = process.env.JWT_SECRET || 'casa-mais-secret-key';

// Middleware para verificar autenticação
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso requerido',
        errors: ['Token não fornecido']
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Buscar usuário para verificar se ainda está ativo
    const usuario = await usuarioRepository.findById(decoded.id);
    
    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido',
        errors: ['Usuário não encontrado']
      });
    }

    req.user = usuario;
    next();
  } catch (error) {
    console.error('Erro na verificação do token:', error);
    res.status(401).json({
      success: false,
      message: 'Token inválido',
      errors: ['Token inválido ou expirado']
    });
  }
};

// Middleware para verificar se é administrador
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Usuário não autenticado',
      errors: ['Faça login para continuar']
    });
  }

  if (req.user.tipo !== 'Administrador' && req.user.tipo !== 'administrador' && req.user.tipo !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado',
      errors: ['Apenas administradores podem acessar esta funcionalidade']
    });
  }

  next();
};

// Middleware para verificar se é admin ou operador
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Usuário não autenticado',
      errors: ['Faça login para continuar']
    });
  }

  const tiposPermitidos = ['Administrador', 'administrador', 'Operador', 'operador', 'admin'];
  if (!tiposPermitidos.includes(req.user.tipo)) {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado',
      errors: ['Usuário não tem permissão para acessar esta funcionalidade']
    });
  }

  next();
};

module.exports = {
  verifyToken,
  requireAdmin,
  requireAuth
};