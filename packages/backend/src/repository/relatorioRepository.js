const BaseRepository = require('../../../shared/repository/BaseRepository');

class RelatorioRepository extends BaseRepository {
  constructor() {
    super('');  // Não temos uma tabela específica, vamos fazer queries em várias
  }

  // RF_S1 - Relatório de Assistidas
  async relatorioAssistidas(filtros = {}) {
    const { data_inicio, data_fim, status, idade_min, idade_max } = filtros;
    
    let query = `
      SELECT 
        a.*,
        COUNT(DISTINCT c.id) as total_consultas,
        COUNT(DISTINCT i.id) as total_internacoes,
        MAX(c.data_consulta) as ultima_consulta,
        MAX(i.data_entrada) as ultima_internacao
      FROM assistidas a
      LEFT JOIN consultas c ON a.id = c.assistida_id
      LEFT JOIN internacoes i ON a.id = i.assistida_id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (data_inicio && data_fim) {
      query += ` AND a.createdAt BETWEEN ? AND ?`;
      params.push(data_inicio, data_fim);
    }
    
    if (status) {
      query += ` AND a.status = ?`;
      params.push(status);
    }
    
    query += ` GROUP BY a.id ORDER BY a.nome`;
    
    const assistidas = await this.executeQuery(query, params);
    
    // Estatísticas gerais
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT id) as total_assistidas,
        COUNT(DISTINCT CASE WHEN status = 'ativo' THEN id END) as ativas,
        COUNT(DISTINCT CASE WHEN status = 'inativo' THEN id END) as inativas
      FROM assistidas
    `;
    
    const [stats] = await this.executeQuery(statsQuery);
    
    return {
      periodo: { data_inicio, data_fim },
      estatisticas: stats,
      assistidas
    };
  }

  // RF_S2 - Relatório de Despesas
  async relatorioDespesas(filtros) {
    const { data_inicio, data_fim, categoria, status } = filtros;
    
    let query = `
      SELECT 
        d.*,
        td.nome as tipo_despesa_nome
      FROM despesas d
      LEFT JOIN tipos_despesas td ON d.tipo_despesa_id = td.id
      WHERE DATE(d.data_despesa) BETWEEN ? AND ?
    `;
    
    const params = [data_inicio, data_fim];
    
    if (categoria) {
      query += ` AND td.categoria = ?`;
      params.push(categoria);
    }
    
    if (status) {
      query += ` AND d.status = ?`;
      params.push(status);
    }
    
    query += ` ORDER BY d.data_despesa DESC`;
    
    const despesas = await this.executeQuery(query, params);
    
    // Totalizadores
    const totaisQuery = `
      SELECT 
        COUNT(*) as total_despesas,
        SUM(valor) as valor_total,
        AVG(valor) as valor_medio,
        MAX(valor) as maior_despesa,
        MIN(valor) as menor_despesa,
        td.nome as categoria,
        SUM(CASE WHEN d.tipo_despesa_id = td.id THEN valor ELSE 0 END) as valor_por_categoria
      FROM despesas d
      LEFT JOIN tipos_despesas td ON d.tipo_despesa_id = td.id
      WHERE DATE(d.data_despesa) BETWEEN ? AND ?
      GROUP BY td.nome
    `;
    
    const totais = await this.executeQuery(totaisQuery, [data_inicio, data_fim]);
    
    return {
      periodo: { data_inicio, data_fim },
      resumo: totais[0],
      despesas_por_categoria: totais,
      despesas
    };
  }

  // RF_S3 - Relatório de Consultas
  async relatorioConsultas(filtros = {}) {
    const { data_inicio, data_fim, assistida_id, profissional, status } = filtros;
    
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
    
    if (data_inicio && data_fim) {
      query += ` AND DATE(c.data_consulta) BETWEEN ? AND ?`;
      params.push(data_inicio, data_fim);
    }
    
    if (assistida_id) {
      query += ` AND c.assistida_id = ?`;
      params.push(assistida_id);
    }
    
    if (profissional) {
      query += ` AND c.profissional LIKE ?`;
      params.push(`%${profissional}%`);
    }
    
    if (status) {
      query += ` AND c.status = ?`;
      params.push(status);
    }
    
    query += ` ORDER BY c.data_consulta DESC`;
    
    const consultas = await this.executeQuery(query, params);
    
    // Estatísticas
    let statsQuery = `
      SELECT 
        COUNT(*) as total_consultas,
        COUNT(DISTINCT assistida_id) as total_pacientes,
        COUNT(DISTINCT profissional) as total_profissionais,
        SUM(CASE WHEN status = 'realizada' THEN 1 ELSE 0 END) as realizadas,
        SUM(CASE WHEN status = 'cancelada' THEN 1 ELSE 0 END) as canceladas,
        SUM(CASE WHEN status = 'agendada' THEN 1 ELSE 0 END) as agendadas
      FROM consultas
      WHERE 1=1
    `;
    
    const statsParams = [];
    if (data_inicio && data_fim) {
      statsQuery += ` AND DATE(data_consulta) BETWEEN ? AND ?`;
      statsParams.push(data_inicio, data_fim);
    }
    
    const [stats] = await this.executeQuery(statsQuery, statsParams);
    
    return {
      periodo: { data_inicio, data_fim },
      estatisticas: stats,
      consultas
    };
  }

  // RF_S4 - Relatório de Doações
  async relatorioDoacoes(filtros) {
    const { data_inicio, data_fim, doador_id, tipo } = filtros;
    
    // Doações de itens
    let doacoesQuery = `
      SELECT 
        d.*,
        do.nome as doador_nome
      FROM doacoes d
      LEFT JOIN doadores do ON d.doador_id = do.id
      WHERE DATE(d.data_doacao) BETWEEN ? AND ?
    `;
    
    const params = [data_inicio, data_fim];
    
    if (doador_id) {
      doacoesQuery += ` AND d.doador_id = ?`;
      params.push(doador_id);
    }
    
    const doacoes = await this.executeQuery(doacoesQuery, params);
    
    // Doações monetárias
    const monetariasQuery = `
      SELECT 
        cm.*,
        d.nome as doador_nome
      FROM caixa_movimentacoes cm
      LEFT JOIN doadores d ON cm.doador_id = d.id
      WHERE cm.tipo = 'entrada' 
        AND cm.categoria = 'doacao_monetaria'
        AND DATE(cm.data_movimentacao) BETWEEN ? AND ?
    `;
    
    const doacoesMonetarias = await this.executeQuery(monetariasQuery, [data_inicio, data_fim]);
    
    // Totalizadores
    const totalItens = doacoes.reduce((sum, d) => sum + (d.quantidade || 0), 0);
    const totalMonetario = doacoesMonetarias.reduce((sum, d) => sum + (d.valor || 0), 0);
    
    return {
      periodo: { data_inicio, data_fim },
      resumo: {
        total_doacoes_itens: doacoes.length,
        total_itens_doados: totalItens,
        total_doacoes_monetarias: doacoesMonetarias.length,
        valor_total_monetario: totalMonetario,
        total_doadores: new Set([...doacoes.map(d => d.doador_id), ...doacoesMonetarias.map(d => d.doador_id)]).size
      },
      doacoes_itens: doacoes,
      doacoes_monetarias: doacoesMonetarias
    };
  }

  // RF_S5 - Relatório de Medicamentos
  async relatorioMedicamentos(filtros = {}) {
    const { data_inicio, data_fim, medicamento_id, tipo_movimento } = filtros;
    
    let query = `
      SELECT
        m.*,
        um.nome as unidade_nome,
        0 as total_doacoes_recebidas,
        0 as vezes_prescrito,
        0 as estoque_minimo,
        0 as estoque_atual
      FROM medicamentos m
      LEFT JOIN unidades_medida um ON m.unidade_medida_id = um.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (medicamento_id) {
      query += ` AND m.id = ?`;
      params.push(medicamento_id);
    }
    
    query += ` ORDER BY m.nome`;
    
    const medicamentos = await this.executeQuery(query, params);
    
    // Movimentações - Simplificado pois doacoes não tem medicamento_id
    // Por agora, retorna array vazio até implementar tabela de movimentação de medicamentos
    const movimentacoes = [];

    // TODO: Criar tabela de movimentação de medicamentos para rastrear entradas/saídas
    // Por enquanto, mostra apenas os medicamentos cadastrados
    
    return {
      periodo: { data_inicio, data_fim },
      medicamentos,
      movimentacoes,
      estatisticas: {
        total_medicamentos: medicamentos.length,
        total_movimentacoes: movimentacoes.length
      }
    };
  }

  // RF_S6 - Relatório de Internações
  async relatorioInternacoes(filtros = {}) {
    const { data_inicio, data_fim, assistida_id, status } = filtros;
    
    let query = `
      SELECT 
        i.*,
        a.nome as assistida_nome,
        a.cpf as assistida_cpf,
        TIMESTAMPDIFF(DAY, i.data_entrada, COALESCE(i.data_saida, NOW())) as dias_internada,
        u1.nome as usuario_entrada_nome,
        u2.nome as usuario_saida_nome
      FROM internacoes i
      LEFT JOIN assistidas a ON i.assistida_id = a.id
      LEFT JOIN usuarios u1 ON i.usuario_entrada_id = u1.id
      LEFT JOIN usuarios u2 ON i.usuario_saida_id = u2.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (data_inicio && data_fim) {
      query += ` AND DATE(i.data_entrada) BETWEEN ? AND ?`;
      params.push(data_inicio, data_fim);
    }
    
    if (assistida_id) {
      query += ` AND i.assistida_id = ?`;
      params.push(assistida_id);
    }
    
    if (status) {
      query += ` AND i.status = ?`;
      params.push(status);
    }
    
    query += ` ORDER BY i.data_entrada DESC`;
    
    const internacoes = await this.executeQuery(query, params);
    
    // Estatísticas
    const statsQuery = `
      SELECT 
        COUNT(*) as total_internacoes,
        COUNT(DISTINCT assistida_id) as total_assistidas,
        AVG(TIMESTAMPDIFF(DAY, data_entrada, COALESCE(data_saida, NOW()))) as media_permanencia,
        MAX(TIMESTAMPDIFF(DAY, data_entrada, COALESCE(data_saida, NOW()))) as maior_permanencia,
        SUM(CASE WHEN status = 'ativa' THEN 1 ELSE 0 END) as ativas,
        SUM(CASE WHEN status = 'finalizada' THEN 1 ELSE 0 END) as finalizadas
      FROM internacoes
      WHERE 1=1
    `;
    
    const [stats] = await this.executeQuery(statsQuery, params);
    
    return {
      periodo: { data_inicio, data_fim },
      estatisticas: stats,
      internacoes
    };
  }

  // RF_S7 - Relatório de Doadores
  async relatorioDoadores(filtros = {}) {
    const { data_inicio, data_fim, ativo, tipo_doador } = filtros;
    
    let query = `
      SELECT 
        d.*,
        COUNT(DISTINCT do.id) as total_doacoes_itens,
        COUNT(DISTINCT cm.id) as total_doacoes_monetarias,
        SUM(cm.valor) as valor_total_doado
      FROM doadores d
      LEFT JOIN doacoes do ON d.id = do.doador_id
      LEFT JOIN caixa_movimentacoes cm ON d.id = cm.doador_id AND cm.tipo = 'entrada'
      WHERE 1=1
    `;
    
    const params = [];
    
    if (ativo !== undefined) {
      query += ` AND d.ativo = ?`;
      params.push(ativo);
    }
    
    if (tipo_doador) {
      query += ` AND d.tipo_pessoa = ?`;
      params.push(tipo_doador);
    }
    
    query += ` GROUP BY d.id ORDER BY valor_total_doado DESC`;
    
    const doadores = await this.executeQuery(query, params);
    
    // Top doadores
    const topDoadoresQuery = `
      SELECT 
        d.nome,
        d.tipo_pessoa,
        SUM(cm.valor) as total_doado
      FROM doadores d
      LEFT JOIN caixa_movimentacoes cm ON d.id = cm.doador_id AND cm.tipo = 'entrada'
      WHERE cm.valor IS NOT NULL
      GROUP BY d.id
      ORDER BY total_doado DESC
      LIMIT 10
    `;
    
    const topDoadores = await this.executeQuery(topDoadoresQuery);
    
    return {
      periodo: { data_inicio, data_fim },
      estatisticas: {
        total_doadores: doadores.length,
        doadores_ativos: doadores.filter(d => d.ativo).length,
        doadores_pf: doadores.filter(d => d.tipo_pessoa === 'fisica').length,
        doadores_pj: doadores.filter(d => d.tipo_pessoa === 'juridica').length
      },
      doadores,
      top_doadores: topDoadores
    };
  }

  // Relatório Gerencial Consolidado
  async relatorioGerencial(mes, ano) {
    const inicio = `${ano}-${String(mes).padStart(2, '0')}-01`;
    const fim = new Date(ano, mes, 0).toISOString().split('T')[0];
    
    // Buscar dados de todas as áreas
    const [assistidas] = await this.executeQuery(
      'SELECT COUNT(*) as total FROM assistidas WHERE MONTH(createdAt) = ? AND YEAR(createdAt) = ?',
      [mes, ano]
    );
    
    const [consultas] = await this.executeQuery(
      'SELECT COUNT(*) as total, SUM(CASE WHEN status = "realizada" THEN 1 ELSE 0 END) as realizadas FROM consultas WHERE MONTH(data_consulta) = ? AND YEAR(data_consulta) = ?',
      [mes, ano]
    );
    
    const [internacoes] = await this.executeQuery(
      'SELECT COUNT(*) as total, SUM(CASE WHEN status = "ativa" THEN 1 ELSE 0 END) as ativas FROM internacoes WHERE MONTH(data_entrada) = ? AND YEAR(data_entrada) = ?',
      [mes, ano]
    );
    
    const [despesas] = await this.executeQuery(
      'SELECT COUNT(*) as total, SUM(valor) as valor_total FROM despesas WHERE MONTH(data_despesa) = ? AND YEAR(data_despesa) = ?',
      [mes, ano]
    );
    
    const [doacoes] = await this.executeQuery(
      'SELECT COUNT(*) as total FROM doacoes WHERE MONTH(data_doacao) = ? AND YEAR(data_doacao) = ?',
      [mes, ano]
    );
    
    const [caixa] = await this.executeQuery(
      `SELECT 
        SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE 0 END) as entradas,
        SUM(CASE WHEN tipo = 'saida' THEN valor ELSE 0 END) as saidas
      FROM caixa_movimentacoes 
      WHERE MONTH(data_movimentacao) = ? AND YEAR(data_movimentacao) = ?`,
      [mes, ano]
    );
    
    return {
      periodo: { mes, ano, inicio, fim },
      resumo: {
        assistidas: assistidas,
        consultas: consultas,
        internacoes: internacoes,
        despesas: despesas,
        doacoes: doacoes,
        caixa: {
          entradas: caixa.entradas || 0,
          saidas: caixa.saidas || 0,
          saldo: (caixa.entradas || 0) - (caixa.saidas || 0)
        }
      }
    };
  }

  // Dashboard com indicadores principais
  async getDashboardIndicadores() {
    const hoje = new Date().toISOString().split('T')[0];
    const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const mesPassadoInicio = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0];
    const mesPassadoFim = new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString().split('T')[0];

    // Total de assistidas
    const [totalAssistidas] = await this.executeQuery(
      'SELECT COUNT(*) as total FROM assistidas WHERE status = "ativo"'
    );

    // Novas assistidas no mês atual
    const [novasAssistidasMes] = await this.executeQuery(
      'SELECT COUNT(*) as total FROM assistidas WHERE DATE(createdAt) >= ?',
      [inicioMes]
    );

    // Novas assistidas no mês passado (para calcular tendência)
    const [novasAssistidasMesPassado] = await this.executeQuery(
      'SELECT COUNT(*) as total FROM assistidas WHERE DATE(createdAt) BETWEEN ? AND ?',
      [mesPassadoInicio, mesPassadoFim]
    );

    // Internações ativas e média de permanência
    const [internacoesStats] = await this.executeQuery(
      `SELECT
        COUNT(*) as total,
        AVG(TIMESTAMPDIFF(DAY, data_entrada, COALESCE(data_saida, NOW()))) as media_permanencia
      FROM internacoes
      WHERE status = "ativa"`
    );

    // Total de internações no mês
    const [totalInternacoesMes] = await this.executeQuery(
      'SELECT COUNT(*) as total FROM internacoes WHERE DATE(data_entrada) >= ?',
      [inicioMes]
    );

    // Consultas do mês atual
    const [consultasMes] = await this.executeQuery(
      'SELECT COUNT(*) as total FROM consultas WHERE DATE(data_consulta) >= ?',
      [inicioMes]
    );

    // Consultas do mês passado (para tendência)
    const [consultasMesPassado] = await this.executeQuery(
      'SELECT COUNT(*) as total FROM consultas WHERE DATE(data_consulta) BETWEEN ? AND ?',
      [mesPassadoInicio, mesPassadoFim]
    );

    // Total de consultas nos últimos 30 dias
    const [totalConsultas30Dias] = await this.executeQuery(
      'SELECT COUNT(*) as total FROM consultas WHERE DATE(data_consulta) >= DATE_SUB(NOW(), INTERVAL 30 DAY)'
    );

    // Arrecadação mensal (doações monetárias)
    const [arrecadacaoMensal] = await this.executeQuery(
      `SELECT SUM(valor) as total
      FROM caixa_movimentacoes
      WHERE tipo = 'entrada'
        AND categoria = 'doacao_monetaria'
        AND DATE(data_movimentacao) >= ?`,
      [inicioMes]
    );

    // Arrecadação mês passado (para tendência)
    const [arrecadacaoMesPassado] = await this.executeQuery(
      `SELECT SUM(valor) as total
      FROM caixa_movimentacoes
      WHERE tipo = 'entrada'
        AND categoria = 'doacao_monetaria'
        AND DATE(data_movimentacao) BETWEEN ? AND ?`,
      [mesPassadoInicio, mesPassadoFim]
    );

    // Total de doações (itens) no mês
    const [totalDoacoesMes] = await this.executeQuery(
      'SELECT COUNT(*) as total FROM doacoes WHERE DATE(data_doacao) >= ?',
      [inicioMes]
    );

    // Despesas do mês
    const [despesasMes] = await this.executeQuery(
      'SELECT SUM(valor) as total FROM despesas WHERE DATE(data_despesa) >= ?',
      [inicioMes]
    );

    // Medicamentos - estatísticas (simplificado pois a tabela não tem campos de estoque)
    const [medicamentosStats] = await this.executeQuery(
      `SELECT
        COUNT(*) as total,
        0 as estoque_baixo,
        0 as vencidos
      FROM medicamentos`
    );

    // Total de prescrições nos últimos 30 dias
    const [totalPrescricoes] = await this.executeQuery(
      `SELECT COUNT(*) as total
      FROM consultas
      WHERE DATE(data_consulta) >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        AND medicamentos IS NOT NULL
        AND medicamentos != '[]'`
    );

    // Total de fechamentos de caixa nos últimos 30 dias
    const [totalFechamentos] = await this.executeQuery(
      'SELECT COUNT(*) as total FROM caixa_fechamentos WHERE DATE(data_fechamento) >= DATE_SUB(NOW(), INTERVAL 30 DAY)'
    );

    // Calcular tendências (percentuais de crescimento)
    const calcularTendencia = (atual, anterior) => {
      if (!anterior || anterior === 0) return 0;
      return Math.round(((atual - anterior) / anterior) * 100);
    };

    const arrecadacaoAtual = arrecadacaoMensal.total || 0;
    const arrecadacaoAnterior = arrecadacaoMesPassado.total || 0;
    const consultasAtual = consultasMes.total || 0;
    const consultasAnterior = consultasMesPassado.total || 0;
    const assistidasAtual = novasAssistidasMes.total || 0;
    const assistidasAnterior = novasAssistidasMesPassado.total || 0;

    return {
      // Cards principais
      totalAssistidas: totalAssistidas.total || 0,
      tendenciaAssistidas: calcularTendencia(assistidasAtual, assistidasAnterior),

      arrecadacaoMensal: arrecadacaoAtual,
      tendenciaArrecadacao: calcularTendencia(arrecadacaoAtual, arrecadacaoAnterior),

      internacoesAtivas: internacoesStats.total || 0,
      mediaPermanencia: Math.round(internacoesStats.media_permanencia || 0),

      consultasMes: consultasAtual,
      tendenciaConsultas: calcularTendencia(consultasAtual, consultasAnterior),

      // Resumo financeiro
      doacoesMes: arrecadacaoAtual,
      despesasMes: despesasMes.total || 0,

      // Medicamentos
      medicamentosDisponiveis: medicamentosStats.total || 0,
      medicamentosEstoqueBaixo: medicamentosStats.estoque_baixo || 0,
      medicamentosVencidos: medicamentosStats.vencidos || 0,

      // Atividades últimos 30 dias
      novasAssistidas: assistidasAtual,
      totalInternacoes: totalInternacoesMes.total || 0,
      totalConsultas: totalConsultas30Dias.total || 0,
      totalDoacoes: totalDoacoesMes.total || 0,
      totalPrescricoes: totalPrescricoes.total || 0,
      totalFechamentos: totalFechamentos.total || 0,

      // Metadata
      dataAtualizacao: new Date()
    };
  }
}

module.exports = RelatorioRepository;