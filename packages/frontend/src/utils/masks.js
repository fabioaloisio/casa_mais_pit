// Máscaras para formatação
export const masks = {
  cpf: '999.999.999-99',
  cnpj: '99.999.999/9999-99',
  telefone: '(99) 99999-9999',
  cep: '99999-999',
  valor: (value) => {
    // Remove tudo exceto números
    const cleanValue = value.replace(/\D/g, '');

    // Converte para número e divide por 100 para ter centavos
    const numericValue = parseFloat(cleanValue) / 100;

    // Formata como moeda brasileira
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numericValue);
  }
};

// Formatar CPF
export const formatCPF = (cpf) => {
  const cleaned = cpf.replace(/\D/g, '');
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

// Formatar CNPJ
export const formatCNPJ = (cnpj) => {
  const cleaned = cnpj.replace(/\D/g, '');
  return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

// Formatar valor monetário
export const formatCurrency = (value) => {
  if (!value) return 'R$ 0,00';

  const numericValue = typeof value === 'string'
    ? parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.'))
    : value;

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(numericValue);
};

// Alias para formatCurrency (compatibilidade)
export const formatMoney = formatCurrency;

// Remover formatação de valor monetário
export const parseCurrency = (value) => {
  if (!value) return 0;
  return parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.'));
};

// Aplicar máscara de valor monetário em input
export const maskCurrency = (event) => {
  let value = event.target.value;
  value = value.replace(/\D/g, '');
  value = (parseInt(value) / 100).toFixed(2) + '';
  value = value.replace('.', ',');
  value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
  event.target.value = 'R$ ' + value;
};

// Formatações para Assistidas
export const formatRG = (rg) => {
  const cleaned = rg.replace(/\D/g, '');
  return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, '$1.$2.$3-$4');
};

export const formatTelefone = (telefone) => {
  const cleaned = telefone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return telefone;
};

export const formatCEP = (cep) => {
  const cleaned = cep.replace(/\D/g, '');
  return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
};

export const formatData = (dataString) => {
  if (!dataString) return '';

  // Se já está no formato DD/MM/YYYY, retorna como está
  if (dataString.includes('/')) {
    return dataString;
  }

  // Se está no formato ISO (YYYY-MM-DD), converte para DD/MM/YYYY
  if (dataString.includes('-')) {
    const [ano, mes, dia] = dataString.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  // Se é um objeto Date
  if (dataString instanceof Date) {
    const dia = String(dataString.getDate()).padStart(2, '0');
    const mes = String(dataString.getMonth() + 1).padStart(2, '0');
    const ano = dataString.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }

  return dataString;
};

// export const formatDataForInput = (dataString) => {
//   if (!dataString) return '';

//   // Se está no formato DD/MM/YYYY, converte para YYYY-MM-DD
//   if (dataString.includes('/')) {
//     const [dia, mes, ano] = dataString.split('/');
//     return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
//   }

//   // Se já está no formato ISO, retorna como está
//   if (dataString.includes('-')) {
//     return dataString;
//   }

//   return dataString;
// };

export const formatDataForInput = (dataString) => {
  if (!dataString) return '';

  // Se está no formato DD/MM/YYYY, converte para YYYY-MM-DD
  if (dataString.includes('/')) {
    const [dia, mes, ano] = dataString.split('/');
    return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
  }

  // Se estiver no formato ISO completo, extrai só a parte da data
  if (dataString.includes('T')) {
    return dataString.split('T')[0];
  }

  // Se já está no formato YYYY-MM-DD, retorna como está
  if (/^\d{4}-\d{2}-\d{2}$/.test(dataString)) {
    return dataString;
  }

  return '';
};

export const calcularIdadePorDataNascimento = (dataNascimento) => {
  if (!dataNascimento) return null;

  const hoje = new Date();
  const nascimento = new Date(dataNascimento);

  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mesAtual = hoje.getMonth();
  const mesNascimento = nascimento.getMonth();

  if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }

  return idade >= 0 ? idade : null;
};