// Aldruin Bonfim de Lima Souza - RA 10482416915

import apiService from './api';

export const MedicamentoService = {
  obterTodos: async () => {
    try {
      const response = await apiService.get('/medicamentos');
      return response.success ? response.data : [];
    } catch (error) {
      console.error('Erro ao buscar medicamentos:', error);
      throw new Error('Erro ao carregar medicamentos. Tente novamente.');
    }
  },

  obterPorId: async (id) => {
    try {
      const response = await apiService.get(`/medicamentos/${id}`);
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Erro ao buscar medicamento:', error);
      throw new Error('Erro ao carregar medicamento. Tente novamente.');
    }
  },

  criar: async (medicamento) => {
    try {
      const medicamentoFormatado = {
        ...medicamento,
        unidade_medida_id: parseInt(medicamento.unidade_medida_id, 10) || null, // Converte ID corretamente
      };

      const response = await apiService.post('/medicamentos', medicamentoFormatado);
      return response;
    } catch (error) {
      console.error('Erro ao criar medicamento:', error);
      throw new Error('Erro ao criar medicamento. Tente novamente.');
    }
  },

  atualizar: async (id, medicamento) => {
    try {
      const medicamentoFormatado = {
        ...medicamento,
        unidade_medida_id: parseInt(medicamento.unidade_medida_id, 10) || null, // Converte ID corretamente
      };

      const response = await apiService.put(`/medicamentos/${id}`, medicamentoFormatado);
      return response;
    } catch (error) {
      console.error('Erro ao atualizar medicamento:', error);
      throw new Error('Erro ao atualizar medicamento. Tente novamente.');
    }
  },

  excluir: async (id) => {
    try {
      const response = await apiService.delete(`/medicamentos/${id}`);
      return response;
    } catch (error) {
      console.error('Erro ao excluir medicamento:', error);
      throw new Error('Erro ao excluir medicamento. Tente novamente.');
    }
  },

  // Método mantido para compatibilidade, mas não é mais usado
  salvarTodos: (medicamentos) => {
    console.warn('salvarTodos está obsoleto. Use a API.');
  }
};