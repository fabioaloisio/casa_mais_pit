import apiService from './api';

class InternacoesService {
  async getAll() {
    return apiService.get('/internacoes');
  }

  async getById(id) {
    return apiService.get(`/internacoes/${id}`);
  }

  async getAtivas() {
    return apiService.get('/internacoes/ativas');
  }

  async getStats() {
    return apiService.get('/internacoes/stats');
  }

  async efetuarEntrada(data) {
    return apiService.post('/internacoes/entrada', data);
  }

  async efetuarSaida(id, data) {
    return apiService.put(`/internacoes/${id}/saida`, data);
  }

  async getHistorico(filtros = {}) {
    return apiService.get('/internacoes/historico', filtros);
  }

  async update(id, data) {
    return apiService.put(`/internacoes/${id}`, data);
  }

  async delete(id) {
    return apiService.delete(`/internacoes/${id}`);
  }
}

const internacoesService = new InternacoesService();
export default internacoesService;
