import apiService from './api';

class CampanhaService {
  // ================ CAMPANHAS ================

  async listarCampanhas(filtros = {}) {
    return apiService.get('/campanhas', filtros);
  }

  async obterCampanha(id) {
    return apiService.get(`/campanhas/${id}`);
  }

  async criarCampanha(data) {
    return apiService.post('/campanhas', data);
  }

  async atualizarCampanha(id, data) {
    return apiService.put(`/campanhas/${id}`, data);
  }

  // ================ CONTROLE DE STATUS ================

  async encerrarCampanha(id, motivo) {
    return apiService.put(`/campanhas/${id}/encerrar`, { motivo });
  }

  async cancelarCampanha(id, motivo) {
    return apiService.put(`/campanhas/${id}/cancelar`, { motivo });
  }

  async reativarCampanha(id) {
    return apiService.put(`/campanhas/${id}/reativar`);
  }

  // ================ DOADORES_CAMPANHAS (N:N) ================

  async associarDoadorCampanha(campanhaId, data) {
    return apiService.post(`/campanhas/${campanhaId}/doadores`, data);
  }

  async listarDoadoresCampanha(campanhaId) {
    return apiService.get(`/campanhas/${campanhaId}/doadores`);
  }

  async listarCampanhasDoador(doadorId) {
    return apiService.get(`/campanhas/doador/${doadorId}/campanhas`);
  }

  // ================ RELATÓRIOS ================

  async obterEstatisticasCampanha(campanhaId) {
    return apiService.get(`/campanhas/${campanhaId}/estatisticas`);
  }

  async obterRankingCampanhas(limit = 10) {
    return apiService.get('/campanhas/relatorio/ranking', { limit });
  }

  // ================ HELPERS ================

  formatarValorMonetario(valor) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }

  formatarPercentual(valor) {
    return `${valor.toFixed(2)}%`;
  }

  calcularDiasRestantes(dataFim) {
    if (!dataFim) return null;

    const hoje = new Date();
    const fim = new Date(dataFim);
    const diffTime = fim - hoje;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  }

  getStatusCampanha(campanha) {
    const hoje = new Date();
    const inicio = new Date(campanha.data_inicio);
    const fim = campanha.data_fim ? new Date(campanha.data_fim) : null;

    if (campanha.status === 'cancelada') return 'Cancelada';
    if (campanha.status === 'encerrada') return 'Encerrada';

    if (inicio > hoje) return 'Planejada';
    if (!fim || fim >= hoje) return 'Ativa';

    return 'Encerrada';
  }

  getStatusClass(status) {
    const statusClasses = {
      'Ativa': 'success',
      'ativa': 'success',
      'Planejada': 'warning',
      'planejada': 'warning',
      'Encerrada': 'secondary',
      'encerrada': 'secondary',
      'Cancelada': 'danger',
      'cancelada': 'danger'
    };

    return statusClasses[status] || 'secondary';
  }
}

const campanhaService = new CampanhaService();
export default campanhaService;