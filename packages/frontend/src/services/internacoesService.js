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

  async efetuarSaida(assistidaId, data) {
    return apiService.post('/internacoes/saida', {
      assistida_id: assistidaId,
      motivo_saida: data.motivoSaida || data.motivo_saida,
      observacoes_saida: data.observacoesSaida || data.observacoes_saida
    });
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

  async atualizarEntrada(id, data) {
    return apiService.put(`/internacoes/entrada/${id}`, {
      data_entrada: data.dataEntrada,
      motivo: data.motivo,
      observacoes: data.observacoes
    });
  }

  async atualizarSaida(id, data) {
    return apiService.put(`/internacoes/saida/${id}`, {
      data_saida: data.dataSaida,
      motivo_saida: data.motivoSaida,
      observacoes_saida: data.observacoesSaida
    });
  }

  // async efetuarRetorno(assistidaId, data) {
  //   return apiService.post('/internacoes/retorno', {
  //     assistida_id: assistidaId,
  //     motivo: data.motivo,
  //     observacoes: data.observacoes,
  //     data_entrada: data.dataEntrada
  //   });
  // }

}

const internacoesService = new InternacoesService();
export default internacoesService;
