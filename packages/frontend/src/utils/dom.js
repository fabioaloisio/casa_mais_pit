// Aplicar máscara de valor monetário em input
export const maskCurrency = (event) => {
  let value = event.target.value;
  value = value.replace(/\D/g, '');
  value = (parseInt(value) / 100).toFixed(2) + '';
  value = value.replace('.', ',');
  value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
  event.target.value = 'R$ ' + value;
};