import apiService from './api';
import { validateCPF, validateCNPJ, validateDocumento } from '@casa-mais/shared';

class DoadoresService {
  // Obter todos os doadores
  async getAll(filtros = {}) {
    console.log('%c[DOADORES-SERVICE] LISTAGEM', 'color: purple; font-weight: bold');
    console.log('Filtros:', filtros);

    try {
      const response = await apiService.get('/doadores', filtros);
      console.log('Resposta da API:', response);
      console.log(`Total de doadores retornados: ${response.data?.length || 0}`);
      return response.success ? response.data : [];
    } catch (error) {
      console.error('ERRO ao buscar doadores:', error);
      throw new Error('Erro ao carregar doadores');
    }
  }

  // Obter doador por ID
  async getById(id) {
    console.log('%c[DOADORES-SERVICE] CONSULTA POR ID', 'color: purple; font-weight: bold');
    console.log('ID solicitado:', id);

    try {
      const response = await apiService.get(`/doadores/${id}`);
      console.log('Doador encontrado:', response.data);
      return response.success ? response.data : null;
    } catch (error) {
      console.error('ERRO ao buscar doador:', error);
      if (error.message.includes('404')) {
        console.log('Doador não encontrado (404)');
        return null;
      }
      throw new Error('Erro ao carregar doador');
    }
  }

  // Buscar doadores com filtros
  async search(filtros = {}) {
    console.log('%c[DOADORES-SERVICE] BUSCA', 'color: purple; font-weight: bold');
    console.log('Filtros de busca:', filtros);

    try {
      const response = await apiService.get('/doadores', filtros);
      console.log(`Encontrados ${response.data?.length || 0} doadores`);
      return response.success ? response.data : [];
    } catch (error) {
      console.error('ERRO ao buscar doadores:', error);
      throw new Error('Erro ao buscar doadores');
    }
  }

  // Criar novo doador
  async create(doador) {
    console.log('%c[DOADORES-SERVICE] CADASTRO', 'color: green; font-weight: bold');
    console.log('Dados enviados:', doador);
    console.log('Tipo:', doador.tipo_doador);
    console.log('Nome:', doador.nome);
    console.log('Documento:', doador.documento);

    try {
      const response = await apiService.post('/doadores', doador);
      console.log('Resposta da API:', response);

      if (response.success) {
        console.log('%cDOADOR CRIADO COM SUCESSO!', 'color: green; font-weight: bold');
        console.log('ID gerado:', response.data?.id);
        return response.data;
      }
      throw new Error(response.message || 'Erro ao criar doador');
    } catch (error) {
      console.error('ERRO ao criar doador:', error);
      if (error.message.includes('Dados inválidos')) {
        console.log('Erro de validação detectado');
        throw error;
      }
      if (error.message.includes('já cadastrado')) {
        console.log('Documento já cadastrado!');
        throw new Error('Documento já cadastrado');
      }
      throw new Error('Erro ao salvar doador. Verifique os dados e tente novamente.');
    }
  }

  // Atualizar doador
  async update(id, doadorData) {
    console.log('%c[DOADORES-SERVICE] ATUALIZAÇÃO', 'color: orange; font-weight: bold');
    console.log('ID:', id);
    console.log('Novos dados:', doadorData);

    try {
      const response = await apiService.put(`/doadores/${id}`, doadorData);
      console.log('Resposta da API:', response);

      if (response.success) {
        console.log('%cDOADOR ATUALIZADO COM SUCESSO!', 'color: orange; font-weight: bold');
        return response.data;
      }
      throw new Error(response.message || 'Erro ao atualizar doador');
    } catch (error) {
      console.error('ERRO ao atualizar doador:', error);
      if (error.message.includes('404')) {
        console.log('Doador não encontrado (404)');
        throw new Error('Doador não encontrado');
      }
      if (error.message.includes('Dados inválidos')) {
        console.log('Erro de validação detectado');
        throw error;
      }
      if (error.message.includes('já cadastrado')) {
        console.log('Documento já cadastrado!');
        throw new Error('Documento já cadastrado');
      }
      throw new Error('Erro ao atualizar doador');
    }
  }

  // Excluir doador
  async delete(id) {
    console.log('%c[DOADORES-SERVICE] EXCLUSÃO', 'color: red; font-weight: bold');
    console.log('ID:', id);

    try {
      const response = await apiService.delete(`/doadores/${id}`);
      console.log('Resposta:', response);

      if (response.success) {
        console.log('%cDOADOR EXCLUÍDO COM SUCESSO!', 'color: red; font-weight: bold');
        return true;
      }
      // Se chegou aqui, significa que houve erro mas não gerou exception
      throw new Error(response.message || 'Erro ao excluir doador');
    } catch (error) {
      console.error('ERRO ao excluir doador:', error);
      if (error.message.includes('404')) {
        console.log('Doador não encontrado (404)');
        throw new Error('Doador não encontrado');
      }
      if (error.message.includes('possui doações registradas')) {
        console.log('%cEXCLUSÃO BLOQUEADA!', 'color: red; font-weight: bold');
        console.log('Motivo: Doador possui doações registradas');
        throw new Error('Não é possível excluir este doador pois ele possui doações registradas no sistema');
      }
      if (error.message.includes('não pode ser removido')) {
        console.log('%cEXCLUSÃO BLOQUEADA!', 'color: red; font-weight: bold');
        console.log('Motivo: Doações vinculadas');
        throw new Error('Não é possível excluir doador com doações vinculadas');
      }
      throw new Error(error.message || 'Erro ao excluir doador');
    }
  }

  // Obter histórico de doações do doador (apenas itens)
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

  // Obter histórico unificado (itens + monetárias)
  async getHistoricoUnificado(id) {
    try {
      const response = await apiService.get(`/doadores/${id}/historico-unificado`);
      return response.success ? response.data : [];
    } catch (error) {
      console.error('Erro ao buscar histórico unificado do doador:', error);
      if (error.message.includes('404')) {
        return [];
      }
      throw new Error('Erro ao carregar histórico unificado de doações');
    }
  }

  // Obter estatísticas consolidadas do doador (itens + monetárias)
  async getEstatisticasConsolidadas(id) {
    try {
      const response = await apiService.get(`/doadores/${id}/estatisticas-consolidadas`);
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Erro ao buscar estatísticas consolidadas do doador:', error);
      if (error.message.includes('404')) {
        return null;
      }
      throw new Error('Erro ao carregar estatísticas consolidadas');
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

  // Métodos de validação agora vêm do shared/validators
  validateCPF(cpf) {
    return validateCPF(cpf);
  }

  validateCNPJ(cnpj) {
    return validateCNPJ(cnpj);
  }

  validateDocumento(documento, tipo) {
    return validateDocumento(documento, tipo);
  }
}

// Instancia singleton
const doadoresService = new DoadoresService();

export default doadoresService;