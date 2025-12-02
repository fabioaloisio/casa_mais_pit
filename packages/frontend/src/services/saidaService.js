import apiService from './api';

export const SaidaService = {
  obterTodas: async () => {
    try {
      const response = await apiService.get('/saidas');
      return response.success ? response.data : [];
    } catch (error) {
      console.error('Erro ao buscar saídas:', error);
      throw new Error('Erro ao carregar saídas. Tente novamente.');
    }
  },

  obterPorAssistida: async (assistidaId) => {
    try {
      const response = await apiService.get(`/saidas/${assistidaId}`);
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Erro ao buscar saída por assistida:', error);
      throw new Error('Erro ao carregar saída da assistida. Tente novamente.');
    }
  },

  create: async (saida) => {
    try {
      const saidaFormatada = {
        ...saida,
        assistidaId: parseInt(saida.assistidaId, 10) || null,
        diasInternacao: parseInt(saida.diasInternacao, 10) || 0,
        dataSaida: saida.dataSaida
      };

      const response = await apiService.post('/saidas', saidaFormatada);
      return response;
    } catch (error) {
      console.error('Erro ao registrar saída:', error);
      throw new Error('Erro ao registrar saída. Tente novamente.');
    }
  },

  atualizar: async (id, saida) => {
    try {
      const saidaFormatada = {
        ...saida,
        assistidaId: parseInt(saida.assistidaId, 10) || null,
        diasInternacao: parseInt(saida.diasInternacao, 10) || 0,
      };

      const response = await apiService.put(`/saidas/${id}`, saidaFormatada);
      return response;
    } catch (error) {
      console.error('Erro ao atualizar saída:', error);
      throw new Error('Erro ao atualizar saída. Tente novamente.');
    }
  },

  excluir: async (id) => {
    try {
      const response = await apiService.delete(`/saidas/${id}`);
      return response;
    } catch (error) {
      console.error('Erro ao excluir saída:', error);
      throw new Error('Erro ao excluir saída. Tente novamente.');
    }
  },
};
