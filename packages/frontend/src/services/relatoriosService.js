import apiService from './api';

class RelatoriosService {
  async getDashboard() {
    return apiService.get('/relatorios/dashboard');
  }

  async getRelatorioAssistidas(filtros = {}) {
    return apiService.get('/relatorios/assistidas', filtros);
  }

  async getRelatorioMedicamentos(filtros = {}) {
    return apiService.get('/relatorios/medicamentos', filtros);
  }

  async getRelatorioDoacoes(filtros = {}) {
    return apiService.get('/relatorios/doacoes', filtros);
  }

  async getRelatorioDespesas(filtros = {}) {
    return apiService.get('/relatorios/despesas', filtros);
  }

  async getRelatorioInternacoes(filtros = {}) {
    return apiService.get('/relatorios/internacoes', filtros);
  }

  async getRelatorioConsultas(filtros = {}) {
    return apiService.get('/relatorios/consultas', filtros);
  }

  async getRelatorioCaixa(filtros = {}) {
    return apiService.get('/relatorios/caixa', filtros);
  }

  // Helper method to transform camelCase to snake_case for backend compatibility
  _transformFilters(filtros) {
    const transformed = { ...filtros };
    
    // Transform date fields from camelCase to snake_case
    if (transformed.dataInicio) {
      transformed.data_inicio = transformed.dataInicio;
      delete transformed.dataInicio;
    }
    if (transformed.dataFim) {
      transformed.data_fim = transformed.dataFim;
      delete transformed.dataFim;
    }
    
    // Transform other common fields
    if (transformed.doadorId) {
      transformed.doador_id = transformed.doadorId;
      delete transformed.doadorId;
    }
    if (transformed.assistidaId) {
      transformed.assistida_id = transformed.assistidaId;
      delete transformed.assistidaId;
    }
    if (transformed.medicamentoId) {
      transformed.medicamento_id = transformed.medicamentoId;
      delete transformed.medicamentoId;
    }
    if (transformed.tipoMovimento) {
      transformed.tipo_movimento = transformed.tipoMovimento;
      delete transformed.tipoMovimento;
    }
    if (transformed.tipoDoador) {
      transformed.tipo_doador = transformed.tipoDoador;
      delete transformed.tipoDoador;
    }
    if (transformed.idadeMin) {
      transformed.idade_min = transformed.idadeMin;
      delete transformed.idadeMin;
    }
    if (transformed.idadeMax) {
      transformed.idade_max = transformed.idadeMax;
      delete transformed.idadeMax;
    }
    
    return transformed;
  }

  async exportarPDF(tipoRelatorio, filtros = {}) {
    try {
      const transformedFilters = this._transformFilters(filtros);

      console.log('[PDF Export] Starting export:', {
        tipoRelatorio,
        filtros,
        transformedFilters
      });

      const response = await apiService.request(`/relatorios/${tipoRelatorio}/pdf`, {
        method: 'POST',
        body: JSON.stringify(transformedFilters),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/pdf'
        }
      });

      console.log('[PDF Export] Response received:', {
        hasBlob: !!response?.blob,
        response: response,
        blobSize: response?.blob?.size,
        blobType: response?.blob?.type
      });

      // If response contains blob, trigger download
      if (response && response.blob) {
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `relatorio_${tipoRelatorio}_${timestamp}.pdf`;
        this._triggerDownload(response.blob, filename, 'application/pdf');
        return { success: true, message: 'PDF gerado com sucesso!' };
      }

      // If no blob, return error
      throw new Error('Resposta inválida do servidor - arquivo não recebido');

    } catch (error) {
      console.error(`[PDF Export] Erro ao exportar PDF ${tipoRelatorio}:`, error);
      return {
        success: false,
        message: `Erro ao gerar PDF: ${error.message}`,
        error: error.message
      };
    }
  }

  async exportarExcel(tipoRelatorio, filtros = {}) {
    try {
      const transformedFilters = this._transformFilters(filtros);

      console.log('[Excel Export] Starting export:', {
        tipoRelatorio,
        filtros,
        transformedFilters
      });

      const response = await apiService.request(`/relatorios/${tipoRelatorio}/excel`, {
        method: 'POST',
        body: JSON.stringify(transformedFilters),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      });

      console.log('[Excel Export] Response received:', {
        hasBlob: !!response?.blob,
        response: response,
        blobSize: response?.blob?.size,
        blobType: response?.blob?.type
      });

      // If response contains blob, trigger download
      if (response && response.blob) {
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `relatorio_${tipoRelatorio}_${timestamp}.xlsx`;
        this._triggerDownload(response.blob, filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        return { success: true, message: 'Excel gerado com sucesso!' };
      }

      // If no blob, return error
      throw new Error('Resposta inválida do servidor - arquivo não recebido');

    } catch (error) {
      console.error(`[Excel Export] Erro ao exportar Excel ${tipoRelatorio}:`, error);
      return {
        success: false,
        message: `Erro ao gerar Excel: ${error.message}`,
        error: error.message
      };
    }
  }

  // Helper method to trigger file download
  _triggerDownload(blob, filename, mimeType) {
    try {
      // Ensure we have a valid blob
      if (!blob || blob.size === 0) {
        console.error('Blob inválido ou vazio:', { blob, size: blob?.size });
        throw new Error('Arquivo vazio ou inválido recebido do servidor');
      }

      // Check if blob is already a Blob object
      const finalBlob = blob instanceof Blob ? blob : new Blob([blob], { type: mimeType });

      // Create blob URL
      const url = window.URL.createObjectURL(finalBlob);

      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';

      // Add to DOM, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the blob URL
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);

      console.log(`Download iniciado: ${filename} (${(finalBlob.size / 1024).toFixed(2)} KB)`);
    } catch (error) {
      console.error('Erro no download:', error);
      throw error;
    }
  }

  async getGraficos(tipo, periodo = {}) {
    return apiService.get(`/relatorios/graficos/${tipo}`, periodo);
  }

  async getEstatisticasGerais() {
    return apiService.get('/relatorios/estatisticas-gerais');
  }

  async getComparativoMensal(ano) {
    return apiService.get('/relatorios/comparativo-mensal', { ano });
  }

  async getTendencias() {
    return apiService.get('/relatorios/tendencias');
  }
}

const relatoriosService = new RelatoriosService();
export default relatoriosService;
