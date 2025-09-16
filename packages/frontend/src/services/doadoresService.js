import apiService from './api';

class DoadoresService {
  // Obter todos os doadores
  async getAll(filtros = {}) {
    try {
      const response = await apiService.get('/doadores', filtros);
      return response.success ? response.data : [];
    } catch (error) {
      console.error('Erro ao buscar doadores:', error);
      throw new Error('Erro ao carregar doadores');
    }
  }

  // Obter doador por ID
  async getById(id) {
    try {
      const response = await apiService.get(`/doadores/${id}`);
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Erro ao buscar doador:', error);
      if (error.message.includes('404')) {
        return null;
      }
      throw new Error('Erro ao carregar doador');
    }
  }

  // Buscar doadores com filtros
  async search(filtros = {}) {
    try {
      const response = await apiService.get('/doadores', filtros);
      return response.success ? response.data : [];
    } catch (error) {
      console.error('Erro ao buscar doadores:', error);
      throw new Error('Erro ao buscar doadores');
    }
  }

  // Criar novo doador
  async create(doador) {
    try {
      console.log('DoadoresService.create - dados recebidos:', doador);
      const response = await apiService.post('/doadores', doador);
      console.log('DoadoresService.create - resposta da API:', response);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Erro ao criar doador');
    } catch (error) {
      console.error('Erro ao criar doador:', error);
      if (error.message.includes('Dados inválidos')) {
        throw error;
      }
      if (error.message.includes('já cadastrado')) {
        throw new Error('Documento já cadastrado');
      }
      throw new Error('Erro ao salvar doador. Verifique os dados e tente novamente.');
    }
  }

  // Atualizar doador
  async update(id, doadorData) {
    try {
      const response = await apiService.put(`/doadores/${id}`, doadorData);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Erro ao atualizar doador');
    } catch (error) {
      console.error('Erro ao atualizar doador:', error);
      if (error.message.includes('404')) {
        throw new Error('Doador não encontrado');
      }
      if (error.message.includes('Dados inválidos')) {
        throw error;
      }
      if (error.message.includes('já cadastrado')) {
        throw new Error('Documento já cadastrado');
      }
      throw new Error('Erro ao atualizar doador');
    }
  }

  // Excluir doador
  async delete(id) {
    try {
      const response = await apiService.delete(`/doadores/${id}`);
      if (response.success) {
        return true;
      }
      // Se chegou aqui, significa que houve erro mas não gerou exception
      throw new Error(response.message || 'Erro ao excluir doador');
    } catch (error) {
      console.error('Erro ao excluir doador:', error);
      if (error.message.includes('404')) {
        throw new Error('Doador não encontrado');
      }
      if (error.message.includes('possui doações registradas')) {
        throw new Error('Não é possível excluir este doador pois ele possui doações registradas no sistema');
      }
      if (error.message.includes('não pode ser removido')) {
        throw new Error('Não é possível excluir doador com doações vinculadas');
      }
      throw new Error(error.message || 'Erro ao excluir doador');
    }
  }

  // Obter histórico de doações do doador
  async getDoacoes(id) {
    try {
      const response = await apiService.get(`/doadores/${id}/doacoes`);
      return response.success ? response.data : [];
    } catch (error) {
      console.error('Erro ao buscar doações do doador:', error);
      if (error.message.includes('404')) {
        return [];
      }
      throw new Error('Erro ao carregar histórico de doações');
    }
  }

  // Buscar doador por documento
  async getByDocumento(documento) {
    try {
      const response = await apiService.get('/doadores', {
        search: documento.replace(/\D/g, '')
      });
      if (response.success && response.data.length > 0) {
        return response.data.find(d => d.documento === documento.replace(/\D/g, ''));
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar doador por documento:', error);
      return null;
    }
  }

  // Validar CPF
  validateCPF(cpf) {
    const cleanCPF = cpf.replace(/\D/g, '');

    if (cleanCPF.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(10))) return false;

    return true;
  }

  // Validar CNPJ
  validateCNPJ(cnpj) {
    const cleanCNPJ = cnpj.replace(/\D/g, '');

    if (cleanCNPJ.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;

    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cleanCNPJ.charAt(i)) * weights1[i];
    }
    let remainder = sum % 11;
    const firstDigit = remainder < 2 ? 0 : 11 - remainder;
    if (firstDigit !== parseInt(cleanCNPJ.charAt(12))) return false;

    sum = 0;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cleanCNPJ.charAt(i)) * weights2[i];
    }
    remainder = sum % 11;
    const secondDigit = remainder < 2 ? 0 : 11 - remainder;
    if (secondDigit !== parseInt(cleanCNPJ.charAt(13))) return false;

    return true;
  }

  // Validar documento (CPF ou CNPJ)
  validateDocumento(documento, tipo) {
    if (tipo === 'PF') {
      return this.validateCPF(documento);
    } else if (tipo === 'PJ') {
      return this.validateCNPJ(documento);
    }
    return false;
  }
}

// Instancia singleton
const doadoresService = new DoadoresService();

export default doadoresService;
