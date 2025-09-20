import apiService from './api';

export const HprService = {
  obterTodos: async () => {
    try {
      const response = await apiService.get('/hpr');
      return response.success ? response.data : [];
    } catch (error) {
      console.error('Erro ao buscar HPRs:', error.message);
      throw new Error('Erro ao carregar HPRs. Tente novamente.');
    }
  },

  obterPorId: async (id) => {
    try {
      const response = await apiService.get(`/hpr/${id}`);
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Erro ao buscar HPR:', error.message);
      throw new Error('Erro ao carregar HPR. Tente novamente.');
    }
  },

  create: async (hpr) => {
    try {
      const response = await apiService.post('/hpr', hpr);
      return response;
    } catch (error) {
      console.error('Erro ao criar HPR:', error.message);
      throw new Error('Erro ao criar HPR. Tente novamente.');
    }
  },

  update: async (id, hpr) => {
    try {
      const response = await apiService.put(`/hpr/${id}`, hpr);
      return response;
    } catch (error) {
      console.error('Erro ao atualizar HPR:', error.message);
      throw new Error('Erro ao atualizar HPR. Tente novamente.');
    }
  },

  delete: async (id) => {
    try {
      const response = await apiService.delete(`/hpr/${id}`);
      return response;
    } catch (error) {
      console.error('Erro ao excluir HPR:', error.message);
      throw new Error('Erro ao excluir HPR. Tente novamente.');
    }
  },


};

export default HprService;
