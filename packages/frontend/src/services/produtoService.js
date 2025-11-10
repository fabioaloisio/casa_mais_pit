import apiService from './api';

export const ProdutoService = {
  obterTodos: async () => {
    try {
      const response = await apiService.get('/produtos');
      return response.success ? response.data : [];
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      throw new Error('Erro ao carregar produtos. Tente novamente.');
    }
  },

  obterPorId: async (id) => {
    try {
      const response = await apiService.get(`/produtos/${id}`);
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      throw new Error('Erro ao carregar produto. Tente novamente.');
    }
  },

  criar: async (produto) => {
    try {
      const response = await apiService.post('/produtos', produto);
      return response;
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      throw new Error('Erro ao criar produto. Tente novamente.');
    }
  },

  atualizar: async (id, produto) => {
    try {
      const response = await apiService.put(`/produtos/${id}`, produto);
      return response;
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      throw new Error('Erro ao atualizar produto. Tente novamente.');
    }
  },

  excluir: async (id) => {
    try {
      const response = await apiService.delete(`/produtos/${id}`);
      return response;
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      throw new Error('Erro ao excluir produto. Tente novamente.');
    }
  }
};

