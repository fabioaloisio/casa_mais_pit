// Shared validation functions - extracted from frontend utils

// Validar CPF - Implementação otimizada e testada
const validateCPF = (cpf) => {
  const cleanCPF = cpf.replace(/\D/g, '');

  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(10))) return false;

  return true;
};

// Validar CNPJ - Implementação otimizada e testada
const validateCNPJ = (cnpj) => {
  const cleanCNPJ = cnpj.replace(/\D/g, '');

  if (cleanCNPJ.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weights1[i];
  }
  let remainder = sum % 11;
  const firstDigit = remainder < 2 ? 0 : 11 - remainder;
  if (firstDigit !== parseInt(cleanCNPJ.charAt(12))) return false;

  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weights2[i];
  }
  remainder = sum % 11;
  const secondDigit = remainder < 2 ? 0 : 11 - remainder;
  if (secondDigit !== parseInt(cleanCNPJ.charAt(13))) return false;

  return true;
};

// Validar documento (CPF ou CNPJ)
const validateDocumento = (documento, tipo) => {
  if (tipo === 'PF') {
    return validateCPF(documento);
  } else if (tipo === 'PJ') {
    return validateCNPJ(documento);
  }
  return false;
};

// Validar email
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validar telefone
const validatePhone = (phone) => {
  const phoneRegex = /^\(\d{2}\)\s?\d{4,5}-?\d{4}$/;
  return phoneRegex.test(phone);
};

// Validar campos obrigatórios
const validateRequired = (value) => {
  return value && value.toString().trim().length > 0;
};

// Validar valor monetário
const validateCurrency = (value) => {
  const numericValue = parseFloat(value.toString().replace(/[^\d,]/g, '').replace(',', '.'));
  return !isNaN(numericValue) && numericValue > 0;
};

// Validar formulário de doação
const validateDoacaoForm = (formData) => {
  const errors = {};

  // Nome do doador
  if (!validateRequired(formData.nomeDoador)) {
    errors.nomeDoador = 'Nome do doador é obrigatório';
  }

  // Documento (CPF ou CNPJ)
  if (!validateRequired(formData.documento)) {
    errors.documento = 'CPF/CNPJ é obrigatório';
  } else {
    const doc = formData.documento.replace(/\D/g, '');
    if (formData.tipoDoador === 'PF' && !validateCPF(doc)) {
      errors.documento = 'CPF inválido';
    } else if (formData.tipoDoador === 'PJ' && !validateCNPJ(doc)) {
      errors.documento = 'CNPJ inválido';
    }
  }

  // Email
  if (formData.email && !validateEmail(formData.email)) {
    errors.email = 'Email inválido';
  }

  // Telefone
  if (!validateRequired(formData.telefone)) {
    errors.telefone = 'Telefone é obrigatório';
  } else if (!validatePhone(formData.telefone)) {
    errors.telefone = 'Telefone inválido';
  }

  // Valor
  if (!validateRequired(formData.valor)) {
    errors.valor = 'Valor é obrigatório';
  } else if (!validateCurrency(formData.valor)) {
    errors.valor = 'Valor deve ser maior que zero';
  }

  // Data da doação
  if (!validateRequired(formData.dataDoacao)) {
    errors.dataDoacao = 'Data da doação é obrigatória';
  }

  return errors;
};

// CommonJS exports
module.exports = {
  validateCPF,
  validateCNPJ,
  validateDocumento,
  validateEmail,
  validatePhone,
  validateRequired,
  validateCurrency,
  validateDoacaoForm
};