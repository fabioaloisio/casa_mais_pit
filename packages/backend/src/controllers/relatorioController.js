const RelatorioRepository = require('../repository/relatorioRepository');
const { success, serverError, badRequest } = require('../../../shared/utils/responseHelper');
const { formatCurrency } = require('../../../shared/src/utils');
const PDFDocument = require('pdfkit');
const XLSX = require('xlsx');

const relatorioRepository = new RelatorioRepository();

// RF_S1 - Relatório de Assistidas
const relatorioAssistidas = async (req, res) => {
  try {
    const { 
      data_inicio, 
      data_fim, 
      status,
      idade_min,
      idade_max,
      formato 
    } = req.query;
    
    const relatorio = await relatorioRepository.relatorioAssistidas({
      data_inicio,
      data_fim,
      status,
      idade_min,
      idade_max
    });

    return success(res, 'Relatório de assistidas gerado com sucesso', relatorio);
  } catch (error) {
    console.error('Erro ao gerar relatório de assistidas:', error);
    return serverError(res, 'Erro ao gerar relatório de assistidas', [error.message]);
  }
};

// RF_S2 - Relatório de Despesas (Apenas Admin)
const relatorioDespesas = async (req, res) => {
  try {
    const { 
      data_inicio, 
      data_fim, 
      categoria,
      status 
    } = req.query;
    
    if (!data_inicio || !data_fim) {
      return badRequest(res, 'Período é obrigatório', ['Informe data_inicio e data_fim']);
    }

    const relatorio = await relatorioRepository.relatorioDespesas({
      data_inicio,
      data_fim,
      categoria,
      status
    });

    return success(res, 'Relatório de despesas gerado com sucesso', relatorio);
  } catch (error) {
    console.error('Erro ao gerar relatório de despesas:', error);
    return serverError(res, 'Erro ao gerar relatório de despesas', [error.message]);
  }
};

// RF_S3 - Relatório de Consultas
const relatorioConsultas = async (req, res) => {
  try {
    const { 
      data_inicio, 
      data_fim,
      assistida_id,
      medico_id,
      status 
    } = req.query;
    
    const relatorio = await relatorioRepository.relatorioConsultas({
      data_inicio,
      data_fim,
      assistida_id,
      medico_id,
      status
    });

    return success(res, 'Relatório de consultas gerado com sucesso', relatorio);
  } catch (error) {
    console.error('Erro ao gerar relatório de consultas:', error);
    return serverError(res, 'Erro ao gerar relatório de consultas', [error.message]);
  }
};

// RF_S4 - Relatório de Doações (Apenas Admin)
const relatorioDoacoes = async (req, res) => {
  try {
    const { 
      data_inicio, 
      data_fim,
      doador_id,
      tipo 
    } = req.query;
    
    if (!data_inicio || !data_fim) {
      return badRequest(res, 'Período é obrigatório', ['Informe data_inicio e data_fim']);
    }

    const relatorio = await relatorioRepository.relatorioDoacoes({
      data_inicio,
      data_fim,
      doador_id,
      tipo
    });

    return success(res, 'Relatório de doações gerado com sucesso', relatorio);
  } catch (error) {
    console.error('Erro ao gerar relatório de doações:', error);
    return serverError(res, 'Erro ao gerar relatório de doações', [error.message]);
  }
};

// RF_S5 - Relatório de Medicamentos
const relatorioMedicamentos = async (req, res) => {
  try {
    const { 
      data_inicio, 
      data_fim,
      medicamento_id,
      tipo_movimento 
    } = req.query;
    
    const relatorio = await relatorioRepository.relatorioMedicamentos({
      data_inicio,
      data_fim,
      medicamento_id,
      tipo_movimento
    });

    return success(res, 'Relatório de medicamentos gerado com sucesso', relatorio);
  } catch (error) {
    console.error('Erro ao gerar relatório de medicamentos:', error);
    return serverError(res, 'Erro ao gerar relatório de medicamentos', [error.message]);
  }
};

// RF_S6 - Relatório de Internações
const relatorioInternacoes = async (req, res) => {
  try {
    const { 
      data_inicio, 
      data_fim,
      assistida_id,
      status 
    } = req.query;
    
    const relatorio = await relatorioRepository.relatorioInternacoes({
      data_inicio,
      data_fim,
      assistida_id,
      status
    });

    return success(res, 'Relatório de internações gerado com sucesso', relatorio);
  } catch (error) {
    console.error('Erro ao gerar relatório de internações:', error);
    return serverError(res, 'Erro ao gerar relatório de internações', [error.message]);
  }
};

// RF_S7 - Relatório de Doadores (Apenas Admin)
const relatorioDoadores = async (req, res) => {
  try {
    const { 
      data_inicio, 
      data_fim,
      ativo,
      tipo_doador 
    } = req.query;
    
    const relatorio = await relatorioRepository.relatorioDoadores({
      data_inicio,
      data_fim,
      ativo,
      tipo_doador
    });

    return success(res, 'Relatório de doadores gerado com sucesso', relatorio);
  } catch (error) {
    console.error('Erro ao gerar relatório de doadores:', error);
    return serverError(res, 'Erro ao gerar relatório de doadores', [error.message]);
  }
};

// Relatório Consolidado Gerencial
const relatorioGerencial = async (req, res) => {
  try {
    const { mes, ano } = req.query;
    
    const mesAtual = mes || new Date().getMonth() + 1;
    const anoAtual = ano || new Date().getFullYear();
    
    const relatorio = await relatorioRepository.relatorioGerencial(mesAtual, anoAtual);
    
    return success(res, 'Relatório gerencial gerado com sucesso', relatorio);
  } catch (error) {
    console.error('Erro ao gerar relatório gerencial:', error);
    return serverError(res, 'Erro ao gerar relatório gerencial', [error.message]);
  }
};

// Dashboard com indicadores principais
const dashboard = async (req, res) => {
  try {
    const indicadores = await relatorioRepository.getDashboardIndicadores();
    
    return success(res, 'Indicadores do dashboard obtidos com sucesso', indicadores);
  } catch (error) {
    console.error('Erro ao obter indicadores do dashboard:', error);
    return serverError(res, 'Erro ao obter indicadores do dashboard', [error.message]);
  }
};

// Relatório de Vendas
const relatorioVendas = async (req, res) => {
  try {
    const { 
      data_inicio, 
      data_fim, 
      produto_id,
      forma_pagamento
    } = req.query;
    
    if (!data_inicio || !data_fim) {
      return badRequest(res, 'Período é obrigatório', ['Informe data_inicio e data_fim']);
    }

    const relatorio = await relatorioRepository.relatorioVendas({
      data_inicio,
      data_fim,
      produto_id,
      forma_pagamento
    });

    return success(res, 'Relatório de vendas gerado com sucesso', relatorio);
  } catch (error) {
    console.error('Erro ao gerar relatório de vendas:', error);
    return serverError(res, 'Erro ao gerar relatório de vendas', [error.message]);
  }
};

// Helper function to generate PDF
const gerarPDF = (dados, titulo, colunas, res) => {
  try {
    // Validate input parameters first - BEFORE setting any headers
    if (!titulo || typeof titulo !== 'string') {
      return serverError(res, 'Título inválido para o PDF', ['Título é obrigatório']);
    }

    if (!Array.isArray(colunas) || colunas.length === 0) {
      return serverError(res, 'Colunas inválidas para o PDF', ['Colunas são obrigatórias']);
    }

    // Ensure dados is always an array
    const dadosArray = Array.isArray(dados) ? dados : [];

    console.log(`[PDF DEBUG] Generating PDF: ${titulo}, Data count: ${dadosArray.length}`);

    // Create PDF document with buffer collection
    const doc = new PDFDocument({
      margin: 50,
      size: 'A4',
      layout: 'landscape',
      bufferPages: true,
      autoFirstPage: true
    });

    // Collect PDF chunks into buffer
    const buffers = [];
    doc.on('data', (chunk) => {
      buffers.push(chunk);
    });

    // When PDF generation is complete, send the response
    doc.on('end', () => {
      try {
        const pdfBuffer = Buffer.concat(buffers);
        console.log(`[PDF DEBUG] PDF Buffer size: ${pdfBuffer.length} bytes`);

        // Verify PDF signature
        if (pdfBuffer.length > 4) {
          const signature = pdfBuffer.slice(0, 4).toString('utf8');
          console.log(`[PDF DEBUG] PDF Signature: "${signature}" (should be "%PDF")`);
        }

        // Send the complete PDF buffer with proper headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(titulo)}.pdf"`);
        res.setHeader('Content-Length', pdfBuffer.length);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.status(200).send(pdfBuffer);
      } catch (error) {
        console.error('[PDF DEBUG] Error sending PDF:', error);
        if (!res.headersSent) {
          return serverError(res, 'Erro ao enviar PDF', [error.message]);
        }
      }
    });

    // Handle PDF document errors
    doc.on('error', (error) => {
      console.error('[PDF DEBUG] PDF document error:', error);
      if (!res.headersSent) {
        return serverError(res, 'Erro ao criar PDF', [error.message]);
      }
    });

    // Add title
    doc.fontSize(18).fillColor('#2d3748').text(titulo, 50, 50);
    doc.moveDown();

    // Add current date
    doc.fontSize(10).fillColor('#718096').text(
      `Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
      50, 80
    );
    doc.moveDown(2);

    // Calculate column widths based on page size
    const pageWidth = doc.page.width - 100; // minus margins
    const columnWidth = Math.floor(pageWidth / colunas.length);

    // Add headers with background
    let yPosition = 120;
    doc.fontSize(12).fillColor('#2d3748');

    // Draw header background
    doc.rect(50, yPosition - 5, pageWidth, 25).fill('#f7fafc');

    // Add header text
    colunas.forEach((coluna, index) => {
      const header = coluna.header || coluna.field || 'N/A';
      doc.fillColor('#2d3748').text(
        header.substring(0, 15), // Limit header length
        50 + (index * columnWidth),
        yPosition,
        { width: columnWidth - 5, align: 'left' }
      );
    });
    yPosition += 30;

    // Add data rows or "no data" message
    if (dadosArray.length === 0) {
      doc.fontSize(12).fillColor('#e53e3e').text(
        'Nenhum dado encontrado para o período selecionado.',
        50, yPosition
      );
      yPosition += 30;
    } else {
      dadosArray.forEach((item, rowIndex) => {
        if (yPosition > 500) { // New page if needed (landscape)
          doc.addPage();
          yPosition = 50;
        }

        // Alternate row colors
        if (rowIndex % 2 === 0) {
          doc.rect(50, yPosition - 2, pageWidth, 20).fill('#f9f9f9');
        }

        doc.fontSize(9).fillColor('#2d3748');

        colunas.forEach((coluna, colIndex) => {
          const fieldKey = coluna.field || coluna.accessor || '';
          let valor = '';

          // Try to get value with fallback to different field names
          if (fieldKey && item) {
            valor = item[fieldKey];

            // If field not found, try common variations
            if (valor === undefined) {
              if (fieldKey === 'dataCadastro' && item.createdAt !== undefined) {
                valor = item.createdAt;
              } else if (fieldKey === 'createdAt' && item.dataCadastro !== undefined) {
                valor = item.dataCadastro;
              } else if (fieldKey === 'data' && item.data_despesa !== undefined) {
                valor = item.data_despesa;
              } else if (fieldKey === 'data_despesa' && item.data !== undefined) {
                valor = item.data;
              }
            }
          }

          // Format values for PDF display
          if (valor === null || valor === undefined) {
            valor = '';
          } else if (valor instanceof Date) {
            valor = valor.toLocaleDateString('pt-BR');
          } else if (typeof valor === 'object') {
            valor = Array.isArray(valor) ? valor.join(', ') : JSON.stringify(valor);
          } else if (typeof valor === 'number' && fieldKey.includes('valor')) {
            valor = formatCurrency(valor);
          } else if (typeof valor === 'boolean') {
            valor = valor ? 'Sim' : 'Não';
          } else {
            valor = String(valor);
          }

          // Truncate long values
          const displayValue = valor.length > 20 ? valor.substring(0, 18) + '...' : valor;

          doc.text(
            displayValue,
            50 + (colIndex * columnWidth),
            yPosition,
            { width: columnWidth - 5, align: 'left' }
          );
        });

        yPosition += 20;
      });
    }

    // Finalize the PDF (removed footer to avoid corruption)
    doc.end();

  } catch (error) {
    console.error('[PDF DEBUG] Error generating PDF:', error);
    // Only send error response if headers haven't been sent yet
    if (!res.headersSent) {
      return serverError(res, 'Erro ao gerar PDF', [error.message]);
    }
    // If we're already streaming, just end the response
    res.end();
  }
};

// Helper function to generate Excel
const gerarExcel = (dados, titulo, colunas, res) => {
  try {
    console.log('[EXCEL DEBUG] Starting Excel generation:', {
      titulo,
      colunasCount: colunas?.length,
      dadosType: typeof dados,
      dadosIsArray: Array.isArray(dados),
      dadosLength: Array.isArray(dados) ? dados.length : 'not array'
    });

    // Validate input parameters first
    if (!titulo || typeof titulo !== 'string') {
      return serverError(res, 'Título inválido para o Excel', ['Título é obrigatório']);
    }

    if (!Array.isArray(colunas) || colunas.length === 0) {
      return serverError(res, 'Colunas inválidas para o Excel', ['Colunas são obrigatórias']);
    }

    // Ensure dados is always an array
    const dadosArray = Array.isArray(dados) ? dados : [];

    console.log('[EXCEL DEBUG] Data array prepared:', {
      length: dadosArray.length,
      firstItem: dadosArray[0] ? Object.keys(dadosArray[0]) : 'empty'
    });

    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Helper function to sanitize values for Excel
    const sanitizeValue = (valor, fieldKey) => {
      // Handle null/undefined first
      if (valor === null || valor === undefined) {
        return '';
      }

      // Handle different types systematically
      switch (typeof valor) {
        case 'string':
          return valor.trim();

        case 'number':
          if (isNaN(valor) || !isFinite(valor)) {
            return '';
          }
          // Format monetary values
          if (fieldKey.includes('valor') || fieldKey.includes('preco') || fieldKey.includes('custo')) {
            return formatCurrency(valor);
          }
          return valor.toString();

        case 'boolean':
          return valor ? 'Sim' : 'Não';

        case 'bigint':
          return valor.toString();

        case 'object':
          // Handle Date objects
          if (valor instanceof Date) {
            if (isNaN(valor.getTime())) {
              return '';
            }
            return valor.toLocaleDateString('pt-BR');
          }

          // Handle Arrays
          if (Array.isArray(valor)) {
            return valor.map(v => sanitizeValue(v, fieldKey)).join(', ');
          }

          // Handle Buffer (sometimes from database)
          if (Buffer.isBuffer(valor)) {
            return valor.toString('utf8');
          }

          // Handle plain objects - convert to readable string
          try {
            const keys = Object.keys(valor);
            if (keys.length === 0) {
              return '';
            }
            // For simple objects, create a readable representation
            return keys.map(key => `${key}: ${sanitizeValue(valor[key], fieldKey)}`).join('; ');
          } catch (e) {
            return String(valor);
          }

        default:
          return String(valor);
      }
    };

    // Transform data based on columns with robust sanitization
    const dadosTransformados = dadosArray.map((item, index) => {
      const novoItem = {};

      if (index === 0) {
        console.log('[EXCEL DEBUG] Processing first item:', JSON.stringify(item, null, 2));
      }

      colunas.forEach(coluna => {
        const fieldKey = coluna.field || coluna.accessor || '';
        let rawValue = '';

        // Try to get value with fallback to different field names
        if (fieldKey && item) {
          rawValue = item[fieldKey];

          // If field not found, try common variations
          if (rawValue === undefined) {
            if (fieldKey === 'dataCadastro' && item.createdAt !== undefined) {
              rawValue = item.createdAt;
            } else if (fieldKey === 'createdAt' && item.dataCadastro !== undefined) {
              rawValue = item.dataCadastro;
            } else if (fieldKey === 'data' && item.data_despesa !== undefined) {
              rawValue = item.data_despesa;
            } else if (fieldKey === 'data_despesa' && item.data !== undefined) {
              rawValue = item.data;
            }
          }
        }

        const sanitizedValue = sanitizeValue(rawValue, fieldKey);

        if (index === 0) {
          console.log(`[EXCEL DEBUG] Field ${fieldKey} -> ${coluna.header}: ${JSON.stringify(rawValue)} -> ${sanitizedValue}`);
        }

        novoItem[coluna.header] = sanitizedValue;
      });
      return novoItem;
    });

    // If no data, add a "no data" row with message
    if (dadosTransformados.length === 0) {
      const emptyRow = {};
      colunas.forEach((coluna, index) => {
        emptyRow[coluna.header] = index === 0 ? 'Nenhum dado encontrado' : '';
      });
      emptyRow[colunas[0].header] = 'Nenhum dado encontrado para o período selecionado.';
      dadosTransformados.push(emptyRow);
    }

    console.log('[EXCEL DEBUG] Data transformed:', {
      length: dadosTransformados.length,
      firstItem: dadosTransformados[0]
    });

    // Create worksheet from sanitized data - SIMPLIFIED
    const ws = XLSX.utils.json_to_sheet(dadosTransformados);

    console.log('[EXCEL DEBUG] Worksheet created');

    // Add the worksheet to the workbook
    const sheetName = 'Relatorio'; // Simple sheet name to avoid issues
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    console.log('[EXCEL DEBUG] Worksheet added to workbook');

    // Generate buffer with proper options
    const buffer = XLSX.write(wb, {
      type: 'buffer',
      bookType: 'xlsx',
      compression: true,
      cellStyles: true,
      Props: {
        Title: titulo,
        Author: 'Casa Mais PIT',
        CreatedDate: new Date()
      }
    });

    // Verify buffer was generated
    if (!buffer || buffer.length === 0) {
      throw new Error('Failed to generate Excel buffer');
    }

    // Buffer generated successfully

    // Set response headers with proper encoding
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(titulo + '_' + new Date().toISOString().split('T')[0])}.xlsx"`);
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Send the buffer
    res.send(buffer);

    // Excel sent successfully

  } catch (error) {
    console.error('Erro ao gerar Excel:', {
      message: error.message,
      stack: error.stack,
      titulo,
      dadosLength: Array.isArray(dados) ? dados.length : 'not array'
    });
    if (!res.headersSent) {
      return serverError(res, 'Erro ao gerar Excel', [error.message]);
    }
  }
};

// PDF Export Functions
const exportarAssistidasPDF = async (req, res) => {
  try {
    const { data_inicio, data_fim, status, idade_min, idade_max } = req.body;
    const relatorio = await relatorioRepository.relatorioAssistidas({
      data_inicio, data_fim, status, idade_min, idade_max
    });

    const colunas = [
      { header: 'Nome', field: 'nome' },
      { header: 'CPF', field: 'cpf' },
      { header: 'Idade', field: 'idade' },
      { header: 'Status', field: 'status' },
      { header: 'Data Cadastro', field: 'createdAt' }
    ];

    // Extract the assistidas array from the report object
    const assistidasArray = relatorio.assistidas || [];
    console.log(`[PDF] Exporting assistidas: ${assistidasArray.length} records`);
    gerarPDF(assistidasArray, 'Relatório de Assistidas', colunas, res);
  } catch (error) {
    console.error('Erro ao exportar assistidas PDF:', error);
    return serverError(res, 'Erro ao exportar assistidas PDF', [error.message]);
  }
};

const exportarDespesasPDF = async (req, res) => {
  try {
    const { data_inicio, data_fim, categoria, status } = req.body;
    if (!data_inicio || !data_fim) {
      return badRequest(res, 'Período é obrigatório', ['Informe data_inicio e data_fim']);
    }

    const relatorio = await relatorioRepository.relatorioDespesas({
      data_inicio, data_fim, categoria, status
    });

    const colunas = [
      { header: 'Descrição', field: 'descricao' },
      { header: 'Categoria', field: 'tipo_despesa_nome' },
      { header: 'Valor', field: 'valor' },
      { header: 'Data', field: 'data_despesa' },
      { header: 'Status', field: 'status' }
    ];

    // Extract the despesas array from the report object
    const despesasArray = relatorio.despesas || [];
    gerarPDF(despesasArray, 'Relatório de Despesas', colunas, res);
  } catch (error) {
    console.error('Erro ao exportar despesas PDF:', error);
    return serverError(res, 'Erro ao exportar despesas PDF', [error.message]);
  }
};

const exportarConsultasPDF = async (req, res) => {
  try {
    const { data_inicio, data_fim, assistida_id, medico_id, status } = req.body;
    const relatorio = await relatorioRepository.relatorioConsultas({
      data_inicio, data_fim, assistida_id, medico_id, status
    });

    const colunas = [
      { header: 'Assistida', field: 'assistida_nome' },
      { header: 'Profissional', field: 'medico_nome' },
      { header: 'Data', field: 'data_consulta' },
      { header: 'Tipo', field: 'tipo_consulta' },
      { header: 'Status', field: 'status' }
    ];

    // Extract the consultas array from the report object
    const consultasArray = relatorio.consultas || [];
    gerarPDF(consultasArray, 'Relatório de Consultas', colunas, res);
  } catch (error) {
    console.error('Erro ao exportar consultas PDF:', error);
    return serverError(res, 'Erro ao exportar consultas PDF', [error.message]);
  }
};

const exportarDoacoesPDF = async (req, res) => {
  try {
    const { data_inicio, data_fim, doador_id, tipo } = req.body;
    if (!data_inicio || !data_fim) {
      return badRequest(res, 'Período é obrigatório', ['Informe data_inicio e data_fim']);
    }
    
    const relatorio = await relatorioRepository.relatorioDoacoes({
      data_inicio, data_fim, doador_id, tipo
    });
    
    // Combinar doações de itens e monetárias em um único array
    const todasDoacoes = [
      ...relatorio.doacoes_itens.map(d => ({
        doador: d.doador_nome || 'N/A',
        tipo: 'Item/Medicamento',
        valor: d.valor ? parseFloat(d.valor) : 0,
        data: d.data_doacao,
        status: 'Confirmado'
      })),
      ...relatorio.doacoes_monetarias.map(d => ({
        doador: d.doador_nome || 'N/A',
        tipo: 'Monetária',
        valor: d.valor ? parseFloat(d.valor) : 0,
        data: d.data_movimentacao,
        status: 'Confirmado'
      }))
    ];
    
    const colunas = [
      { header: 'Doador', field: 'doador' },
      { header: 'Tipo', field: 'tipo' },
      { header: 'Valor', field: 'valor' },
      { header: 'Data', field: 'data' },
      { header: 'Status', field: 'status' }
    ];
    
    gerarPDF(todasDoacoes, 'Relatório de Doações', colunas, res);
  } catch (error) {
    console.error('Erro ao exportar doações PDF:', error);
    return serverError(res, 'Erro ao exportar doações PDF', [error.message]);
  }
};

const exportarMedicamentosPDF = async (req, res) => {
  try {
    const { data_inicio, data_fim, medicamento_id, tipo_movimento } = req.body;
    const relatorio = await relatorioRepository.relatorioMedicamentos({
      data_inicio, data_fim, medicamento_id, tipo_movimento
    });

    const colunas = [
      { header: 'Medicamento', field: 'nome' },
      { header: 'Descrição', field: 'descricao' },
      { header: 'Unidade', field: 'unidade_nome' },
      { header: 'Estoque Mínimo', field: 'estoque_minimo' },
      { header: 'Estoque Atual', field: 'estoque_atual' }
    ];

    // Use medicamentos array instead of movimentacoes (which is empty for now)
    const medicamentosArray = relatorio.medicamentos || [];
    gerarPDF(medicamentosArray, 'Relatório de Medicamentos', colunas, res);
  } catch (error) {
    console.error('Erro ao exportar medicamentos PDF:', error);
    return serverError(res, 'Erro ao exportar medicamentos PDF', [error.message]);
  }
};

const exportarInternacoesPDF = async (req, res) => {
  try {
    const { data_inicio, data_fim, assistida_id, status } = req.body;
    const relatorio = await relatorioRepository.relatorioInternacoes({
      data_inicio, data_fim, assistida_id, status
    });

    const colunas = [
      { header: 'Assistida', field: 'assistida_nome' },
      { header: 'Data Entrada', field: 'data_entrada' },
      { header: 'Data Saída', field: 'data_saida' },
      { header: 'Status', field: 'status' },
      { header: 'Observações', field: 'observacoes' }
    ];

    // Extract the internacoes array from the report object
    const internacoesArray = relatorio.internacoes || [];
    gerarPDF(internacoesArray, 'Relatório de Internações', colunas, res);
  } catch (error) {
    console.error('Erro ao exportar internações PDF:', error);
    return serverError(res, 'Erro ao exportar internações PDF', [error.message]);
  }
};

const exportarDoadoresPDF = async (req, res) => {
  try {
    const { data_inicio, data_fim, ativo, tipo_doador } = req.body;
    const relatorio = await relatorioRepository.relatorioDoadores({
      data_inicio, data_fim, ativo, tipo_doador
    });
    
    const colunas = [
      { header: 'Nome', field: 'nome' },
      { header: 'Tipo', field: 'tipo_doador' },
      { header: 'Documento', field: 'documento' },
      { header: 'Contato', field: 'telefone' },
      { header: 'Ativo', field: 'ativo' }
    ];
    
    const doadoresArray = relatorio.doadores || [];
    gerarPDF(doadoresArray, 'Relatório de Doadores', colunas, res);
  } catch (error) {
    console.error('Erro ao exportar doadores PDF:', error);
    return serverError(res, 'Erro ao exportar doadores PDF', [error.message]);
  }
};

const exportarCaixaPDF = async (req, res) => {
  try {
    // Placeholder for Caixa report - implement based on your repository method
    const relatorio = []; // await relatorioRepository.relatorioCaixa(...);
    
    const colunas = [
      { header: 'Descrição', field: 'descricao' },
      { header: 'Tipo', field: 'tipo' },
      { header: 'Valor', field: 'valor' },
      { header: 'Data', field: 'data' }
    ];
    
    gerarPDF(relatorio, 'Relatório de Caixa', colunas, res);
  } catch (error) {
    console.error('Erro ao exportar caixa PDF:', error);
    return serverError(res, 'Erro ao exportar caixa PDF', [error.message]);
  }
};

// Excel Export Functions
const exportarAssistidasExcel = async (req, res) => {
  try {
    const { data_inicio, data_fim, status, idade_min, idade_max } = req.body;
    const relatorio = await relatorioRepository.relatorioAssistidas({
      data_inicio, data_fim, status, idade_min, idade_max
    });

    const colunas = [
      { header: 'Nome', field: 'nome' },
      { header: 'CPF', field: 'cpf' },
      { header: 'Idade', field: 'idade' },
      { header: 'Status', field: 'status' },
      { header: 'Data Cadastro', field: 'createdAt' }  // Fixed: was dataCadastro, should be createdAt
    ];

    // Extract the assistidas array from the report object
    const assistidasArray = relatorio.assistidas || [];
    console.log(`[EXCEL] Exporting assistidas: ${assistidasArray.length} records`);
    gerarExcel(assistidasArray, 'Relatório de Assistidas', colunas, res);
  } catch (error) {
    console.error('Erro ao exportar assistidas Excel:', error);
    return serverError(res, 'Erro ao exportar assistidas Excel', [error.message]);
  }
};

const exportarDespesasExcel = async (req, res) => {
  try {
    console.log('📊 [EXCEL DEBUG] Iniciando exportação despesas Excel');
    console.log('📊 [EXCEL DEBUG] req.body:', JSON.stringify(req.body, null, 2));
    
    const { data_inicio, data_fim, categoria, status } = req.body;
    if (!data_inicio || !data_fim) {
      return badRequest(res, 'Período é obrigatório', ['Informe data_inicio e data_fim']);
    }
    
    console.log('📊 [EXCEL DEBUG] Parametros validados:', { data_inicio, data_fim, categoria, status });
    
    console.log('📊 [EXCEL DEBUG] Chamando relatorioDespesas...');
    const relatorio = await relatorioRepository.relatorioDespesas({
      data_inicio, data_fim, categoria, status
    });
    
    console.log('📊 [EXCEL DEBUG] Relatorio retornado:', {
      tipo: typeof relatorio,
      isArray: Array.isArray(relatorio),
      keys: relatorio ? Object.keys(relatorio) : 'null',
      despesas: relatorio?.despesas ? `Array[${relatorio.despesas.length}]` : 'undefined'
    });
    
    const colunas = [
      { header: 'Descrição', field: 'descricao' },
      { header: 'Categoria', field: 'tipo_despesa_nome' },
      { header: 'Valor', field: 'valor' },
      { header: 'Data', field: 'data_despesa' },
      { header: 'Status', field: 'status' }
    ];
    
    console.log('📊 [EXCEL DEBUG] Colunas definidas:', colunas);
    
    // Extract the despesas array from the report object
    const despesasArray = relatorio.despesas || [];
    console.log('📊 [EXCEL DEBUG] DespesasArray extraido:', {
      length: despesasArray.length,
      isArray: Array.isArray(despesasArray),
      firstItem: despesasArray[0] || 'empty'
    });
    
    console.log('📊 [EXCEL DEBUG] Chamando gerarExcel...');
    gerarExcel(despesasArray, 'Relatório de Despesas', colunas, res);
    console.log('📊 [EXCEL DEBUG] gerarExcel concluído com sucesso');
  } catch (error) {
    console.error('📊 [EXCEL DEBUG] ERRO na exportação despesas Excel:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return serverError(res, 'Erro ao exportar despesas Excel', [error.message]);
  }
};

const exportarConsultasExcel = async (req, res) => {
  try {
    const { data_inicio, data_fim, assistida_id, medico_id, status } = req.body;
    const relatorio = await relatorioRepository.relatorioConsultas({
      data_inicio, data_fim, assistida_id, medico_id, status
    });
    
    const colunas = [
      { header: 'Assistida', field: 'assistida_nome' },
      { header: 'Profissional', field: 'medico_nome' },
      { header: 'Data', field: 'data_consulta' },
      { header: 'Tipo', field: 'tipo_consulta' },
      { header: 'Status', field: 'status' }
    ];
    
    // Extract the consultas array from the report object
    const consultasArray = relatorio.consultas || [];
    gerarExcel(consultasArray, 'Relatório de Consultas', colunas, res);
  } catch (error) {
    console.error('Erro ao exportar consultas Excel:', error);
    return serverError(res, 'Erro ao exportar consultas Excel', [error.message]);
  }
};

const exportarDoacoesExcel = async (req, res) => {
  try {
    const { data_inicio, data_fim, doador_id, tipo } = req.body;
    if (!data_inicio || !data_fim) {
      return badRequest(res, 'Período é obrigatório', ['Informe data_inicio e data_fim']);
    }
    
    const relatorio = await relatorioRepository.relatorioDoacoes({
      data_inicio, data_fim, doador_id, tipo
    });
    
    // Combinar doações de itens e monetárias em um único array
    const todasDoacoes = [
      ...relatorio.doacoes_itens.map(d => ({
        doador: d.doador_nome || 'N/A',
        tipo: 'Item/Medicamento',
        valor: d.valor ? parseFloat(d.valor) : 0,
        data: d.data_doacao,
        status: 'Confirmado'
      })),
      ...relatorio.doacoes_monetarias.map(d => ({
        doador: d.doador_nome || 'N/A',
        tipo: 'Monetária',
        valor: d.valor ? parseFloat(d.valor) : 0,
        data: d.data_movimentacao,
        status: 'Confirmado'
      }))
    ];
    
    const colunas = [
      { header: 'Doador', field: 'doador' },
      { header: 'Tipo', field: 'tipo' },
      { header: 'Valor', field: 'valor' },
      { header: 'Data', field: 'data' },
      { header: 'Status', field: 'status' }
    ];
    
    gerarExcel(todasDoacoes, 'Relatório de Doações', colunas, res);
  } catch (error) {
    console.error('Erro ao exportar doações Excel:', error);
    return serverError(res, 'Erro ao exportar doações Excel', [error.message]);
  }
};

const exportarMedicamentosExcel = async (req, res) => {
  try {
    const { data_inicio, data_fim, medicamento_id, tipo_movimento } = req.body;
    const relatorio = await relatorioRepository.relatorioMedicamentos({
      data_inicio, data_fim, medicamento_id, tipo_movimento
    });
    
    const colunas = [
      { header: 'Medicamento', field: 'nome' },
      { header: 'Descrição', field: 'descricao' },
      { header: 'Unidade', field: 'unidade_nome' },
      { header: 'Estoque Mínimo', field: 'estoque_minimo' },
      { header: 'Estoque Atual', field: 'estoque_atual' }
    ];

    // Use medicamentos array instead of movimentacoes (which is empty for now)
    const medicamentosArray = relatorio.medicamentos || [];
    gerarExcel(medicamentosArray, 'Relatório de Medicamentos', colunas, res);
  } catch (error) {
    console.error('Erro ao exportar medicamentos Excel:', error);
    return serverError(res, 'Erro ao exportar medicamentos Excel', [error.message]);
  }
};

const exportarInternacoesExcel = async (req, res) => {
  try {
    const { data_inicio, data_fim, assistida_id, status } = req.body;
    const relatorio = await relatorioRepository.relatorioInternacoes({
      data_inicio, data_fim, assistida_id, status
    });
    
    const colunas = [
      { header: 'Assistida', field: 'assistida_nome' },
      { header: 'Data Entrada', field: 'data_entrada' },
      { header: 'Data Saída', field: 'data_saida' },
      { header: 'Status', field: 'status' },
      { header: 'Observações', field: 'observacoes' }
    ];
    
    // Extract the internacoes array from the report object
    const internacoesArray = relatorio.internacoes || [];
    gerarExcel(internacoesArray, 'Relatório de Internações', colunas, res);
  } catch (error) {
    console.error('Erro ao exportar internações Excel:', error);
    return serverError(res, 'Erro ao exportar internações Excel', [error.message]);
  }
};

const exportarDoadoresExcel = async (req, res) => {
  try {
    const { data_inicio, data_fim, ativo, tipo_doador } = req.body;
    const relatorio = await relatorioRepository.relatorioDoadores({
      data_inicio, data_fim, ativo, tipo_doador
    });
    
    const colunas = [
      { header: 'Nome', field: 'nome' },
      { header: 'Tipo', field: 'tipo_doador' },
      { header: 'Documento', field: 'documento' },
      { header: 'Contato', field: 'telefone' },
      { header: 'Ativo', field: 'ativo' }
    ];
    
    // Extract the doadores array from the report object
    const doadoresArray = relatorio.doadores || [];
    gerarExcel(doadoresArray, 'Relatório de Doadores', colunas, res);
  } catch (error) {
    console.error('Erro ao exportar doadores Excel:', error);
    return serverError(res, 'Erro ao exportar doadores Excel', [error.message]);
  }
};

const exportarCaixaExcel = async (req, res) => {
  try {
    // Placeholder for Caixa report - implement based on your repository method
    const relatorio = []; // await relatorioRepository.relatorioCaixa(...);
    
    const colunas = [
      { header: 'Descrição', field: 'descricao' },
      { header: 'Tipo', field: 'tipo' },
      { header: 'Valor', field: 'valor' },
      { header: 'Data', field: 'data' }
    ];
    
    gerarExcel(relatorio, 'Relatório de Caixa', colunas, res);
  } catch (error) {
    console.error('Erro ao exportar caixa Excel:', error);
    return serverError(res, 'Erro ao exportar caixa Excel', [error.message]);
  }
};

// Graphics Functions
const graficosAssistidas = async (req, res) => {
  try {
    const { periodo = {} } = req.query;
    
    // Mock data for graphics - replace with actual data from repository
    const dadosGraficos = {
      labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
      datasets: [{
        label: 'Assistidas por Mês',
        data: [12, 15, 8, 20, 18, 25],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    };
    
    return success(res, 'Gráficos de assistidas carregados com sucesso', dadosGraficos);
  } catch (error) {
    console.error('Erro ao carregar gráficos de assistidas:', error);
    return serverError(res, 'Erro ao carregar gráficos de assistidas', [error.message]);
  }
};

const graficosMedicamentos = async (req, res) => {
  try {
    const { periodo = {} } = req.query;
    
    const dadosGraficos = {
      labels: ['Antibióticos', 'Analgésicos', 'Anti-inflamatórios', 'Vitaminas'],
      datasets: [{
        label: 'Medicamentos por Categoria',
        data: [45, 32, 28, 15],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 205, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)'
        ]
      }]
    };
    
    return success(res, 'Gráficos de medicamentos carregados com sucesso', dadosGraficos);
  } catch (error) {
    console.error('Erro ao carregar gráficos de medicamentos:', error);
    return serverError(res, 'Erro ao carregar gráficos de medicamentos', [error.message]);
  }
};

const graficosDoacoes = async (req, res) => {
  try {
    const { periodo = {} } = req.query;
    
    const dadosGraficos = {
      labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
      datasets: [{
        label: 'Doações (R$)',
        data: [1500, 2300, 1800, 2800, 2100, 3200],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    };
    
    return success(res, 'Gráficos de doações carregados com sucesso', dadosGraficos);
  } catch (error) {
    console.error('Erro ao carregar gráficos de doações:', error);
    return serverError(res, 'Erro ao carregar gráficos de doações', [error.message]);
  }
};

const graficosDespesas = async (req, res) => {
  try {
    const { periodo = {} } = req.query;
    
    const dadosGraficos = {
      labels: ['Alimentação', 'Medicamentos', 'Infraestrutura', 'Pessoal', 'Outros'],
      datasets: [{
        label: 'Despesas por Categoria (R$)',
        data: [3500, 1200, 2800, 4500, 800],
        backgroundColor: [
          'rgba(255, 159, 64, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)'
        ]
      }]
    };
    
    return success(res, 'Gráficos de despesas carregados com sucesso', dadosGraficos);
  } catch (error) {
    console.error('Erro ao carregar gráficos de despesas:', error);
    return serverError(res, 'Erro ao carregar gráficos de despesas', [error.message]);
  }
};

const graficosInternacoes = async (req, res) => {
  try {
    const { periodo = {} } = req.query;
    
    const dadosGraficos = {
      labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
      datasets: [{
        label: 'Internações Ativas',
        data: [5, 8, 6, 12, 9, 15],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }]
    };
    
    return success(res, 'Gráficos de internações carregados com sucesso', dadosGraficos);
  } catch (error) {
    console.error('Erro ao carregar gráficos de internações:', error);
    return serverError(res, 'Erro ao carregar gráficos de internações', [error.message]);
  }
};

const graficosConsultas = async (req, res) => {
  try {
    const { periodo = {} } = req.query;
    
    const dadosGraficos = {
      labels: ['Clínico Geral', 'Psiquiatria', 'Psicologia', 'Enfermagem'],
      datasets: [{
        label: 'Consultas por Especialidade',
        data: [45, 32, 28, 38],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 205, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)'
        ]
      }]
    };
    
    return success(res, 'Gráficos de consultas carregados com sucesso', dadosGraficos);
  } catch (error) {
    console.error('Erro ao carregar gráficos de consultas:', error);
    return serverError(res, 'Erro ao carregar gráficos de consultas', [error.message]);
  }
};

const graficosCaixa = async (req, res) => {
  try {
    const { periodo = {} } = req.query;
    
    const dadosGraficos = {
      labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
      datasets: [{
        label: 'Entradas',
        data: [5000, 7200, 6800, 8500, 7800, 9200],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }, {
        label: 'Saídas',
        data: [4200, 5800, 5400, 6200, 6000, 7100],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }]
    };
    
    return success(res, 'Gráficos de caixa carregados com sucesso', dadosGraficos);
  } catch (error) {
    console.error('Erro ao carregar gráficos de caixa:', error);
    return serverError(res, 'Erro ao carregar gráficos de caixa', [error.message]);
  }
};

module.exports = {
  relatorioAssistidas,
  relatorioDespesas,
  relatorioConsultas,
  relatorioDoacoes,
  relatorioMedicamentos,
  relatorioInternacoes,
  relatorioDoadores,
  relatorioVendas,
  relatorioGerencial,
  dashboard,
  // PDF exports
  exportarAssistidasPDF,
  exportarDespesasPDF,
  exportarConsultasPDF,
  exportarDoacoesPDF,
  exportarMedicamentosPDF,
  exportarInternacoesPDF,
  exportarDoadoresPDF,
  exportarCaixaPDF,
  // Excel exports
  exportarAssistidasExcel,
  exportarDespesasExcel,
  exportarConsultasExcel,
  exportarDoacoesExcel,
  exportarMedicamentosExcel,
  exportarInternacoesExcel,
  exportarDoadoresExcel,
  exportarCaixaExcel,
  // Graphics
  graficosAssistidas,
  graficosMedicamentos,
  graficosDoacoes,
  graficosDespesas,
  graficosInternacoes,
  graficosConsultas,
  graficosCaixa
};