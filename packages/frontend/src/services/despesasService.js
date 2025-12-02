import apiService from './api';
import { formatCurrency as formatMoney, parseCurrency as parseMoney } from '@casa-mais/shared';

class DespesasService {
  // Obter todas as despesas
  async getAll(filtros = {}) {
    try {
      const response = await apiService.get('/despesas', filtros);
      return response.success ? response.data : [];
    } catch (error) {
      console.error('Erro ao buscar despesas:', error);
      throw new Error('Erro ao carregar despesas');
    }
  }

  // Obter despesa por ID
  async getById(id) {
    try {
      const response = await apiService.get(`/despesas/${id}`);
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Erro ao buscar despesa:', error);
      if (error.message.includes('404')) {
        return null;
      }
      throw new Error('Erro ao carregar despesa');
    }
  }

  // Buscar despesas com filtros
  async search(filtros = {}) {
    try {
      const response = await apiService.get('/despesas', filtros);
      return response.success ? response.data : [];
    } catch (error) {
      console.error('Erro ao buscar despesas:', error);
      throw new Error('Erro ao buscar despesas');
    }
  }

  // Criar nova despesa
  async create(despesa) {
    try {
      console.log('DespesasService.create - dados recebidos:', despesa);
      const response = await apiService.post('/despesas', despesa);
      console.log('DespesasService.create - resposta da API:', response);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Erro ao criar despesa');
    } catch (error) {
      console.error('Erro ao criar despesa:', error);
      if (error.message.includes('Dados inválidos')) {
        throw error;
      }
      throw new Error('Erro ao salvar despesa. Verifique os dados e tente novamente.');
    }
  }

  // Atualizar despesa
  async update(id, despesaData) {
    try {
      const response = await apiService.put(`/despesas/${id}`, despesaData);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Erro ao atualizar despesa');
    } catch (error) {
      console.error('Erro ao atualizar despesa:', error);
      if (error.message.includes('404')) {
        throw new Error('Despesa não encontrada');
      }
      if (error.message.includes('Dados inválidos')) {
        throw error;
      }
      throw new Error('Erro ao atualizar despesa');
    }
  }

  // Excluir despesa
  async delete(id) {
    try {
      const response = await apiService.delete(`/despesas/${id}`);
      if (response.success) {
        return true;
      }
      throw new Error(response.message || 'Erro ao excluir despesa');
    } catch (error) {
      console.error('Erro ao excluir despesa:', error);
      if (error.message.includes('404')) {
        throw new Error('Despesa não encontrada');
      }
      throw new Error(error.message || 'Erro ao excluir despesa');
    }
  }

  // Obter estatísticas de despesas
  async getEstatisticas(periodo = {}) {
    try {
      const response = await apiService.get('/despesas/estatisticas', periodo);
      return response.success ? response.data : {
        totalDespesas: 0,
        valorTotalMes: 0,
        despesasPendentes: 0,
        despesasPagas: 0,
        categorias: []
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return {
        totalDespesas: 0,
        valorTotalMes: 0,
        despesasPendentes: 0,
        despesasPagas: 0,
        categorias: []
      };
    }
  }

  // Obter despesas por categoria
  async getByCategoria(categoria) {
    try {
      const response = await apiService.get('/despesas', { categoria });
      return response.success ? response.data : [];
    } catch (error) {
      console.error('Erro ao buscar despesas por categoria:', error);
      throw new Error('Erro ao filtrar despesas por categoria');
    }
  }

  // Obter despesas por período
  async getByPeriodo(dataInicio, dataFim) {
    try {
      const response = await apiService.get('/despesas', { 
        dataInicio, 
        dataFim 
      });
      return response.success ? response.data : [];
    } catch (error) {
      console.error('Erro ao buscar despesas por período:', error);
      throw new Error('Erro ao filtrar despesas por período');
    }
  }

  // Obter despesas por status
  async getByStatus(status) {
    try {
      const response = await apiService.get('/despesas', { status });
      return response.success ? response.data : [];
    } catch (error) {
      console.error('Erro ao buscar despesas por status:', error);
      throw new Error('Erro ao filtrar despesas por status');
    }
  }

  // Validar valor da despesa
  validateValor(valor) {
    const valorNumerico = parseFloat(valor);
    return !isNaN(valorNumerico) && valorNumerico > 0;
  }

  // Validar data da despesa
  validateData(data) {
    const dataAtual = new Date();
    const dataDespesa = new Date(data);
    
    // Não pode ser data futura
    return dataDespesa <= dataAtual;
  }

  // Validar despesa completa
  validateDespesa(despesa) {
    const errors = [];

    if (!despesa.descricao || despesa.descricao.trim().length < 3) {
      errors.push('Descrição deve ter pelo menos 3 caracteres');
    }

    if (!despesa.categoria || despesa.categoria.trim().length === 0) {
      errors.push('Categoria é obrigatória');
    }

    if (!this.validateValor(despesa.valor)) {
      errors.push('Valor deve ser maior que zero');
    }

    if (!despesa.data_despesa) {
      errors.push('Data da despesa é obrigatória');
    } else if (!this.validateData(despesa.data_despesa)) {
      errors.push('Data da despesa não pode ser futura');
    }

    if (!despesa.forma_pagamento || despesa.forma_pagamento.trim().length === 0) {
      errors.push('Forma de pagamento é obrigatória');
    }

    return errors;
  }

  // Obter tipos de despesas disponíveis
  async getTiposDespesas() {
    try {
      const response = await apiService.get('/tipos-despesas', { ativo: true });
      return response.success ? response.data : [];
    } catch (error) {
      console.error('Erro ao buscar tipos de despesas:', error);
      // Retorna categorias padrão se não conseguir buscar do backend
      return [
        { id: 1, nome: 'Medicamentos' },
        { id: 2, nome: 'Alimentação' },
        { id: 3, nome: 'Limpeza e Higiene' },
        { id: 4, nome: 'Manutenção' },
        { id: 5, nome: 'Transporte' },
        { id: 6, nome: 'Recursos Humanos' },
        { id: 7, nome: 'Utilidades' },
        { id: 8, nome: 'Material de Escritório' },
        { id: 9, nome: 'Equipamentos' },
        { id: 10, nome: 'Outros' }
      ];
    }
  }

  // Métodos de formatação agora vêm do shared/utils
  formatMoney(value) {
    return formatMoney(value);
  }

  parseMoney(value) {
    return parseMoney(value);
  }
}

// Instancia singleton
const despesasService = new DespesasService();

export default despesasService;