// Helpers de cálculo financeiro compartilhados

/**
 * Calcula o total de uma lista de valores
 * @param {Array<number|string>} valores - Array de valores numéricos
 * @returns {number} Soma total dos valores
 */
const calcularTotal = (valores) => {
  if (!Array.isArray(valores)) return 0;

  return valores.reduce((total, valor) => {
    const valorNumerico = typeof valor === 'string'
      ? parseFloat(valor.replace(/[^\d,]/g, '').replace(',', '.'))
      : valor;

    return total + (isNaN(valorNumerico) ? 0 : valorNumerico);
  }, 0);
};

/**
 * Calcula a média de uma lista de valores
 * @param {Array<number|string>} valores - Array de valores numéricos
 * @returns {number} Média dos valores
 */
const calcularMedia = (valores) => {
  if (!Array.isArray(valores) || valores.length === 0) return 0;

  const total = calcularTotal(valores);
  return total / valores.length;
};

/**
 * Calcula o balanço entre entradas e saídas
 * @param {number} entradas - Total de entradas
 * @param {number} saidas - Total de saídas
 * @returns {object} Objeto com balanço e status
 */
const calcularBalanco = (entradas, saidas) => {
  const entradasNum = parseFloat(entradas) || 0;
  const saidasNum = parseFloat(saidas) || 0;
  const balanco = entradasNum - saidasNum;

  return {
    entradas: entradasNum,
    saidas: saidasNum,
    balanco: balanco,
    status: balanco >= 0 ? 'positivo' : 'negativo',
    percentualGasto: entradasNum > 0 ? (saidasNum / entradasNum * 100).toFixed(2) : 0
  };
};

/**
 * Calcula a porcentagem de um valor em relação ao total
 * @param {number} valor - Valor parcial
 * @param {number} total - Valor total
 * @returns {number} Porcentagem do valor em relação ao total
 */
const calcularPorcentagem = (valor, total) => {
  if (!total || total === 0) return 0;
  return ((valor / total) * 100).toFixed(2);
};

/**
 * Formata um valor para exibição como percentual
 * @param {number} valor - Valor a ser formatado
 * @param {number} decimais - Número de casas decimais
 * @returns {string} Valor formatado como percentual
 */
const formatarPercentual = (valor, decimais = 2) => {
  return `${parseFloat(valor).toFixed(decimais)}%`;
};

/**
 * Valida se um valor monetário é válido
 * @param {number|string} valor - Valor a ser validado
 * @returns {boolean} True se o valor é válido
 */
const validarValorMonetario = (valor) => {
  const valorNumerico = typeof valor === 'string'
    ? parseFloat(valor.replace(/[^\d,]/g, '').replace(',', '.'))
    : valor;

  return !isNaN(valorNumerico) && valorNumerico > 0;
};

/**
 * Arredonda um valor monetário para 2 casas decimais
 * @param {number} valor - Valor a ser arredondado
 * @returns {number} Valor arredondado
 */
const arredondarValor = (valor) => {
  return Math.round(valor * 100) / 100;
};

/**
 * Calcula o desconto aplicado
 * @param {number} valorOriginal - Valor original
 * @param {number} valorComDesconto - Valor com desconto
 * @returns {object} Objeto com informações do desconto
 */
const calcularDesconto = (valorOriginal, valorComDesconto) => {
  const original = parseFloat(valorOriginal) || 0;
  const comDesconto = parseFloat(valorComDesconto) || 0;
  const desconto = original - comDesconto;
  const percentualDesconto = original > 0 ? (desconto / original * 100) : 0;

  return {
    valorOriginal: original,
    valorComDesconto: comDesconto,
    valorDesconto: desconto,
    percentualDesconto: percentualDesconto.toFixed(2)
  };
};

/**
 * Agrupa valores por categoria e calcula totais
 * @param {Array<object>} items - Array de objetos com categoria e valor
 * @returns {object} Objeto com totais por categoria
 */
const agruparPorCategoria = (items) => {
  if (!Array.isArray(items)) return {};

  return items.reduce((acc, item) => {
    const categoria = item.categoria || 'Sem categoria';
    const valor = typeof item.valor === 'string'
      ? parseFloat(item.valor.replace(/[^\d,]/g, '').replace(',', '.'))
      : item.valor;

    if (!acc[categoria]) {
      acc[categoria] = {
        quantidade: 0,
        total: 0,
        items: []
      };
    }

    acc[categoria].quantidade++;
    acc[categoria].total += valor || 0;
    acc[categoria].items.push(item);

    return acc;
  }, {});
};

/**
 * Calcula estatísticas financeiras de um período
 * @param {Array<object>} movimentacoes - Array de movimentações
 * @returns {object} Objeto com estatísticas do período
 */
const calcularEstatisticasPeriodo = (movimentacoes) => {
  if (!Array.isArray(movimentacoes) || movimentacoes.length === 0) {
    return {
      totalEntradas: 0,
      totalSaidas: 0,
      saldo: 0,
      quantidadeMovimentacoes: 0,
      mediaMovimentacoes: 0,
      maiorEntrada: 0,
      maiorSaida: 0
    };
  }

  const entradas = movimentacoes.filter(m => m.tipo === 'entrada' || m.tipo === 'doacao');
  const saidas = movimentacoes.filter(m => m.tipo === 'saida' || m.tipo === 'despesa');

  const totalEntradas = calcularTotal(entradas.map(e => e.valor));
  const totalSaidas = calcularTotal(saidas.map(s => s.valor));

  const valoresEntradas = entradas.map(e => parseFloat(e.valor) || 0);
  const valoresSaidas = saidas.map(s => parseFloat(s.valor) || 0);

  return {
    totalEntradas,
    totalSaidas,
    saldo: totalEntradas - totalSaidas,
    quantidadeMovimentacoes: movimentacoes.length,
    quantidadeEntradas: entradas.length,
    quantidadeSaidas: saidas.length,
    mediaEntradas: calcularMedia(valoresEntradas),
    mediaSaidas: calcularMedia(valoresSaidas),
    maiorEntrada: valoresEntradas.length > 0 ? Math.max(...valoresEntradas) : 0,
    maiorSaida: valoresSaidas.length > 0 ? Math.max(...valoresSaidas) : 0
  };
};

// CommonJS exports
module.exports = {
  calcularTotal,
  calcularMedia,
  calcularBalanco,
  calcularPorcentagem,
  formatarPercentual,
  validarValorMonetario,
  arredondarValor,
  calcularDesconto,
  agruparPorCategoria,
  calcularEstatisticasPeriodo
};