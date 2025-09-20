import apiService from './api';

export const assistidasService = {
  obterTodos: async () => {
    try {
      const response = await apiService.get('/assistidas');
      return response.success ? response.data : [];
    } catch (error) {
      console.error('Erro ao buscar assistidas:', error.message);
      throw new Error('Erro ao carregar assistidas. Tente novamente.');
    }
  },

  obterPorId: async (id) => {
    try {
      const response = await apiService.get(`/assistidas/${id}`);
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Erro ao buscar assistida:', error.message);
      throw new Error('Erro ao carregar assistida. Tente novamente.');
    }
  },

  create: async (assistida) => {
    try {
      const response = await apiService.post('/assistidas', assistida);
      return response;
    } catch (error) {
      console.error('Erro ao criar assistida:', error.message);
      throw new Error('Erro ao criar assistida. Tente novamente.');
    }
  },

  update: async (id, assistida) => {
    try {
      const response = await apiService.put(`/assistidas/${id}`, assistida);
      return response;
    } catch (error) {
      console.error('Erro ao atualizar assistida:', error.message);
      throw new Error('Erro ao atualizar assistida. Tente novamente.');
    }
  },

  delete: async (id) => {
    try {
      const response = await apiService.delete(`/assistidas/${id}`);
      return response;
    } catch (error) {
      console.error('Erro ao excluir assistida:', error.message);
      throw new Error('Erro ao excluir assistida. Tente novamente.');
    }
  },

  obterEstatisticas: async (filtros = {}) => {
    try {
      const params = new URLSearchParams(filtros).toString();
      const response = await apiService.get(`/assistidas/estatisticas?${params}`);
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Erro ao obter estatísticas de assistidas:', error.message);
      throw new Error('Erro ao carregar estatísticas. Tente novamente.');
    }
  },


  // Métodos legados (mantidos para compatibilidade)
  getAll: async () => {
    console.warn('getAll está obsoleto. Use obterTodos()');
    return await assistidasService.obterTodos();
  },

  getById: async (id) => {
    console.warn('getById está obsoleto. Use obterPorId()');
    return await assistidasService.obterPorId(id);
  },

  add: async (assistidaData) => {
    console.warn('add está obsoleto. Use create()');
    return await assistidasService.create(assistidaData);
  },

  remove: async (id) => {
    console.warn('remove está obsoleto. Use delete()');
    return await assistidasService.delete(id);
  }
};

export default assistidasService;
