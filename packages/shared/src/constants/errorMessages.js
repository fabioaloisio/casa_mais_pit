// Error messages constants shared between frontend and backend
// Centralized place for all validation and error messages

const ERROR_MESSAGES = {
  // Form validation errors
  REQUIRED_FIELD: "Campo obrigatório",

  // CPF validation errors
  INVALID_CPF: "CPF inválido. Por favor, verifique o número digitado.",
  CPF_ALREADY_EXISTS: "Este CPF já está cadastrado.",

  // CNPJ validation errors
  INVALID_CNPJ: "CNPJ inválido. Por favor, verifique o número digitado.",
  CNPJ_ALREADY_EXISTS: "Este CNPJ já está cadastrado.",

  // Age validation errors
  MINIMUM_AGE_REQUIRED: "A assistida deve ter no mínimo 18 anos.",

  // Generic API errors
  INTERNAL_SERVER_ERROR: "Erro interno do servidor. Tente novamente mais tarde.",
  VALIDATION_ERROR: "dados inválidos",
  NOT_FOUND: "Registro não encontrado",
  UNAUTHORIZED: "Acesso não autorizado",
  FORBIDDEN: "Você não tem permissão para realizar esta ação",

  // Specific entity not found errors
  ASSISTIDA_NOT_FOUND: "Assistida não encontrada",
  USUARIO_NOT_FOUND: "Usuário não encontrado",
  DOADOR_NOT_FOUND: "Doador não encontrado",
  DOACAO_NOT_FOUND: "Doação não encontrada",
  DESPESA_NOT_FOUND: "Despesa não encontrada",
  CONSULTA_NOT_FOUND: "Consulta não encontrada",
  MEDICAMENTO_NOT_FOUND: "Medicamento não encontrado",
  SUBSTANCIA_NOT_FOUND: "Substância não encontrada",
  TIPO_DESPESA_NOT_FOUND: "Tipo de despesa não encontrado",
  UNIDADE_MEDIDA_NOT_FOUND: "Unidade de medida não encontrada",
  TOKEN_NOT_FOUND: "Token de ativação não encontrado",

  // Network errors
  NETWORK_ERROR: "Erro de conexão. Verifique sua internet e tente novamente.",
  TIMEOUT_ERROR: "Tempo limite excedido. Tente novamente.",

  // Success messages
  SUCCESS_CREATE: "Cadastro realizado com sucesso",
  SUCCESS_UPDATE: "Atualização realizada com sucesso",
  SUCCESS_DELETE: "Exclusão realizada com sucesso",

  // Confirmation messages
  CONFIRM_DELETE: "Tem certeza que deseja excluir este registro?",
  CONFIRM_UPDATE: "Tem certeza que deseja atualizar este registro?",
};

// Helper function to get error message by key
function getErrorMessage(key, fallbackMessage = "Erro desconhecido") {
  return ERROR_MESSAGES[key] || fallbackMessage;
}

// Helper function for field validation errors
function getFieldError(fieldName, errorType = 'REQUIRED_FIELD') {
  return ERROR_MESSAGES[errorType] || ERROR_MESSAGES.REQUIRED_FIELD;
}

// CommonJS exports
module.exports = {
  ERROR_MESSAGES,
  getErrorMessage,
  getFieldError
};