// Domain constants shared between frontend and backend

// Import modules
const rolesModule = require('./roles.js');
const errorMessagesModule = require('./errorMessages.js');
const backendMessagesModule = require('./backendMessages.js');

const STATUS_TYPES = {
  ACTIVE: 'ativo',
  INACTIVE: 'inativo',
  PENDING: 'pendente'
};

const MEDICATION_UNITS = {
  MG: 'mg',
  ML: 'ml',
  COMPRIMIDO: 'comprimido',
  CAPSULA: 'cápsula',
  AMPOLA: 'ampola'
};

const EXPENSE_TYPES = {
  MEDICATION: 'medicamentos',
  UTILITIES: 'utilidades',
  MAINTENANCE: 'manutenção',
  SUPPLIES: 'suprimentos'
};

const DONATION_TYPES = {
  MONEY: 'dinheiro',
  MEDICATION: 'medicamentos',
  SUPPLIES: 'suprimentos',
  OTHER: 'outros'
};

// CommonJS exports - merge all modules
module.exports = {
  ...rolesModule,
  ...errorMessagesModule,
  ...backendMessagesModule,
  STATUS_TYPES,
  MEDICATION_UNITS,
  EXPENSE_TYPES,
  DONATION_TYPES
};