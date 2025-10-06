// import API_CONFIG from '../config/api';

// class ApiService {
//   constructor() {
//     this.baseURL = API_CONFIG.BASE_URL;
//     this.timeout = API_CONFIG.TIMEOUT;
//     this.defaultHeaders = API_CONFIG.DEFAULT_HEADERS;
//   }

//   // Método genérico para fazer requisições
//   async request(endpoint, options = {}) {
//     const url = `${this.baseURL}${endpoint}`;

//     const config = {
//       headers: {
//         ...this.defaultHeaders,
//         ...options.headers,
//       },
//       ...options,
//     };

//     try {
//       const response = await fetch(url, config);

//       // Verificar se a resposta foi bem-sucedida
//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({
//           message: `Erro HTTP: ${response.status}`
//         }));
//         const error = new Error(errorData.message || `Erro ${response.status}`);
//         error.status = response.status;
//         throw error;
//       }

//       const data = await response.json();
//       return data;
//     } catch (error) {
//       console.error(`Erro na requisição para ${endpoint}:`, error);
//       throw error;
//     }
//   }

//   // Métodos HTTP específicos
//   async get(endpoint, params = {}) {
//     const searchParams = new URLSearchParams(params);
//     const queryString = searchParams.toString();
//     const url = queryString ? `${endpoint}?${queryString}` : endpoint;

//     return this.request(url, {
//       method: 'GET',
//     });
//   }

//   async post(endpoint, data) {
//     return this.request(endpoint, {
//       method: 'POST',
//       body: JSON.stringify(data),
//     });
//   }

//   async put(endpoint, data) {
//     return this.request(endpoint, {
//       method: 'PUT',
//       body: JSON.stringify(data),
//     });
//   }

//   async delete(endpoint) {
//     return this.request(endpoint, {
//       method: 'DELETE',
//     });
//   }
// }

// // Instância singleton da API
// const apiService = new ApiService();

// export default apiService;



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

    // 🔑 Pega o token salvo no localStorage (definido no login)
    const token = localStorage.getItem('token');

    // Monta os headers, incluindo Authorization se existir token
    const headers = {
      ...this.defaultHeaders,
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      // Se a resposta for inválida, tenta obter mensagem de erro
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `Erro HTTP: ${response.status}`
        }));
        const error = new Error(errorData.message || `Erro ${response.status}`);
        error.status = response.status;
        throw error;
      }

      // Tenta converter a resposta em JSON
      const text = await response.text();
      return text ? JSON.parse(text) : null;
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

    return this.request(url, { method: 'GET' });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

// Instância singleton da API
const apiService = new ApiService();

export default apiService;
