// Mapeamento entre tipos do banco e tipos de exibição
export const mapUserType = (dbType) => {
  const typeMap = {
    'admin': 'Administrador',
    'operador': 'Operador',
    'usuario': 'Usuario',
    // Manter compatibilidade com tipos antigos
    'Administrador': 'Administrador',
    'Operador': 'Operador'
  };
  
  return typeMap[dbType] || dbType;
};

// Função inversa - do frontend para o banco
export const mapUserTypeToDb = (displayType) => {
  const typeMap = {
    'Administrador': 'admin',
    'Operador': 'operador',
    'Usuario': 'usuario'
  };
  
  return typeMap[displayType] || displayType;
};

// Verificar se é administrador
export const isAdminType = (type) => {
  return type === 'admin' || type === 'Administrador' || type === 'administrador';
};

// Verificar se é operador
export const isOperatorType = (type) => {
  return type === 'operador' || type === 'Operador';
};