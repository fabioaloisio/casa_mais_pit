import apiService from './api';

class ConsultasService {
  async getAll() {
    return apiService.get('/consultas');
  }

  async getById(id) {
    return apiService.get(`/consultas/${id}`);
  }

  async create(data) {
    return apiService.post('/consultas', data);
  }

  async update(id, data) {
    return apiService.put(`/consultas/${id}`, data);
  }

  async delete(id) {
    return apiService.delete(`/consultas/${id}`);
  }

  async agendar(data) {
    return apiService.post('/consultas/agendar', data);
  }

  async realizarConsulta(id, data) {
    return apiService.put(`/consultas/${id}/realizar`, data);
  }

  async cancelar(id, motivo) {
    return apiService.put(`/consultas/${id}/cancelar`, { motivo });
  }

  async criarPrescricao(consultaId, data) {
    return apiService.post(`/consultas/${consultaId}/prescricoes`, data);
  }

  async getHistoriaPatologica(assistidaId) {
    return apiService.get(`/assistidas/${assistidaId}/historia-patologica`);
  }

  async atualizarHistoriaPatologica(assistidaId, data) {
    return apiService.put(`/assistidas/${assistidaId}/historia-patologica`, data);
  }

  async getAcompanhamentos(consultaId) {
    return apiService.get(`/consultas/${consultaId}/acompanhamentos`);
  }

  async criarAcompanhamento(consultaId, data) {
    return apiService.post(`/consultas/${consultaId}/acompanhamentos`, data);
  }

  async getCalendario(filtros = {}) {
    return apiService.get('/consultas/calendario', filtros);
  }

  async getEstatisticas() {
    return apiService.get('/consultas/estatisticas');
  }

  async getMedicos() {
    return apiService.get('/medicos');
  }

  async getEspecialidades() {
    return apiService.get('/especialidades');
  }
}

const consultasService = new ConsultasService();
export default consultasService;
