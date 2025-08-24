import apiService from './api';

class DoacoesService {
  // Obter todas as doações
  async getAll(filtros = {}) {
    try {
      const response = await apiService.get('/doacoes', filtros);
      return response.success ? response.data : [];
    } catch (error) {
      console.error('Erro ao buscar doações:', error);
      throw new Error('Erro ao carregar doações. Tente novamente.');
    }
  }

  // Obter doação por ID
  async getById(id) {
    try {
      const response = await apiService.get(`/doacoes/${id}`);
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Erro ao buscar doação:', error);
      if (error.message.includes('404')) {
        return null;
      }
      throw new Error('Erro ao carregar doação. Tente novamente.');
    }
  }

  // Buscar doações por doador
  async getByDoador(documento) {
    try {
      const response = await apiService.get(`/doacoes/doador/${documento}`);
      return response.success ? response.data : [];
    } catch (error) {
      console.error('Erro ao buscar doações do doador:', error);
      throw new Error('Erro ao carregar doações do doador. Tente novamente.');
    }
  }

  // Criar nova doação
  async create(doacao) {
    try {
      const response = await apiService.post('/doacoes', doacao);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Erro ao criar doação');
    } catch (error) {
      console.error('Erro ao criar doação:', error);
      // Se a resposta contém erros de validação, lançar com detalhes
      if (error.message.includes('Dados inválidos')) {
        throw error;
      }
      throw new Error('Erro ao salvar doação. Verifique os dados e tente novamente.');
    }
  }

  // Atualizar doação
  async update(id, doacaoData) {
    try {
      const response = await apiService.put(`/doacoes/${id}`, doacaoData);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Erro ao atualizar doação');
    } catch (error) {
      console.error('Erro ao atualizar doação:', error);
      if (error.message.includes('404')) {
        throw new Error('Doação não encontrada.');
      }
      if (error.message.includes('Dados inválidos')) {
        throw error;
      }
      throw new Error('Erro ao atualizar doação. Tente novamente.');
    }
  }

  // Deletar doação
  async delete(id) {
    try {
      const response = await apiService.delete(`/doacoes/${id}`);
      return response.success;
    } catch (error) {
      console.error('Erro ao deletar doação:', error);
      if (error.status === 404 || error.message.includes('404')) {
        throw new Error('Doação não encontrada.');
      }
      if (error.status === 403 || error.message.includes('403') || error.message.includes('não é permitido') || error.message.includes('Não é permitido')) {
        throw new Error('Não é permitido excluir doações. As doações devem ser mantidas para histórico e auditoria.');
      }
      throw new Error('Erro ao excluir doação. Tente novamente.');
    }
  }

  // Obter estatísticas
  async getStats(filtros = {}) {
    try {
      const response = await apiService.get('/doacoes/estatisticas', filtros);
      if (response.success) {
        const stats = response.data;
        return {
          totalDoacoes: stats.totalDoacoes || 0,
          valorTotal: stats.valorTotal || 0,
          totalPessoaFisica: stats.doacoesPorTipo?.find(t => t.tipo_doador === 'PF')?.quantidade || 0,
          totalPessoaJuridica: stats.doacoesPorTipo?.find(t => t.tipo_doador === 'PJ')?.quantidade || 0,
          ultimaDoacao: stats.ultimaDoacao
        };
      }
      return {
        totalDoacoes: 0,
        valorTotal: 0,
        totalPessoaFisica: 0,
        totalPessoaJuridica: 0
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw new Error('Erro ao carregar estatísticas. Tente novamente.');
    }
  }
}

// Instancia singleton mantendo compatibilidade
const doacoesService = new DoacoesService();

// Métodos de compatibilidade para código existente que pode ainda usar localStorage
const STORAGE_KEY = 'casa_mais_doacoes';

// Migração automática de dados do localStorage (executa apenas uma vez)
let migrationDone = false;

const migrarDadosLocalStorage = async () => {
  if (migrationDone) return;
  
  try {
    const dadosLocais = localStorage.getItem(STORAGE_KEY);
    if (dadosLocais) {
      const doacoes = JSON.parse(dadosLocais);
      
      if (doacoes.length > 0) {
        console.log('Migrando', doacoes.length, 'doações do localStorage para a API...');
        
        for (const doacao of doacoes) {
          try {
            // Remove o ID local pois a API vai gerar um novo
            const { id, ...doacaoSemId } = doacao;
            await doacoesService.create(doacaoSemId);
          } catch (error) {
            console.warn('Erro ao migrar doação:', error);
          }
        }
        
        // Backup dos dados locais e limpa localStorage
        localStorage.setItem(STORAGE_KEY + '_backup', dadosLocais);
        localStorage.removeItem(STORAGE_KEY);
        
        console.log('Migração concluída! Dados locais foram movidos para _backup.');
      }
    }
  } catch (error) {
    console.warn('Erro durante migração:', error);
  } finally {
    migrationDone = true;
  }
};

// Executa migração quando o módulo é carregado
migrarDadosLocalStorage();

export default doacoesService;