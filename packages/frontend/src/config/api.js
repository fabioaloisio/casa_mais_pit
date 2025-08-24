// Configuração da API
const API_CONFIG = {
  // URL base da API (ajuste conforme seu ambiente)
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3003/api',
  
  // Timeout para requisições (em ms)
  TIMEOUT: 30000,
  
  // Headers padrão
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
  
  // Configurações de retry
  RETRY: {
    attempts: 3,
    delay: 1000,
  },
};

export default API_CONFIG;