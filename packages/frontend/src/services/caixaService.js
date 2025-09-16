import apiService from './api';

class CaixaService {
  async getSaldo() {
    return apiService.get('/caixa/saldo');
  }

  async getMovimentacoes(filtros = {}) {
    return apiService.get('/caixa/movimentacoes', filtros);
  }

  async getMovimentacoesRecentes(limit = 10) {
    return apiService.get('/caixa/movimentacoes/recentes', { limit });
  }

  async lancarDoacao(data) {
    return apiService.post('/caixa/doacao-monetaria', data);
  }

  async lancarReceita(data) {
    return apiService.post('/caixa/receitas', data);
  }

  async lancarDespesa(data) {
    return apiService.post('/caixa/despesas', data);
  }

  async fechamentoDiario(data) {
    return apiService.post('/caixa/fechamento-diario', data);
  }

  async getRelatorioFinanceiro(periodo) {
    return apiService.get('/caixa/relatorio', periodo);
  }

  async getEstatisticas() {
    return apiService.get('/caixa/estatisticas');
  }

  async getHistoricoFechamentos() {
    return apiService.get('/caixa/fechamentos');
  }

  async estornarMovimentacao(id, motivo) {
    return apiService.put(`/caixa/movimentacoes/${id}/estorno`, { motivo });
  }
}

const caixaService = new CaixaService();
export default caixaService;
