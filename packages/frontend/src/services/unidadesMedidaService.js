import apiService from './api.js';

export const UnidadeMedidaService = {
  obterTodas: async () => {
    try {
      const response = await apiService.get('/unidades_medida');
      return response.success ? response.data : [];
    } catch (error) {
      console.error('Erro ao buscar unidades de medida:', error);
      throw new Error('Erro ao carregar unidades de medida. Tente novamente.');
    }
  },

  obterPorId: async (id) => {
    try {
      const response = await apiService.get(`/unidades_medida/${id}`);
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Erro ao buscar unidade de medida:', error);
      throw new Error('Erro ao carregar unidade de medida. Tente novamente.');
    }
  },

  criar: async (unidadeMedida) => {
    try {
      const response = await apiService.post('/unidades_medida', unidadeMedida);
      return response;
    } catch (error) {
      console.error('Erro ao criar unidade de medida:', error);
      throw new Error('Erro ao criar unidade de medida. Tente novamente.');
    }
  },

  atualizar: async (id, unidadeMedida) => {
    try {
      const response = await apiService.put(`/unidades_medida/${id}`, unidadeMedida);
      return response;
    } catch (error) {
      console.error('Erro ao atualizar unidade de medida:', error);
      throw new Error('Erro ao atualizar unidade de medida. Tente novamente.');
    }
  },

  excluir: async (id) => {
    try {
      const response = await apiService.delete(`/unidades_medida/${id}`);
      return response;
    } catch (error) {
      console.error('Erro ao excluir unidade de medida:', error);
      throw new Error('Erro ao excluir unidade de medida. Tente novamente.');
    }
  },

  // Método mantido para compatibilidade mas não é mais usado
  salvarTodas: (unidadesMedida) => {
    console.warn('salvarTodas está obsoleto. Use a API.');
  }
};