// Níveis de acesso unificados para todo o sistema
const ROLES = {
  ADMINISTRADOR: 'Administrador',
  FINANCEIRO: 'Financeiro',
  COLABORADOR: 'Colaborador'
};

// Mapeamento de valores antigos para compatibilidade
const ROLE_ALIASES = {
  'admin': ROLES.ADMINISTRADOR,
  'operador': ROLES.COLABORADOR,
  'usuario': ROLES.COLABORADOR
};

// Mapeamento de permissões por funcionalidade conforme ERS
const PERMISSIONS = {
  // Requisitos Básicos
  RF_B1: [ROLES.ADMINISTRADOR, ROLES.COLABORADOR], // Gerenciar Assistidas
  RF_B2: [ROLES.ADMINISTRADOR, ROLES.COLABORADOR], // Gerenciar Tipos de Substâncias
  RF_B3: [ROLES.ADMINISTRADOR, ROLES.FINANCEIRO],  // Gerenciar Doadores
  RF_B4: [ROLES.ADMINISTRADOR, ROLES.COLABORADOR], // Gerenciar Medicamentos
  RF_B5: [ROLES.ADMINISTRADOR, ROLES.COLABORADOR], // Gerenciar Unidades de Medida
  RF_B6: [ROLES.ADMINISTRADOR, ROLES.FINANCEIRO],  // Gerenciar Doações
  RF_B7: [ROLES.ADMINISTRADOR, ROLES.FINANCEIRO],  // Gerenciar Tipos de Despesas
  RF_B8: [ROLES.ADMINISTRADOR, ROLES.COLABORADOR], // Gerenciar Médicos
  RF_B9: [ROLES.ADMINISTRADOR],                     // Gerenciar Usuários
  RF_B10: [ROLES.ADMINISTRADOR, ROLES.COLABORADOR], // Gerenciar Internações
  RF_B11: [ROLES.ADMINISTRADOR, ROLES.COLABORADOR], // Gerenciar Consultas
  RF_B12: [ROLES.ADMINISTRADOR, ROLES.FINANCEIRO], // Gerenciar Movimentações de Caixa
  RF_B14: [ROLES.ADMINISTRADOR, ROLES.FINANCEIRO], // Gerar Relatório Completo

  // Requisitos Intermediários
  RF_I1: [ROLES.ADMINISTRADOR], // Configurar Sistema
  RF_I2: [ROLES.ADMINISTRADOR, ROLES.FINANCEIRO, ROLES.COLABORADOR], // Gerar Relatórios
  RF_I3: [ROLES.ADMINISTRADOR], // Gerenciar Backup
  RF_I4: [ROLES.ADMINISTRADOR], // Auditoria
  RF_I5: [ROLES.ADMINISTRADOR, ROLES.FINANCEIRO, ROLES.COLABORADOR], // Dashboard
  RF_I6: [ROLES.ADMINISTRADOR, ROLES.FINANCEIRO], // Integração Contábil
  RF_I7: [ROLES.ADMINISTRADOR, ROLES.COLABORADOR], // Agenda de Consultas
  RF_I8: [ROLES.ADMINISTRADOR, ROLES.COLABORADOR], // Histórico Médico
  RF_I9: [ROLES.ADMINISTRADOR, ROLES.FINANCEIRO], // Controle de Estoque
  RF_I10: [ROLES.ADMINISTRADOR, ROLES.COLABORADOR], // Comunicação

  // Requisitos Avançados
  RF_A1: [ROLES.ADMINISTRADOR], // BI e Analytics
  RF_A2: [ROLES.ADMINISTRADOR], // API Externa
  RF_A3: [ROLES.ADMINISTRADOR, ROLES.COLABORADOR], // Mobile App
  RF_A4: [ROLES.ADMINISTRADOR], // Integração Governo
  RF_A5: [ROLES.ADMINISTRADOR], // Machine Learning
  RF_A6: [ROLES.ADMINISTRADOR], // Telemedicina
  RF_A7: [ROLES.ADMINISTRADOR], // Gestão de Voluntários
  RF_A8: [ROLES.ADMINISTRADOR], // CRM Doadores
  RF_A9: [ROLES.ADMINISTRADOR], // Gestão de Projetos
  RF_A10: [ROLES.ADMINISTRADOR], // Portal Transparência

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
  RF_F10: [ROLES.ADMINISTRADOR, ROLES.FINANCEIRO], // Gerenciar Campanha de Arrecadação

  // Requisitos de Sistema (Relatórios)
  RF_S1: [ROLES.ADMINISTRADOR, ROLES.COLABORADOR], // Relatório de Assistidas
  RF_S2: [ROLES.ADMINISTRADOR, ROLES.FINANCEIRO],  // Relatório de Despesas
  RF_S3: [ROLES.ADMINISTRADOR, ROLES.COLABORADOR], // Relatório de Consultas
  RF_S4: [ROLES.ADMINISTRADOR, ROLES.FINANCEIRO],  // Relatório de Doações
  RF_S5: [ROLES.ADMINISTRADOR, ROLES.COLABORADOR], // Relatório de Medicamentos
  RF_S6: [ROLES.ADMINISTRADOR, ROLES.COLABORADOR], // Relatório de Internações
  RF_S7: [ROLES.ADMINISTRADOR, ROLES.FINANCEIRO],  // Relatório de Doadores
  RF_S8: [ROLES.ADMINISTRADOR, ROLES.FINANCEIRO]   // Relatório de Campanhas de Arrecadação
};

// Funções helper para verificação de roles
const isAdmin = (role) => {
  return role === ROLES.ADMINISTRADOR || role === 'admin';
};

const isFinanceiro = (role) => {
  return role === ROLES.FINANCEIRO;
};

const isColaborador = (role) => {
  return role === ROLES.COLABORADOR || role === 'operador' || role === 'usuario';
};

// Função para normalizar role
const normalizeRole = (role) => {
  return ROLE_ALIASES[role] || role;
};

// Função para verificar permissão
const hasPermission = (userRole, permission) => {
  const normalizedRole = normalizeRole(userRole);
  const allowedRoles = PERMISSIONS[permission] || [];
  return allowedRoles.includes(normalizedRole);
};

// Função para obter todas as permissões de um role
const getRolePermissions = (role) => {
  const normalizedRole = normalizeRole(role);
  const permissions = [];

  for (const [permission, allowedRoles] of Object.entries(PERMISSIONS)) {
    if (allowedRoles.includes(normalizedRole)) {
      permissions.push(permission);
    }
  }

  return permissions;
};

// CommonJS exports
module.exports = {
  ROLES,
  ROLE_ALIASES,
  PERMISSIONS,
  isAdmin,
  isFinanceiro,
  isColaborador,
  normalizeRole,
  hasPermission,
  getRolePermissions
};