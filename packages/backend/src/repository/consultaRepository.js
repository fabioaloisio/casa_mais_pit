const BaseRepository = require('../../../shared/repository/BaseRepository');

class ConsultaRepository extends BaseRepository {
  constructor() {
    super('consultas');
  }

  // Helper method to map database fields to frontend camelCase
  mapToFrontend(row) {
    return {
      ...row,
      dataConsulta: row.data_consulta,
      dataPrescricao: row.data_prescricao,
      dataHistoria: row.data_historia,
      dataRealizacao: row.data_realizacao,
      dataCancelamento: row.data_cancelamento,
      tipoConsulta: row.tipo_consulta,
      historiaPatologica: row.historia_patologica,
      medicamentosUsoContinuo: row.medicamentos_uso_continuo,
      condicoesCronicas: row.condicoes_cronicas,
      cirurgiasPrevias: row.cirurgias_previas,
      observacoesPosConsulta: row.observacoes_pos_consulta,
      motivoCancelamento: row.motivo_cancelamento,
      usuarioCriacaoId: row.usuario_criacao_id,
      usuarioPrescricaoId: row.usuario_prescricao_id,
      usuarioHistoriaId: row.usuario_historia_id,
      usuarioPosConsultaId: row.usuario_pos_consulta_id,
      usuarioCancelamentoId: row.usuario_cancelamento_id,
      criadoEm: row.criado_em,
      assistidaId: row.assistida_id,
      // Remove snake_case fields
      data_consulta: undefined,
      data_prescricao: undefined,
      data_historia: undefined,
      data_realizacao: undefined,
      data_cancelamento: undefined,
      tipo_consulta: undefined,
      historia_patologica: undefined,
      medicamentos_uso_continuo: undefined,
      condicoes_cronicas: undefined,
      cirurgias_previas: undefined,
      observacoes_pos_consulta: undefined,
      motivo_cancelamento: undefined,
      usuario_criacao_id: undefined,
      usuario_prescricao_id: undefined,
      usuario_historia_id: undefined,
      usuario_pos_consulta_id: undefined,
      usuario_cancelamento_id: undefined,
      criado_em: undefined,
      assistida_id: undefined
    };
  }

  // RF_F6 - Criar consulta
  async criar(data) {
    const consulta = await this.create({
      assistida_id: data.assistida_id,
      data_consulta: data.data_consulta,
      profissional: data.profissional,
      tipo_consulta: data.tipo_consulta || 'Geral',
      observacoes: data.observacoes || null,
      status: 'agendada',
      usuario_criacao_id: data.usuario_id,
      criado_em: new Date()
    });
    
    return this.buscarPorIdCompleto(consulta.id);
  }

  // RF_F7 - Lançar prescrição
  async lancarPrescricao(data) {
    const { id, prescricao, medicamentos, usuario_id } = data;
    
    await this.update(id, {
      prescricao,
      medicamentos: JSON.stringify(medicamentos),
      usuario_prescricao_id: usuario_id,
      data_prescricao: new Date()
    });
    
    return this.buscarPorIdCompleto(id);
  }

  // RF_F8 - Lançar história patológica
  async lancarHistoriaPatologica(data) {
    const { 
      id, 
      historia_patologica,
      alergias,
      condicoes_cronicas,
      cirurgias_previas,
      medicamentos_uso_continuo,
      usuario_id 
    } = data;
    
    const dadosHistoria = {
      historia_patologica,
      alergias: alergias || null,
      condicoes_cronicas: condicoes_cronicas || null,
      cirurgias_previas: cirurgias_previas || null,
      medicamentos_uso_continuo: medicamentos_uso_continuo || null
    };
    
    await this.update(id, {
      historia_patologica: JSON.stringify(dadosHistoria),
      usuario_historia_id: usuario_id,
      data_historia: new Date()
    });
    
    return this.buscarPorIdCompleto(id);
  }

  // RF_F9 - Registrar dados pós-consulta
  async registrarPosConsulta(data) {
    const { 
      id,
      evolucao,
      encaminhamentos,
      retorno_agendado,
      observacoes_pos_consulta,
      usuario_id 
    } = data;
    
    await this.update(id, {
      evolucao,
      encaminhamentos: encaminhamentos || null,
      retorno_agendado: retorno_agendado || null,
      observacoes_pos_consulta: observacoes_pos_consulta || null,
      status: 'realizada',
      usuario_pos_consulta_id: usuario_id,
      data_realizacao: new Date()
    });
    
    return this.buscarPorIdCompleto(id);
  }

  // Buscar consulta com todos os dados relacionados
  async buscarPorIdCompleto(id) {
    const query = `
      SELECT 
        c.*,
        a.nome as assistida_nome,
        a.cpf as assistida_cpf,
        u1.nome as usuario_criacao_nome,
        u2.nome as usuario_prescricao_nome,
        u3.nome as usuario_historia_nome,
        u4.nome as usuario_pos_consulta_nome
      FROM consultas c
      LEFT JOIN assistidas a ON c.assistida_id = a.id
      LEFT JOIN usuarios u1 ON c.usuario_criacao_id = u1.id
      LEFT JOIN usuarios u2 ON c.usuario_prescricao_id = u2.id
      LEFT JOIN usuarios u3 ON c.usuario_historia_id = u3.id
      LEFT JOIN usuarios u4 ON c.usuario_pos_consulta_id = u4.id
      WHERE c.id = ?
    `;
    
    const rows = await this.executeQuery(query, [id]);
    
    if (rows[0]) {
      const row = rows[0];
      const mapped = this.mapToFrontend(row);
      
      // Parsear campos JSON
      if (row.medicamentos) {
        try {
          mapped.medicamentos = JSON.parse(row.medicamentos);
        } catch (e) {
          mapped.medicamentos = null;
        }
      }
      
      if (row.historia_patologica) {
        try {
          mapped.historiaPatologica = JSON.parse(row.historia_patologica);
        } catch (e) {
          mapped.historiaPatologica = row.historia_patologica;
        }
      }
      
      return {
        ...mapped,
        assistida: {
          nome: row.assistida_nome,
          cpf: row.assistida_cpf
        },
        usuarioCriacao: {
          nome: row.usuario_criacao_nome
        },
        usuarioPrescricao: row.usuario_prescricao_nome ? {
          nome: row.usuario_prescricao_nome
        } : null,
        usuarioHistoria: row.usuario_historia_nome ? {
          nome: row.usuario_historia_nome
        } : null,
        usuarioPosConsulta: row.usuario_pos_consulta_nome ? {
          nome: row.usuario_pos_consulta_nome
        } : null,
        medico: mapped.profissional ? {
          nome: mapped.profissional
        } : null,
        motivo: mapped.observacoes || null,
        especialidade: mapped.tipoConsulta || 'Não definida',
        // Remove campos duplicados
        assistida_nome: undefined,
        assistida_cpf: undefined,
        usuario_criacao_nome: undefined,
        usuario_prescricao_nome: undefined,
        usuario_historia_nome: undefined,
        usuario_pos_consulta_nome: undefined
      };
    }
    
    return null;
  }

  // Buscar por ID (método simples da classe base)
  async buscarPorId(id) {
    return this.buscarPorIdCompleto(id);
  }

  // Listar consultas com filtros
  async listar(filtros = {}) {
    let query = `
      SELECT 
        c.*,
        a.nome as assistida_nome,
        a.cpf as assistida_cpf
      FROM consultas c
      LEFT JOIN assistidas a ON c.assistida_id = a.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (filtros.assistida_id) {
      query += ` AND c.assistida_id = ?`;
      params.push(filtros.assistida_id);
    }
    
    if (filtros.data_inicio) {
      query += ` AND DATE(c.data_consulta) >= ?`;
      params.push(filtros.data_inicio);
    }
    
    if (filtros.data_fim) {
      query += ` AND DATE(c.data_consulta) <= ?`;
      params.push(filtros.data_fim);
    }
    
    if (filtros.status) {
      query += ` AND c.status = ?`;
      params.push(filtros.status);
    }
    
    query += ` ORDER BY c.data_consulta DESC`;
    
    const rows = await this.executeQuery(query, params);
    
    // Mapear para estrutura esperada pelo frontend
    return rows.map(row => {
      const mapped = this.mapToFrontend(row);
      
      // Parsear campos JSON
      if (row.medicamentos) {
        try {
          mapped.medicamentos = JSON.parse(row.medicamentos);
        } catch (e) {
          mapped.medicamentos = null;
        }
      }
      
      if (row.historia_patologica) {
        try {
          mapped.historiaPatologica = JSON.parse(row.historia_patologica);
        } catch (e) {
          mapped.historiaPatologica = row.historia_patologica;
        }
      }
      
      return {
        ...mapped,
        assistida: {
          nome: row.assistida_nome,
          cpf: row.assistida_cpf
        },
        medico: mapped.profissional ? {
          nome: mapped.profissional
        } : null,
        motivo: mapped.observacoes || null,
        especialidade: mapped.tipoConsulta || 'Não definida',
        // Remove campos duplicados
        assistida_nome: undefined,
        assistida_cpf: undefined
      };
    });
  }

  // Atualizar consulta
  async atualizar(id, dados) {
    await this.update(id, dados);
    return this.buscarPorIdCompleto(id);
  }

  // Cancelar consulta
  async cancelar(data) {
    const { id, motivo_cancelamento, usuario_id } = data;
    
    await this.update(id, {
      status: 'cancelada',
      motivo_cancelamento,
      usuario_cancelamento_id: usuario_id,
      data_cancelamento: new Date()
    });
    
    return this.buscarPorIdCompleto(id);
  }

  // Estatísticas de consultas
  async getEstatisticas(periodo = 30) {
    const queries = {
      totalConsultas: `
        SELECT COUNT(*) as total 
        FROM consultas 
        WHERE data_consulta >= DATE_SUB(CURRENT_DATE(), INTERVAL ? DAY)
      `,
      consultasPorStatus: `
        SELECT status, COUNT(*) as total
        FROM consultas
        WHERE data_consulta >= DATE_SUB(CURRENT_DATE(), INTERVAL ? DAY)
        GROUP BY status
      `,
      proximasConsultas: `
        SELECT COUNT(*) as total
        FROM consultas
        WHERE status = 'agendada' 
        AND data_consulta >= CURRENT_DATE()
        AND data_consulta <= DATE_ADD(CURRENT_DATE(), INTERVAL 7 DAY)
      `,
      consultasPorTipo: `
        SELECT tipo_consulta, COUNT(*) as total
        FROM consultas
        WHERE data_consulta >= DATE_SUB(CURRENT_DATE(), INTERVAL ? DAY)
        GROUP BY tipo_consulta
        ORDER BY total DESC
      `,
      topProfissionais: `
        SELECT profissional, COUNT(*) as total
        FROM consultas
        WHERE data_consulta >= DATE_SUB(CURRENT_DATE(), INTERVAL ? DAY)
        GROUP BY profissional
        ORDER BY total DESC
        LIMIT 5
      `
    };
    
    const [total] = await this.executeQuery(queries.totalConsultas, [periodo]);
    const porStatus = await this.executeQuery(queries.consultasPorStatus, [periodo]);
    const [proximas] = await this.executeQuery(queries.proximasConsultas);
    const porTipo = await this.executeQuery(queries.consultasPorTipo, [periodo]);
    const topProfissionais = await this.executeQuery(queries.topProfissionais, [periodo]);
    
    // Processar status individuais
    const statusCounts = {
      totalAgendadas: 0,
      totalRealizadas: 0, 
      totalCanceladas: 0
    };
    
    if (porStatus && porStatus.length > 0) {
      porStatus.forEach(item => {
        if (item.status === 'agendada') {
          statusCounts.totalAgendadas = item.total;
        } else if (item.status === 'realizada') {
          statusCounts.totalRealizadas = item.total;
        } else if (item.status === 'cancelada') {
          statusCounts.totalCanceladas = item.total;
        }
      });
    }
    
    return {
      periodo,
      totalConsultas: total && total[0] ? total[0].total : 0,
      totalAgendadas: statusCounts.totalAgendadas,
      totalRealizadas: statusCounts.totalRealizadas,
      totalCanceladas: statusCounts.totalCanceladas,
      proximasConsultas: proximas && proximas[0] ? proximas[0].total : 0,
      consultasPorStatus: porStatus || [],
      consultasPorTipo: porTipo || [],
      topProfissionais: topProfissionais || []
    };
  }
}

module.exports = ConsultaRepository;