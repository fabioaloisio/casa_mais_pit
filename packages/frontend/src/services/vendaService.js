import apiService from './api';

export const VendaService = {
  obterTodos: async (filters = {}) => {
    try {
      const response = await apiService.get('/vendas', filters);
      return response.success ? response.data : [];
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
      throw new Error('Erro ao carregar vendas. Tente novamente.');
    }
  },

  obterPorId: async (id) => {
    try {
      const response = await apiService.get(`/vendas/${id}`);
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Erro ao buscar venda:', error);
      throw new Error('Erro ao carregar venda. Tente novamente.');
    }
  },

  criar: async (venda) => {
    try {
      const response = await apiService.post('/vendas', venda);
      return response;
    } catch (error) {
      console.error('Erro ao criar venda:', error);
      throw new Error('Erro ao criar venda. Tente novamente.');
    }
  },

  atualizar: async (id, venda) => {
    try {
      const response = await apiService.put(`/vendas/${id}`, venda);
      return response;
    } catch (error) {
      console.error('Erro ao atualizar venda:', error);
      throw new Error('Erro ao atualizar venda. Tente novamente.');
    }
  },

  excluir: async (id) => {
    try {
      const response = await apiService.delete(`/vendas/${id}`);
      return response;
    } catch (error) {
      console.error('Erro ao excluir venda:', error);
      throw new Error('Erro ao excluir venda. Tente novamente.');
    }
  },

  obterRelatorio: async (dataInicio, dataFim, filters = {}) => {
    try {
      const params = {
        data_inicio: dataInicio,
        data_fim: dataFim,
        ...filters
      };
      const response = await apiService.get('/vendas/relatorio', params);
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Erro ao buscar relatório de vendas:', error);
      throw new Error('Erro ao carregar relatório de vendas. Tente novamente.');
    }
  }
};

