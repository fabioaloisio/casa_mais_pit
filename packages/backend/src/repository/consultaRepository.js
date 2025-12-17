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

  async criar(data) {
    const consulta = await this.create({
      assistida_id: data.assistida_id,
      medico_id: data.medico_id,
      data_consulta: data.data_consulta,
      tipo_consulta: data.tipo_consulta || 'Geral',
      observacoes: data.observacoes || null,
      status: 'agendada',
      usuario_criacao_id: data.usuario_id,
      criado_em: new Date()
    });

    return this.buscarPorIdCompleto(consulta.id);
  }

  async lancarPrescricao(data) {
    const { id, prescricao, medicamentos, usuario_id } = data;

    console.log('[PRESCRICAO] Iniciando lançamento para consulta:', id);

    // Buscar prescrições existentes
    const consultaAtual = await this.buscarPorIdCompleto(id);
    let prescricoesExistentes = [];

    console.log('[PRESCRICAO] Consulta atual medicamentos:', consultaAtual?.medicamentos);

    if (consultaAtual && consultaAtual.medicamentos) {
      // Verificar se é estrutura nova (array de prescrições) ou antiga (array de medicamentos)
      if (Array.isArray(consultaAtual.medicamentos) && consultaAtual.medicamentos.length > 0) {
        if (consultaAtual.medicamentos[0].itens) {
          // Estrutura nova: já é array de prescrições
          console.log('[PRESCRICAO] Estrutura NOVA detectada, prescrições existentes:', consultaAtual.medicamentos.length);
          prescricoesExistentes = consultaAtual.medicamentos;
        } else {
          // Estrutura antiga: converter para nova estrutura
          console.log('[PRESCRICAO] Estrutura ANTIGA detectada, convertendo...');
          prescricoesExistentes = [{
            data: consultaAtual.dataPrescricao || new Date().toISOString(),
            usuario_id: consultaAtual.usuarioPrescricaoId,
            texto: consultaAtual.prescricao,
            itens: consultaAtual.medicamentos
          }];
        }
      }
    } else {
      console.log('[PRESCRICAO] Nenhuma prescrição existente');
    }

    // Criar nova prescrição
    const novaPrescricao = {
      data: new Date().toISOString(),
      usuario_id: usuario_id,
      texto: prescricao,
      itens: medicamentos
    };

    // Adicionar nova prescrição no início (mais recente primeiro)
    const todasPrescricoes = [novaPrescricao, ...prescricoesExistentes];

    console.log('[PRESCRICAO] Total de prescrições após adicionar:', todasPrescricoes.length);

    // Concatenar todos os textos das prescrições para o campo TEXT
    const prescricaoTextoCompleto = todasPrescricoes
      .map(p => `[${new Date(p.data).toLocaleDateString('pt-BR')}]\n${p.texto}`)
      .join('\n\n---\n\n');

    await this.update(id, {
      prescricao: prescricaoTextoCompleto,
      medicamentos: JSON.stringify(todasPrescricoes),
      usuario_prescricao_id: usuario_id,
      data_prescricao: new Date()
    });

    console.log('[PRESCRICAO] Prescrição salva com sucesso');

    return this.buscarPorIdCompleto(id);
  }

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

  async buscarPorIdCompleto(id) {
    const query = `
      SELECT
        c.*,
        a.nome as assistida_nome,
        a.cpf as assistida_cpf,
        m.nome as medico_nome,
        m.crm as medico_crm,
        m.especialidade as medico_especialidade,
        u1.nome as usuario_criacao_nome,
        u2.nome as usuario_prescricao_nome,
        u3.nome as usuario_historia_nome,
        u4.nome as usuario_pos_consulta_nome
      FROM consultas c
      LEFT JOIN assistidas a ON c.assistida_id = a.id
      LEFT JOIN medicos m ON c.medico_id = m.id
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

      if (row.medicamentos) {
        try {
          // MySQL pode retornar como objeto ou string dependendo da versão
          mapped.medicamentos = typeof row.medicamentos === 'string'
            ? JSON.parse(row.medicamentos)
            : row.medicamentos;
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
        medico: row.medico_id ? {
          id: row.medico_id,
          nome: row.medico_nome,
          crm: row.medico_crm,
          especialidade: row.medico_especialidade
        } : (mapped.profissional ? { nome: mapped.profissional } : null), // Fallback para profissional antigo
        motivo: mapped.observacoes || null,
        especialidade: mapped.tipoConsulta || 'Não definida',
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

  async buscarPorId(id) {
    return this.buscarPorIdCompleto(id);
  }

  async listar(filtros = {}) {
    let query = `
      SELECT
        c.*,
        a.nome as assistida_nome,
        a.cpf as assistida_cpf,
        m.nome as medico_nome
      FROM consultas c
      LEFT JOIN assistidas a ON c.assistida_id = a.id
      LEFT JOIN medicos m ON c.medico_id = m.id
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

    return rows.map(row => {
      const mapped = this.mapToFrontend(row);

      if (row.medicamentos) {
        try {
          // MySQL pode retornar como objeto ou string dependendo da versão
          mapped.medicamentos = typeof row.medicamentos === 'string'
            ? JSON.parse(row.medicamentos)
            : row.medicamentos;
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
        medico: row.medico_id ? {
          id: row.medico_id,
          nome: row.medico_nome
        } : (mapped.profissional ? { nome: mapped.profissional } : null), // Fallback
        motivo: mapped.observacoes || null,
        especialidade: mapped.tipoConsulta || 'Não definida',
        assistida_nome: undefined,
        assistida_cpf: undefined
      };
    });
  }

  async atualizar(id, dados) {
    await this.update(id, dados);
    return this.buscarPorIdCompleto(id);
  }

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

  async getEstatisticas(periodo = 30) {
    try {
      const debugQuery = `SELECT id, status, data_consulta FROM consultas WHERE status = 'cancelada'`;
      const debugResult = await this.executeQuery(debugQuery);
      console.log('[DEBUG] Consultas canceladas encontradas:', debugResult);
      console.log('[DEBUG] Total de canceladas:', debugResult?.length || 0);

      const queries = {
        totalConsultas: `
          SELECT COUNT(*) as total
          FROM consultas
          WHERE data_consulta >= DATE_SUB(CURRENT_DATE(), INTERVAL ? DAY)
        `,
        consultasAgendadas: `
          SELECT COUNT(*) as total
          FROM consultas
          WHERE status = 'agendada'
          AND data_consulta >= DATE_SUB(CURRENT_DATE(), INTERVAL ? DAY)
        `,
        consultasRealizadas: `
          SELECT COUNT(*) as total
          FROM consultas
          WHERE status = 'realizada'
          AND data_consulta >= DATE_SUB(CURRENT_DATE(), INTERVAL ? DAY)
        `,
        consultasCanceladas: `
          SELECT COUNT(*) as total
          FROM consultas
          WHERE status = 'cancelada'
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
          SELECT m.nome as profissional, COUNT(c.id) as total
          FROM consultas c
          JOIN medicos m ON c.medico_id = m.id
          WHERE c.data_consulta >= DATE_SUB(CURRENT_DATE(), INTERVAL ? DAY)
          GROUP BY m.nome
          ORDER BY total DESC
          LIMIT 5
        `
      };

      const totalResult = await this.executeQuery(queries.totalConsultas, [periodo]);
      const agendadasResult = await this.executeQuery(queries.consultasAgendadas, [periodo]);
      const realizadasResult = await this.executeQuery(queries.consultasRealizadas, [periodo]);
      const canceladasResult = await this.executeQuery(queries.consultasCanceladas);
      const proximasResult = await this.executeQuery(queries.proximasConsultas);
      const porTipo = await this.executeQuery(queries.consultasPorTipo, [periodo]);
      const topProfissionais = await this.executeQuery(queries.topProfissionais, [periodo]);

      console.log('[DEBUG] Resultado da query canceladas:', canceladasResult);
      console.log('[DEBUG] Tipo do resultado:', typeof canceladasResult);
      console.log('[DEBUG] É array?', Array.isArray(canceladasResult));
      if (Array.isArray(canceladasResult) && canceladasResult.length > 0) {
        console.log('[DEBUG] Primeiro item:', canceladasResult[0]);
        console.log('[DEBUG] Total de canceladas no primeiro item:', canceladasResult[0]?.total);
      }

      const total = totalResult && totalResult[0] ? totalResult[0] : { total: 0 };
      const agendadas = agendadasResult && agendadasResult[0] ? agendadasResult[0] : { total: 0 };
      const realizadas = realizadasResult && realizadasResult[0] ? realizadasResult[0] : { total: 0 };
      const canceladas = canceladasResult && canceladasResult[0] ? canceladasResult[0] : { total: 0 };
      const proximas = proximasResult && proximasResult[0] ? proximasResult[0] : { total: 0 };

      const stats = {
        periodo,
        totalConsultas: total.total ? Number(total.total) : 0,
        totalAgendadas: agendadas.total ? Number(agendadas.total) : 0,
        totalRealizadas: realizadas.total ? Number(realizadas.total) : 0,
        totalCanceladas: canceladas.total ? Number(canceladas.total) : 0,
        proximasConsultas: proximas.total ? Number(proximas.total) : 0,
        consultasPorTipo: porTipo || [],
        topProfissionais: topProfissionais || []
      };

      console.log('[DEBUG] Estatísticas finais:', stats);
      console.log('[DEBUG] Total Canceladas:', stats.totalCanceladas);

      return stats;
    } catch (error) {
      console.error('[ERRO] Erro ao buscar estatísticas:', error);
      throw error;
    }
  }

  async findByMedicoId(medicoId) {
    return this.findAll({ medico_id: medicoId });
  }
}

module.exports = new ConsultaRepository();
