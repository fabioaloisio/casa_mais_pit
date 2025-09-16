// Backend-specific messages that need to be centralized
// This extends the main errorMessages.js file

const BACKEND_MESSAGES = {
  // ========== SUCCESS MESSAGES ==========
  SUCCESS: {
    // User Management
    USER_REGISTERED: "Cadastro realizado com sucesso. Aguarde aprovação do administrador.",
    USER_CREATED: "Usuário cadastrado com sucesso",
    USER_APPROVED: "Usuário aprovado com sucesso",
    USER_REJECTED: "Usuário rejeitado",
    USER_ACTIVATED: "Conta ativada com sucesso",
    USER_DEACTIVATED: "Usuário desativado com sucesso",
    USER_UPDATED: "Usuário atualizado com sucesso",
    USER_DELETED: "Usuário removido com sucesso",
    ADMIN_CREATED: "Administrador cadastrado com sucesso",
    ACTIVATION_EMAIL_SENT: "Email de ativação reenviado com sucesso",
    PASSWORD_RESET_SENT: "Email de recuperação de senha enviado",
    PASSWORD_UPDATED: "Senha atualizada com sucesso",

    // Assistidas
    ASSISTIDA_CREATED: "Assistida cadastrada com sucesso",
    ASSISTIDA_UPDATED: "Assistida atualizada com sucesso",
    ASSISTIDA_DELETED: "Assistida excluída com sucesso",
    ASSISTIDA_ADMISSION: "Entrada registrada com sucesso",
    ASSISTIDA_DISCHARGE: "Saída registrada com sucesso",

    // Internações
    INTERNACAO_CREATED: "Internação registrada com sucesso",
    INTERNACAO_UPDATED: "Internação atualizada com sucesso",
    INTERNACAO_FINISHED: "Internação finalizada com sucesso",

    // Consultas
    CONSULTA_SCHEDULED: "Consulta agendada com sucesso",
    CONSULTA_UPDATED: "Consulta atualizada com sucesso",
    CONSULTA_CANCELLED: "Consulta cancelada com sucesso",
    CONSULTA_COMPLETED: "Consulta realizada com sucesso",
    CONSULTA_RETRIEVED: "Consulta obtida com sucesso",
    CONSULTAS_LISTED: "Consultas listadas com sucesso",
    CONSULTA_STATISTICS_RETRIEVED: "Estatísticas obtidas com sucesso",
    POST_CONSULTATION_REGISTERED: "Dados pós-consulta registrados com sucesso",
    PRESCRIPTION_REGISTERED: "Prescrição registrada com sucesso",
    PRESCRIPTION_LAUNCHED: "Prescrição lançada com sucesso",
    PATHOLOGY_REGISTERED: "História patológica registrada com sucesso",
    PATHOLOGY_LAUNCHED: "História patológica lançada com sucesso",

    // Financial
    DOACAO_CREATED: "Doação cadastrada com sucesso",
    DOACAO_UPDATED: "Doação atualizada com sucesso",
    DOACAO_DELETED: "Doação excluída com sucesso",
    MONETARY_DONATION_CREATED: "Doação monetária lançada com sucesso",
    DESPESA_CREATED: "Despesa cadastrada com sucesso",
    DESPESA_UPDATED: "Despesa atualizada com sucesso",
    DESPESA_DELETED: "Despesa excluída com sucesso",
    CAIXA_UPDATED: "Caixa atualizado com sucesso",
    CAIXA_CLOSED: "Caixa fechado com sucesso",
    CAIXA_BALANCE_RETRIEVED: "Saldo obtido com sucesso",
    CAIXA_STATISTICS_RETRIEVED: "Estatísticas obtidas com sucesso",
    CAIXA_EXTRACT_GENERATED: "Extrato gerado com sucesso",
    CAIXA_MOVEMENTS_LISTED: "Movimentações listadas com sucesso",
    CAIXA_RECENT_MOVEMENTS_LISTED: "Movimentações recentes listadas com sucesso",

    // Doadores
    DOADOR_CREATED: "Doador cadastrado com sucesso",
    DOADOR_UPDATED: "Doador atualizado com sucesso",
    DOADOR_DELETED: "Doador removido com sucesso",

    // Medicamentos
    MEDICAMENTO_CREATED: "Medicamento cadastrado com sucesso",
    MEDICAMENTO_UPDATED: "Medicamento atualizado com sucesso",
    MEDICAMENTO_DELETED: "Medicamento excluído com sucesso",

    // Substâncias
    SUBSTANCIA_CREATED: "Substância cadastrada com sucesso",
    SUBSTANCIA_UPDATED: "Substância atualizada com sucesso",
    SUBSTANCIA_DELETED: "Substância excluída com sucesso",

    // Tipos de Despesa
    TIPO_DESPESA_CREATED: "Tipo de despesa cadastrado com sucesso",
    TIPO_DESPESA_UPDATED: "Tipo de despesa atualizado com sucesso",
    TIPO_DESPESA_DELETED: "Tipo de despesa excluído com sucesso",

    // Unidades de Medida
    UNIDADE_MEDIDA_CREATED: "Unidade de medida cadastrada com sucesso",
    UNIDADE_MEDIDA_UPDATED: "Unidade de medida atualizada com sucesso",
    UNIDADE_MEDIDA_DELETED: "Unidade de medida excluída com sucesso",

    // Especialidades
    ESPECIALIDADES_LISTED: "Especialidades listadas com sucesso",

    // Generic
    OPERATION_SUCCESS: "Operação realizada com sucesso",
    DATA_RETRIEVED: "Dados obtidos com sucesso",
    DATA_LISTED: "Dados listados com sucesso"
  },

  // ========== ERROR MESSAGES ==========
  ERRORS: {
    // Authentication & Authorization
    INVALID_CREDENTIALS: "Credenciais inválidas",
    TOKEN_INVALID: "Token inválido",
    TOKEN_EXPIRED: "Token expirado",
    TOKEN_INVALID_OR_EXPIRED: "Token inválido ou expirado",
    TOKEN_REQUIRED: "Token de acesso requerido",
    TOKEN_VALID: "Token válido",
    ACCOUNT_ALREADY_ACTIVATED: "Conta já foi ativada",
    ACCOUNT_NOT_APPROVED: "Conta não está aprovada",
    USER_NOT_PENDING: "Usuário não está pendente de aprovação",
    USER_NOT_APPROVED: "Usuário não está aprovado",
    USER_NOT_AUTHENTICATED: "Usuário não autenticado",
    ACCESS_DENIED: "Acesso negado",
    PERMISSION_CONFIG_ERROR: "Erro de configuração de permissões",

    // Validation Errors
    REQUIRED_FIELDS_MISSING: "Campos obrigatórios não fornecidos",
    INVALID_DATA: "Dados inválidos",
    INVALID_EMAIL: "Email inválido",
    INVALID_DATE: "Data inválida",
    INVALID_VALUE: "Valor inválido",
    VALUE_MUST_BE_POSITIVE: "Valor deve ser maior que zero",
    DATE_CANNOT_BE_FUTURE: "Data não pode ser futura",
    END_DATE_BEFORE_START: "Data de fim deve ser posterior à data de início",

    // Business Rules
    ASSISTIDA_REQUIRED: "Assistida é obrigatória",
    ASSISTIDA_HAS_ACTIVE_INTERNACAO: "Assistida já possui internação ativa",
    DOCUMENTO_ALREADY_EXISTS: "Documento já cadastrado",
    EMAIL_ALREADY_EXISTS: "Email já cadastrado",
    CPF_ALREADY_EXISTS: "CPF já cadastrado",
    CNPJ_ALREADY_EXISTS: "CNPJ já cadastrado",
    INSUFFICIENT_BALANCE: "Saldo insuficiente",
    CANNOT_DELETE_IN_USE: "Não é possível excluir pois está em uso",
    INVALID_MOVEMENT_TYPE: "Tipo de movimentação inválido",
    DONATION_VALUE_REQUIRED: "Valor da doação é obrigatório e deve ser positivo",
    MOVEMENT_TYPE_VALUE_REQUIRED: "Tipo de movimentação e valor são obrigatórios",
    PERIOD_REQUIRED: "Período é obrigatório",
    EVOLUCAO_REQUIRED: "Evolução é obrigatória",
    HISTORIA_PATOLOGICA_REQUIRED: "História patológica é obrigatória",
    PRESCRICAO_REQUIRED: "Prescrição é obrigatória",
    INVALID_STATUS: "Status inválido",
    OPERATION_NOT_ALLOWED: "Operação não permitida",
    EMAIL_ALREADY_IN_USE: "Email já está em uso",

    // Required Fields Messages
    TIPO_DOADOR_REQUIRED: "Tipo de doador é obrigatório",
    NOME_REQUIRED: "Nome é obrigatório",
    DOCUMENTO_REQUIRED: "Documento é obrigatório",
    TELEFONE_REQUIRED: "Telefone é obrigatório",
    EMAIL_REQUIRED: "Email é obrigatório",
    VALOR_REQUIRED: "Valor é obrigatório",
    DATA_REQUIRED: "Data é obrigatória",
    DESCRICAO_REQUIRED: "Descrição é obrigatória",

    // List Operations
    ERROR_LISTING: "Erro ao listar dados",
    ERROR_RETRIEVING: "Erro ao obter dados",
    ERROR_CREATING: "Erro ao criar registro",
    ERROR_UPDATING: "Erro ao atualizar registro",
    ERROR_DELETING: "Erro ao excluir registro",

    // Specific Operations
    ERROR_APPROVE_USER: "Erro ao aprovar usuário",
    ERROR_REJECT_USER: "Erro ao rejeitar usuário",
    ERROR_ACTIVATE_ACCOUNT: "Erro ao ativar conta",
    ERROR_SEND_EMAIL: "Erro ao enviar email",
    ERROR_RESEND_EMAIL: "Erro ao reenviar email",
    ERROR_LIST_PENDING_USERS: "Erro ao listar usuários pendentes",
    ERROR_VALIDATE_TOKEN: "Erro ao validar token",
    ERROR_LIST_ESPECIALIDADES: "Erro ao listar especialidades",
    ERROR_UPDATE_MEDICAMENTO: "Erro ao atualizar medicamento",
    ERROR_UPDATE_UNIDADE_MEDIDA: "Erro ao atualizar unidade de medida",
    ERROR_LAUNCH_MONETARY_DONATION: "Erro ao lançar doação monetária",
    ERROR_UPDATE_CAIXA: "Erro ao atualizar caixa",
    ERROR_CLOSE_CAIXA: "Erro ao fechar caixa",
    ERROR_GENERATE_EXTRACT: "Erro ao gerar extrato",
    ERROR_LIST_MOVEMENTS: "Erro ao listar movimentações",
    ERROR_LIST_RECENT_MOVEMENTS: "Erro ao listar movimentações recentes",
    ERROR_GET_CAIXA_STATISTICS: "Erro ao obter estatísticas do caixa",
    ERROR_GET_CAIXA_BALANCE: "Erro ao obter saldo do caixa",
    ERROR_CREATE_CONSULTA: "Erro ao criar consulta",
    ERROR_UPDATE_CONSULTA: "Erro ao atualizar consulta",
    ERROR_CANCEL_CONSULTA: "Erro ao cancelar consulta",
    ERROR_GET_CONSULTA: "Erro ao buscar consulta",
    ERROR_LIST_CONSULTAS: "Erro ao listar consultas",
    ERROR_GET_CONSULTA_STATISTICS: "Erro ao buscar estatísticas de consultas",
    ERROR_REGISTER_POST_CONSULTATION: "Erro ao registrar dados pós-consulta",
    ERROR_LAUNCH_PRESCRIPTION: "Erro ao lançar prescrição",
    ERROR_LAUNCH_PATHOLOGY: "Erro ao lançar história patológica",

    // Database
    DATABASE_ERROR: "Erro no banco de dados",
    CONNECTION_ERROR: "Erro de conexão com o banco de dados",
    TRANSACTION_ERROR: "Erro na transação",

    // Generic
    INTERNAL_ERROR: "Erro interno do servidor",
    UNKNOWN_ERROR: "Erro desconhecido",
    OPERATION_FAILED: "Operação falhou"
  },

  // ========== INFO MESSAGES ==========
  INFO: {
    NO_DATA_FOUND: "Nenhum dado encontrado",
    NO_CHANGES_MADE: "Nenhuma alteração realizada",
    ALREADY_EXISTS: "Registro já existe",
    PROCESSING: "Processando solicitação",
    SENDING_EMAIL: "Enviando email",
    VALIDATING: "Validando dados",
    GENERATING_REPORT: "Gerando relatório"
  }
};

// Helper function to get message with fallback
function getBackendMessage(category, key, fallback = "Mensagem não definida") {
  if (BACKEND_MESSAGES[category] && BACKEND_MESSAGES[category][key]) {
    return BACKEND_MESSAGES[category][key];
  }
  return fallback;
}

// Specific helpers for common operations
function getSuccessMessage(key) {
  return getBackendMessage('SUCCESS', key, 'Operação realizada com sucesso');
}

function getErrorMessage(key) {
  return getBackendMessage('ERRORS', key, 'Erro ao processar solicitação');
}

function getInfoMessage(key) {
  return getBackendMessage('INFO', key, 'Processando');
}

// CommonJS exports
module.exports = {
  BACKEND_MESSAGES,
  getBackendMessage,
  getSuccessMessage,
  getErrorMessage,
  getInfoMessage
};