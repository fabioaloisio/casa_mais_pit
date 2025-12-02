// Validações de regras de negócio compartilhadas
const { ERROR_MESSAGES } = require('../constants/errorMessages');

/**
 * Valida idade mínima de uma assistida
 * @param {Date|string} dataNascimento - Data de nascimento
 * @param {number} idadeMinima - Idade mínima permitida (padrão: 18)
 * @returns {object} Objeto com status e mensagem de erro se houver
 */
const validarIdadeMinima = (dataNascimento, idadeMinima = 18) => {
  if (!dataNascimento) {
    return { isValid: false, message: 'Data de nascimento é obrigatória' };
  }

  const hoje = new Date();
  const nascimento = new Date(dataNascimento);

  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mesAtual = hoje.getMonth();
  const mesNascimento = nascimento.getMonth();

  if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }

  if (idade < idadeMinima) {
    return {
      isValid: false,
      message: ERROR_MESSAGES.MINIMUM_AGE_REQUIRED || `Idade mínima de ${idadeMinima} anos é requerida`
    };
  }

  return { isValid: true, idade };
};

/**
 * Valida status válidos de uma assistida
 * @param {string} status - Status a ser validado
 * @returns {boolean} True se o status é válido
 */
const validarStatusAssistida = (status) => {
  const statusValidos = ['ativa', 'inativa', 'alta', 'óbito', 'transferida'];
  return statusValidos.includes(status?.toLowerCase());
};

/**
 * Valida período de internação
 * @param {Date|string} dataEntrada - Data de entrada
 * @param {Date|string} dataSaida - Data de saída (opcional)
 * @returns {object} Objeto com status e mensagem de erro se houver
 */
const validarPeriodoInternacao = (dataEntrada, dataSaida = null) => {
  if (!dataEntrada) {
    return { isValid: false, message: 'Data de entrada é obrigatória' };
  }

  const entrada = new Date(dataEntrada);
  const hoje = new Date();

  // Data de entrada não pode ser futura
  if (entrada > hoje) {
    return { isValid: false, message: 'Data de entrada não pode ser futura' };
  }

  if (dataSaida) {
    const saida = new Date(dataSaida);

    // Data de saída não pode ser anterior à entrada
    if (saida < entrada) {
      return { isValid: false, message: 'Data de saída não pode ser anterior à data de entrada' };
    }

    // Calcular dias de internação
    const diasInternacao = Math.ceil((saida - entrada) / (1000 * 60 * 60 * 24));

    // Validar período máximo (exemplo: 365 dias)
    if (diasInternacao > 365) {
      return {
        isValid: false,
        message: 'Período de internação excede o máximo permitido (365 dias)'
      };
    }

    return { isValid: true, diasInternacao };
  }

  return { isValid: true };
};

/**
 * Valida horário de consulta
 * @param {string} horario - Horário no formato HH:MM
 * @returns {object} Objeto com status e mensagem de erro se houver
 */
const validarHorarioConsulta = (horario) => {
  if (!horario) {
    return { isValid: false, message: 'Horário é obrigatório' };
  }

  const regexHorario = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!regexHorario.test(horario)) {
    return { isValid: false, message: 'Horário inválido. Use o formato HH:MM' };
  }

  const [hora, minuto] = horario.split(':').map(Number);

  // Validar horário comercial (exemplo: 07:00 às 18:00)
  if (hora < 7 || hora >= 18) {
    return {
      isValid: false,
      message: 'Horário deve estar entre 07:00 e 18:00'
    };
  }

  return { isValid: true };
};

/**
 * Valida tipo de doação
 * @param {string} tipo - Tipo de doação
 * @returns {boolean} True se o tipo é válido
 */
const validarTipoDoacao = (tipo) => {
  const tiposValidos = ['dinheiro', 'medicamentos', 'suprimentos', 'outros'];
  return tiposValidos.includes(tipo?.toLowerCase());
};

/**
 * Valida tipo de despesa
 * @param {string} tipo - Tipo de despesa
 * @returns {boolean} True se o tipo é válido
 */
const validarTipoDespesa = (tipo) => {
  const tiposValidos = ['medicamentos', 'utilidades', 'manutenção', 'suprimentos', 'outros'];
  return tiposValidos.includes(tipo?.toLowerCase());
};

/**
 * Valida quantidade mínima em estoque
 * @param {number} quantidadeAtual - Quantidade atual em estoque
 * @param {number} quantidadeMinima - Quantidade mínima requerida
 * @returns {object} Objeto com status e alerta se necessário
 */
const validarEstoqueMinimo = (quantidadeAtual, quantidadeMinima) => {
  const atual = parseFloat(quantidadeAtual) || 0;
  const minima = parseFloat(quantidadeMinima) || 0;

  if (atual <= 0) {
    return {
      isValid: false,
      status: 'sem_estoque',
      message: 'Item sem estoque'
    };
  }

  if (atual < minima) {
    return {
      isValid: true,
      status: 'estoque_baixo',
      message: `Estoque baixo: ${atual} unidades (mínimo: ${minima})`
    };
  }

  return {
    isValid: true,
    status: 'estoque_normal'
  };
};

/**
 * Valida se uma data está dentro de um período válido
 * @param {Date|string} data - Data a ser validada
 * @param {Date|string} dataInicio - Data início do período
 * @param {Date|string} dataFim - Data fim do período
 * @returns {boolean} True se a data está dentro do período
 */
const validarDataNoPeriodo = (data, dataInicio, dataFim) => {
  const dataVerificar = new Date(data);
  const inicio = new Date(dataInicio);
  const fim = new Date(dataFim);

  return dataVerificar >= inicio && dataVerificar <= fim;
};

/**
 * Valida transição de status
 * @param {string} statusAtual - Status atual
 * @param {string} novoStatus - Novo status desejado
 * @returns {object} Objeto com status e mensagem de erro se houver
 */
const validarTransicaoStatus = (statusAtual, novoStatus) => {
  const transicoesValidas = {
    'pendente': ['ativa', 'cancelada'],
    'ativa': ['inativa', 'alta', 'óbito', 'transferida'],
    'inativa': ['ativa'],
    'alta': [],
    'óbito': [],
    'transferida': [],
    'cancelada': ['pendente']
  };

  const statusAtualLower = statusAtual?.toLowerCase();
  const novoStatusLower = novoStatus?.toLowerCase();

  if (!transicoesValidas[statusAtualLower]) {
    return { isValid: false, message: 'Status atual inválido' };
  }

  const permitidos = transicoesValidas[statusAtualLower];

  if (!permitidos.includes(novoStatusLower)) {
    return {
      isValid: false,
      message: `Transição de '${statusAtual}' para '${novoStatus}' não é permitida`
    };
  }

  return { isValid: true };
};

/**
 * Valida valor de doação/despesa
 * @param {number|string} valor - Valor a ser validado
 * @param {number} valorMaximo - Valor máximo permitido (opcional)
 * @returns {object} Objeto com status e mensagem de erro se houver
 */
const validarValorFinanceiro = (valor, valorMaximo = null) => {
  const valorNumerico = typeof valor === 'string'
    ? parseFloat(valor.replace(/[^\d,]/g, '').replace(',', '.'))
    : valor;

  if (isNaN(valorNumerico)) {
    return { isValid: false, message: 'Valor inválido' };
  }

  if (valorNumerico <= 0) {
    return { isValid: false, message: 'Valor deve ser maior que zero' };
  }

  if (valorMaximo && valorNumerico > valorMaximo) {
    return {
      isValid: false,
      message: `Valor excede o máximo permitido (R$ ${valorMaximo})`
    };
  }

  return { isValid: true, valor: valorNumerico };
};

// CommonJS exports
module.exports = {
  validarIdadeMinima,
  validarStatusAssistida,
  validarPeriodoInternacao,
  validarHorarioConsulta,
  validarTipoDoacao,
  validarTipoDespesa,
  validarEstoqueMinimo,
  validarDataNoPeriodo,
  validarTransicaoStatus,
  validarValorFinanceiro
};