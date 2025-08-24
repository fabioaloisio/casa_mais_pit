// Type definitions and interfaces shared between frontend and backend
// This can be expanded for TypeScript support in the future

export const EntityTypes = {
  ASSISTIDA: 'assistida',
  DOADOR: 'doador',
  MEDICAMENTO: 'medicamento',
  DOACAO: 'doacao',
  DESPESA: 'despesa',
  UNIDADE_MEDIDA: 'unidadeMedida',
  TIPO_DESPESA: 'tipoDespesa'
};

export const DoadorTypes = {
  PESSOA_FISICA: 'PF',
  PESSOA_JURIDICA: 'PJ'
};

export const ResponseStatus = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning'
};