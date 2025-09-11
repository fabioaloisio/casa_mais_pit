// Mapeamento entre tipos do banco e tipos de exibição
export const mapUserType = (dbType) => {
  // Sistema usa os valores diretamente agora
  const typeMap = {
    // Novos valores do banco
    'Administrador': 'Administrador',
    'Financeiro': 'Financeiro',
    'Colaborador': 'Colaborador',
    // Compatibilidade com valores antigos (caso existam no banco)
    'admin': 'Administrador',
    'operador': 'Colaborador',
    'usuario': 'Colaborador'
  };
  
  return typeMap[dbType] || dbType;
};

// Função inversa - do frontend para o banco
export const mapUserTypeToDb = (displayType) => {
  // Sistema agora usa os mesmos valores no banco e frontend
  return displayType;
};

// Verificar se é administrador
export const isAdminType = (type) => {
  return type === 'Administrador' || type === 'admin';
};

// Verificar se é financeiro
export const isFinanceiroType = (type) => {
  return type === 'Financeiro';
};

// Verificar se é colaborador
export const isColaboradorType = (type) => {
  return type === 'Colaborador' || type === 'operador' || type === 'usuario';
};