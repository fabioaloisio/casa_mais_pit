import {
  ROLES,
  ROLE_ALIASES,
  isAdmin,
  isFinanceiro,
  isColaborador,
  normalizeRole
} from '@casa-mais/shared';

// Mapeamento entre tipos do banco e tipos de exibição
export const mapUserType = (dbType) => {
  return normalizeRole(dbType) || dbType;
};

// Função inversa - do frontend para o banco
export const mapUserTypeToDb = (displayType) => {
  // Sistema agora usa os mesmos valores no banco e frontend
  return displayType;
};

// Re-exportar funções de verificação do shared
export const isAdminType = isAdmin;
export const isFinanceiroType = isFinanceiro;
export const isColaboradorType = isColaborador;

// Exportar constantes para compatibilidade
export { ROLES, ROLE_ALIASES };