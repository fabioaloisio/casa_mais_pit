import apiService from './api';

export const ReceitaService = {
  obterTodos: async () => {
    try {
      const response = await apiService.get('/receitas');
      return response.success ? response.data : [];
    } catch (error) {
      console.error('Erro ao buscar receitas:', error);
      throw new Error('Erro ao carregar receitas. Tente novamente.');
    }
  },

  obterPorId: async (id) => {
    try {
      const response = await apiService.get(`/receitas/${id}`);
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Erro ao buscar receita:', error);
      throw new Error('Erro ao carregar receita. Tente novamente.');
    }
  },

  criar: async (receita) => {
    try {
      const response = await apiService.post('/receitas', receita);
      return response;
    } catch (error) {
      console.error('Erro ao criar receita:', error);
      throw new Error('Erro ao criar receita. Tente novamente.');
    }
  },

  atualizar: async (id, receita) => {
    try {
      const response = await apiService.put(`/receitas/${id}`, receita);
      return response;
    } catch (error) {
      console.error('Erro ao atualizar receita:', error);
      throw new Error('Erro ao atualizar receita. Tente novamente.');
    }
  },

  excluir: async (id) => {
    try {
      const response = await apiService.delete(`/receitas/${id}`);
      return response;
    } catch (error) {
      console.error('Erro ao excluir receita:', error);
      throw new Error('Erro ao excluir receita. Tente novamente.');
    }
  }
};

