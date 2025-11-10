import apiService from './api';

export const MateriaPrimaService = {
  obterTodos: async () => {
    try {
      const response = await apiService.get('/materias-primas');
      return response.success ? response.data : [];
    } catch (error) {
      console.error('Erro ao buscar matérias-primas:', error);
      throw new Error('Erro ao carregar matérias-primas. Tente novamente.');
    }
  },

  obterPorId: async (id) => {
    try {
      const response = await apiService.get(`/materias-primas/${id}`);
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Erro ao buscar matéria-prima:', error);
      throw new Error('Erro ao carregar matéria-prima. Tente novamente.');
    }
  },

  criar: async (materiaPrima) => {
    try {
      const response = await apiService.post('/materias-primas', materiaPrima);
      return response;
    } catch (error) {
      console.error('Erro ao criar matéria-prima:', error);
      throw new Error('Erro ao criar matéria-prima. Tente novamente.');
    }
  },

  atualizar: async (id, materiaPrima) => {
    try {
      const response = await apiService.put(`/materias-primas/${id}`, materiaPrima);
      return response;
    } catch (error) {
      console.error('Erro ao atualizar matéria-prima:', error);
      throw new Error('Erro ao atualizar matéria-prima. Tente novamente.');
    }
  },

  excluir: async (id) => {
    try {
      const response = await apiService.delete(`/materias-primas/${id}`);
      return response;
    } catch (error) {
      console.error('Erro ao excluir matéria-prima:', error);
      throw new Error('Erro ao excluir matéria-prima. Tente novamente.');
    }
  }
};

