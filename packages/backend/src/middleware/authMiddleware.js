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

// Níveis de acesso conforme especificação ERS
const ROLES = {
  ADMINISTRADOR: 'Administrador',
  FINANCEIRO: 'Financeiro',
  COLABORADOR: 'Colaborador'
};

// Mapeamento de permissões por funcionalidade conforme ERS
const PERMISSIONS = {
  // Requisitos Básicos
  RF_B1: [ROLES.ADMINISTRADOR, ROLES.COLABORADOR], // Gerenciar Assistidas
  RF_B2: [ROLES.ADMINISTRADOR, ROLES.COLABORADOR], // Gerenciar Tipos de Substâncias
  RF_B3: [ROLES.ADMINISTRADOR],                     // Gerenciar Doadores
  RF_B4: [ROLES.ADMINISTRADOR, ROLES.COLABORADOR], // Gerenciar Medicamentos
  RF_B5: [ROLES.ADMINISTRADOR, ROLES.COLABORADOR], // Gerenciar Unidades de Medida
  RF_B6: [ROLES.ADMINISTRADOR, ROLES.FINANCEIRO],  // Gerenciar Doações
  RF_B7: [ROLES.ADMINISTRADOR, ROLES.FINANCEIRO],  // Gerenciar Tipos de Despesas
  
  // Requisitos Funcionais
  RF_F1: [ROLES.ADMINISTRADOR, ROLES.COLABORADOR], // Efetuar Entrada na Instituição
  RF_F2: [ROLES.ADMINISTRADOR, ROLES.COLABORADOR], // Efetuar Saída da Instituição
  RF_F3: [ROLES.ADMINISTRADOR, ROLES.FINANCEIRO],  // Gerenciar Despesas
  RF_F4: [ROLES.ADMINISTRADOR, ROLES.FINANCEIRO],  // Lançar Doação Monetária
  RF_F5: [ROLES.ADMINISTRADOR, ROLES.FINANCEIRO],  // Atualizar Caixa
  RF_F6: [ROLES.ADMINISTRADOR, ROLES.COLABORADOR], // Gerenciar Consultas
  RF_F7: [ROLES.ADMINISTRADOR, ROLES.COLABORADOR], // Lançar Prescrição
  RF_F8: [ROLES.ADMINISTRADOR, ROLES.COLABORADOR], // Lançar História Patológica
  RF_F9: [ROLES.ADMINISTRADOR, ROLES.COLABORADOR], // Registrar Dados Pós-Consulta
  
  // Requisitos de Sistema (Relatórios)
  RF_S1: [ROLES.ADMINISTRADOR, ROLES.COLABORADOR], // Relatório de Assistidas
  RF_S2: [ROLES.ADMINISTRADOR],                     // Relatório de Despesas
  RF_S3: [ROLES.ADMINISTRADOR, ROLES.COLABORADOR], // Relatório de Consultas
  RF_S4: [ROLES.ADMINISTRADOR],                     // Relatório de Doações
  RF_S5: [ROLES.ADMINISTRADOR, ROLES.COLABORADOR], // Relatório de Medicamentos
  RF_S6: [ROLES.ADMINISTRADOR, ROLES.COLABORADOR], // Relatório de Internações
  RF_S7: [ROLES.ADMINISTRADOR]                      // Relatório de Doadores
};

// Normaliza o tipo de usuário para o formato padrão
const normalizeUserType = (type) => {
  if (!type) return null;
  
  const typeUpper = type.toUpperCase();
  
  // Mapeamento de tipos antigos para novos
  if (typeUpper === 'ADMIN' || typeUpper === 'ADMINISTRADOR') {
    return ROLES.ADMINISTRADOR;
  }
  if (typeUpper === 'FINANCEIRO') {
    return ROLES.FINANCEIRO;
  }
  if (typeUpper === 'OPERADOR' || typeUpper === 'COLABORADOR') {
    return ROLES.COLABORADOR;
  }
  
  return null;
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

  const userRole = normalizeUserType(req.user.tipo);
  
  if (userRole !== ROLES.ADMINISTRADOR) {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado',
      errors: ['Apenas administradores podem acessar esta funcionalidade']
    });
  }

  next();
};

// Middleware genérico para verificar múltiplos níveis de acesso
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
        errors: ['Faça login para continuar']
      });
    }

    const userRole = normalizeUserType(req.user.tipo);
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado',
        errors: [`Esta funcionalidade requer um dos seguintes níveis de acesso: ${allowedRoles.join(', ')}`]
      });
    }

    next();
  };
};

// Middleware para verificar permissão por código de requisito
const requirePermission = (requirementCode) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
        errors: ['Faça login para continuar']
      });
    }

    const userRole = normalizeUserType(req.user.tipo);
    const allowedRoles = PERMISSIONS[requirementCode];
    
    if (!allowedRoles) {
      console.error(`Código de requisito inválido: ${requirementCode}`);
      return res.status(500).json({
        success: false,
        message: 'Erro de configuração de permissões',
        errors: ['Permissão não configurada para esta funcionalidade']
      });
    }
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado',
        errors: [`Você não tem permissão para acessar: ${requirementCode}`]
      });
    }

    next();
  };
};

// Mantém compatibilidade com código existente
const requireAuth = requireRole([ROLES.ADMINISTRADOR, ROLES.COLABORADOR]);

module.exports = {
  verifyToken,
  requireAdmin,
  requireAuth,
  requireRole,
  requirePermission,
  ROLES,
  PERMISSIONS
};