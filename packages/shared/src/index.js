// Main entry point for the shared package
// Re-export all modules with hybrid CommonJS/ESM compatibility

// Import all modules
const utils = require('./utils/index.js');
const validators = require('./validators/index.js');
const businessValidators = require('./validators/business.js');
const constants = require('./constants/index.js');
const roles = require('./constants/roles.js');
const types = require('./types/index.js');
const financial = require('./helpers/financial.js');

// Merge all exports
const allExports = {
  ...utils,
  ...validators,
  ...businessValidators,
  ...constants,
  ...roles,
  ...types,
  ...financial
};

// CommonJS exports
module.exports = allExports;

// ESM compatibility - allow named imports in Vite
module.exports.default = allExports;

// Explicit named exports for better Vite compatibility
Object.keys(allExports).forEach(key => {
  module.exports[key] = allExports[key];
});