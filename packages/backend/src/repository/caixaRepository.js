const db = require('../config/database');
const BaseRepository = require('../../../shared/repository/BaseRepository');

class CaixaRepository extends BaseRepository {
  constructor() {
    super('caixa_movimentacoes', 'cm');
  }
  // RF_F4 - Lançar doação monetária
  async lancarDoacaoMonetaria(data) {
    const { 
      doador_id, 
      valor, 
      descricao, 
      forma_pagamento,
      numero_recibo,
      usuario_id 
    } = data;
    
    const query = `
      INSERT INTO caixa_movimentacoes (
        tipo, 
        categoria, 
        valor, 
        descricao,
        forma_pagamento,
        numero_recibo,
        doador_id,
        data_movimentacao,
        usuario_id
      ) VALUES ('entrada', 'doacao_monetaria', ?, ?, ?, ?, ?, NOW(), ?)
    `;
    
    const [result] = await db.query(query, [
      valor,
      descricao || 'Doação monetária recebida',
      forma_pagamento || null,
      numero_recibo || null,
      doador_id || null,
      usuario_id
    ]);
    
    return this.findById(result.insertId);
  }

  // RF_F5 - Atualizar caixa (despesa ou ajuste)
  async atualizarCaixa(data) {
    const { 
      tipo_movimentacao,
      valor, 
      descricao,
      categoria,
      despesa_id,
      usuario_id 
    } = data;
    
    const tipo = tipo_movimentacao === 'despesa' ? 'saida' : 'ajuste';
    
    const query = `
      INSERT INTO caixa_movimentacoes (
        tipo, 
        categoria, 
        valor, 
        descricao,
        despesa_id,
        data_movimentacao,
        usuario_id
      ) VALUES (?, ?, ?, ?, ?, NOW(), ?)
    `;
    
    const [result] = await db.query(query, [
      tipo,
      categoria || tipo_movimentacao,
      valor,
      descricao || null,
      despesa_id || null,
      usuario_id
    ]);
    
    return this.findById(result.insertId);
  }

  // Buscar movimentação por ID
  async findById(id) {
    const query = `
      SELECT 
        cm.*,
        u.nome as usuario_nome,
        d.nome as doador_nome
      FROM caixa_movimentacoes cm
      LEFT JOIN usuarios u ON cm.usuario_id = u.id
      LEFT JOIN doadores d ON cm.doador_id = d.id
      WHERE cm.id = ?
    `;
    
    const [rows] = await db.query(query, [id]);
    return rows[0];
  }

  // Obter saldo atual do caixa
  async getSaldoAtual() {
    const query = `
      SELECT 
        SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE 0 END) as total_entradas,
        SUM(CASE WHEN tipo = 'saida' THEN valor ELSE 0 END) as total_saidas,
        SUM(CASE WHEN tipo = 'ajuste' THEN valor ELSE 0 END) as total_ajustes,
        SUM(CASE 
          WHEN tipo = 'entrada' THEN valor 
          WHEN tipo = 'saida' THEN -valor 
          WHEN tipo = 'ajuste' THEN valor 
          ELSE 0 
        END) as saldo_atual
      FROM caixa_movimentacoes
    `;
    
    const [rows] = await db.query(query);
    return {
      total_entradas: rows[0].total_entradas || 0,
      total_saidas: rows[0].total_saidas || 0,
      total_ajustes: rows[0].total_ajustes || 0,
      saldo_atual: rows[0].saldo_atual || 0
    };
  }

  // Listar movimentações com filtros
  async getMovimentacoes(filtros) {
    const { data_inicio, data_fim, tipo, limite } = filtros;
    
    let query = `
      SELECT 
        cm.*,
        u.nome as usuario_nome,
        d.nome as doador_nome,
        desp.descricao as despesa_descricao
      FROM caixa_movimentacoes cm
      LEFT JOIN usuarios u ON cm.usuario_id = u.id
      LEFT JOIN doadores d ON cm.doador_id = d.id
      LEFT JOIN despesas desp ON cm.despesa_id = desp.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (data_inicio) {
      query += ` AND DATE(cm.data_movimentacao) >= ?`;
      params.push(data_inicio);
    }
    
    if (data_fim) {
      query += ` AND DATE(cm.data_movimentacao) <= ?`;
      params.push(data_fim);
    }
    
    if (tipo) {
      query += ` AND cm.tipo = ?`;
      params.push(tipo);
    }
    
    query += ` ORDER BY cm.data_movimentacao DESC LIMIT ?`;
    params.push(parseInt(limite));
    
    const [rows] = await db.query(query, params);
    return rows;
  }

  // Listar movimentações recentes (simplificado)
  async getMovimentacoesRecentes(filtros) {
    const { limite } = filtros;
    
    const query = `
      SELECT 
        cm.*,
        u.nome as usuario_nome,
        d.nome as doador_nome
      FROM caixa_movimentacoes cm
      LEFT JOIN usuarios u ON cm.usuario_id = u.id
      LEFT JOIN doadores d ON cm.doador_id = d.id
      ORDER BY cm.data_movimentacao DESC 
      LIMIT ?
    `;
    
    const [rows] = await db.query(query, [parseInt(limite)]);
    return rows;
  }

  // Gerar extrato por período
  async getExtrato(data_inicio, data_fim) {
    // Saldo anterior ao período
    const saldoAnteriorQuery = `
      SELECT SUM(CASE 
        WHEN tipo = 'entrada' THEN valor 
        WHEN tipo = 'saida' THEN -valor 
        WHEN tipo = 'ajuste' THEN valor 
        ELSE 0 
      END) as saldo_anterior
      FROM caixa_movimentacoes
      WHERE DATE(data_movimentacao) < ?
    `;
    
    const [saldoAnterior] = await db.query(saldoAnteriorQuery, [data_inicio]);
    
    // Movimentações do período
    const movimentacoes = await this.getMovimentacoes({ data_inicio, data_fim, limite: 1000 });
    
    // Totalizar por tipo
    const totaisQuery = `
      SELECT 
        SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE 0 END) as total_entradas,
        SUM(CASE WHEN tipo = 'saida' THEN valor ELSE 0 END) as total_saidas,
        SUM(CASE WHEN tipo = 'ajuste' THEN valor ELSE 0 END) as total_ajustes
      FROM caixa_movimentacoes
      WHERE DATE(data_movimentacao) >= ? AND DATE(data_movimentacao) <= ?
    `;
    
    const [totais] = await db.query(totaisQuery, [data_inicio, data_fim]);
    
    const saldo_anterior = saldoAnterior[0].saldo_anterior || 0;
    const saldo_periodo = (totais[0].total_entradas || 0) - (totais[0].total_saidas || 0) + (totais[0].total_ajustes || 0);
    
    return {
      periodo: { data_inicio, data_fim },
      saldo_anterior,
      movimentacoes,
      resumo: {
        total_entradas: totais[0].total_entradas || 0,
        total_saidas: totais[0].total_saidas || 0,
        total_ajustes: totais[0].total_ajustes || 0,
        saldo_periodo,
        saldo_final: saldo_anterior + saldo_periodo
      }
    };
  }

  // Fechar caixa do dia
  async fecharCaixaDia(data) {
    const { usuario_id, observacoes } = data;
    
    // Obter resumo do dia
    const hoje = new Date().toISOString().split('T')[0];
    const extrato = await this.getExtrato(hoje, hoje);
    
    // Registrar fechamento
    const query = `
      INSERT INTO caixa_fechamentos (
        data_fechamento,
        saldo_inicial,
        total_entradas,
        total_saidas,
        total_ajustes,
        saldo_final,
        observacoes,
        usuario_id,
        criado_em
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    
    const [result] = await db.query(query, [
      hoje,
      extrato.saldo_anterior,
      extrato.resumo.total_entradas,
      extrato.resumo.total_saidas,
      extrato.resumo.total_ajustes,
      extrato.resumo.saldo_final,
      observacoes || null,
      usuario_id
    ]);
    
    return {
      id: result.insertId,
      ...extrato
    };
  }

  // Obter estatísticas do caixa
  async getEstatisticas() {
    // Total geral de entradas e saídas
    const queryGeral = `
      SELECT 
        SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE 0 END) as totalEntradas,
        SUM(CASE WHEN tipo = 'saida' THEN valor ELSE 0 END) as totalSaidas,
        SUM(CASE WHEN tipo = 'entrada' AND categoria = 'doacao_monetaria' THEN valor ELSE 0 END) as totalDoacoes
      FROM caixa_movimentacoes
    `;
    
    // Total do mês atual
    const queryMes = `
      SELECT 
        SUM(CASE 
          WHEN tipo = 'entrada' THEN valor 
          WHEN tipo = 'saida' THEN -valor 
          WHEN tipo = 'ajuste' THEN valor 
          ELSE 0 
        END) as saldoMesAtual
      FROM caixa_movimentacoes
      WHERE MONTH(data_movimentacao) = MONTH(CURRENT_DATE())
      AND YEAR(data_movimentacao) = YEAR(CURRENT_DATE())
    `;
    
    const [geral] = await db.query(queryGeral);
    const [mes] = await db.query(queryMes);
    
    return {
      totalEntradas: geral[0].totalEntradas || 0,
      totalSaidas: geral[0].totalSaidas || 0,
      saldoMesAtual: mes[0].saldoMesAtual || 0,
      totalDoacoes: geral[0].totalDoacoes || 0
    };
  }
}

module.exports = CaixaRepository;