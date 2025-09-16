// Helpers para respostas padronizadas da API

const success = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const error = (res, message, errors = [], statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors: Array.isArray(errors) ? errors : [errors]
  });
};

const created = (res, message, data = null) => {
  return success(res, message, data, 201);
};

const badRequest = (res, message, errors = []) => {
  return error(res, message, errors, 400);
};

const unauthorized = (res, message = 'Não autorizado', errors = []) => {
  return error(res, message, errors, 401);
};

const forbidden = (res, message = 'Acesso negado', errors = []) => {
  return error(res, message, errors, 403);
};

const notFound = (res, message = 'Recurso não encontrado', errors = []) => {
  return error(res, message, errors, 404);
};

const serverError = (res, message = 'Erro interno do servidor', errors = []) => {
  return error(res, message, errors, 500);
};

// Wrapper para tratamento de erros em controllers
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      console.error('Erro capturado:', err);
      serverError(res, 'Erro ao processar requisição', [err.message]);
    });
  };
};

// Validação de campos obrigatórios
const validateRequired = (data, requiredFields) => {
  const errors = [];
  
  for (const field of requiredFields) {
    if (!data[field]) {
      errors.push(`Campo ${field} é obrigatório`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Formatação de datas para o padrão brasileiro
const formatDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR');
};

const formatDateTime = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return d.toLocaleString('pt-BR');
};

// Paginação
const paginate = (query, defaultLimit = 20, maxLimit = 100) => {
  const page = parseInt(query.page) || 1;
  let limit = parseInt(query.limit) || defaultLimit;
  
  // Limitar o máximo de registros
  if (limit > maxLimit) {
    limit = maxLimit;
  }
  
  const offset = (page - 1) * limit;
  
  return {
    page,
    limit,
    offset
  };
};

// Resposta paginada
const paginatedResponse = (res, data, total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  
  return res.status(200).json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  });
};

module.exports = {
  success,
  error,
  created,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  serverError,
  asyncHandler,
  validateRequired,
  formatDate,
  formatDateTime,
  paginate,
  paginatedResponse
};