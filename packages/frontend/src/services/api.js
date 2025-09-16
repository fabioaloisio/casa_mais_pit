import API_CONFIG from '../config/api';

class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.defaultHeaders = API_CONFIG.DEFAULT_HEADERS;
  }

  // Método genérico para fazer requisições
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Adicionar token de autenticação se existir
    const token = localStorage.getItem('token');
    const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    const config = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...authHeaders,
        ...(options.headers || {}),
      },
    };

    try {
      const response = await fetch(url, config);
      
      // Verificar se a resposta foi bem-sucedida
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          message: `Erro HTTP: ${response.status}` 
        }));
        const error = new Error(errorData.message || `Erro ${response.status}`);
        error.status = response.status;
        throw error;
      }

      // Check content type to handle different response types
      const contentType = response.headers.get('content-type');

      console.log('[API] Response content-type:', contentType);

      // Handle binary files (PDF, Excel)
      if (contentType && (contentType.includes('application/pdf') ||
          contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'))) {
        const blob = await response.blob();
        console.log('[API] Binary file detected, blob created:', {
          size: blob.size,
          type: blob.type
        });
        return { blob, response };
      }

      // Handle JSON responses
      const data = await response.json();
      console.log('[API] JSON response parsed');
      return data;
    } catch (error) {
      console.error(`Erro na requisição para ${endpoint}:`, error);
      throw error;
    }
  }

  // Métodos HTTP específicos
  async get(endpoint, params = {}) {
    const searchParams = new URLSearchParams(params);
    const queryString = searchParams.toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: 'GET',
    });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

// Instância singleton da API
const apiService = new ApiService();

export default apiService;