// Type definitions and interfaces shared between frontend and backend
// This can be expanded for TypeScript support in the future

const EntityTypes = {
  ASSISTIDA: 'assistida',
  DOADOR: 'doador',
  MEDICAMENTO: 'medicamento',
  DOACAO: 'doacao',
  DESPESA: 'despesa',
  UNIDADE_MEDIDA: 'unidadeMedida',
  TIPO_DESPESA: 'tipoDespesa'
};

const DoadorTypes = {
  PESSOA_FISICA: 'PF',
  PESSOA_JURIDICA: 'PJ'
};

const ResponseStatus = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning'
};

// CommonJS exports
module.exports = {
  EntityTypes,
  DoadorTypes,
  ResponseStatus
};