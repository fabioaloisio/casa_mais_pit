export const calcularDiasInternacao = (dataEntrada, dataSaida = null) => {
  const entrada = new Date(dataEntrada);
  const saida = dataSaida ? new Date(dataSaida) : new Date();
  const diffTime = saida - entrada;

  // Evita números negativos caso a data seja inválida
  if (isNaN(diffTime)) return 0;

  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
