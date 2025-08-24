const db = require('../config/database');
const Despesa = require('../models/despesa');

class DespesaRepository {
  async findAll(filters = {}) {
    let query = `
      SELECT d.*, td.nome as tipo_despesa_nome, td.descricao as tipo_despesa_descricao
      FROM despesas d
      LEFT JOIN tipos_despesas td ON d.tipo_despesa_id = td.id
      WHERE 1=1
    `;
    const params = [];

    // Filtro por categoria (usar FK)
    if (filters.categoria) {
      query += ' AND td.nome = ?';
      params.push(filters.categoria);
    }

    // Filtro por tipo_despesa_id
    if (filters.tipo_despesa_id) {
      query += ' AND d.tipo_despesa_id = ?';
      params.push(filters.tipo_despesa_id);
    }

    // Filtro por status
    if (filters.status) {
      query += ' AND d.status = ?';
      params.push(filters.status);
    }

    // Filtro por forma de pagamento
    if (filters.forma_pagamento) {
      query += ' AND d.forma_pagamento = ?';
      params.push(filters.forma_pagamento);
    }

    // Filtro por período
    if (filters.dataInicio) {
      query += ' AND d.data_despesa >= ?';
      params.push(filters.dataInicio);
    }

    if (filters.dataFim) {
      query += ' AND d.data_despesa <= ?';
      params.push(filters.dataFim);
    }

    // Busca por texto (descrição ou fornecedor)
    if (filters.search) {
      query += ' AND (d.descricao LIKE ? OR d.fornecedor LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    // Ordenação
    query += ' ORDER BY d.data_despesa DESC, d.id DESC';

    const [rows] = await db.execute(query, params);
    return rows.map(row => {
      const despesa = Despesa.fromDatabase(row);
      // Adicionar informações do tipo de despesa
      despesa.tipo_despesa = {
        id: row.tipo_despesa_id,
        nome: row.tipo_despesa_nome,
        descricao: row.tipo_despesa_descricao
      };
      return despesa;
    });
  }

  async findById(id) {
    const [rows] = await db.execute('SELECT * FROM despesas WHERE id = ?', [id]);
    return rows.length ? Despesa.fromDatabase(rows[0]) : null;
  }

  async create(despesa) {
    const dados = despesa.paraMySQL();
    
    const [result] = await db.execute(`
      INSERT INTO despesas 
      (descricao, categoria, tipo_despesa_id, valor, data_despesa, forma_pagamento, fornecedor, observacoes, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      dados.descricao,
      dados.categoria,
      dados.tipo_despesa_id,
      dados.valor,
      dados.data_despesa,
      dados.forma_pagamento,
      dados.fornecedor,
      dados.observacoes,
      dados.status
    ]);

    despesa.id = result.insertId;
    return despesa;
  }

  async update(id, despesa) {
    const campos = [];
    const valores = [];
    const dados = despesa.paraMySQL();

    // Monta query dinamicamente baseado nos campos presentes
    Object.keys(dados).forEach(campo => {
      if (dados[campo] !== undefined) {
        campos.push(`${campo} = ?`);
        valores.push(dados[campo]);
      }
    });

    if (campos.length === 0) return false;

    valores.push(id);

    const [result] = await db.execute(`
      UPDATE despesas SET ${campos.join(', ')} WHERE id = ?
    `, valores);

    return result.affectedRows > 0;
  }

  async delete(id) {
    const [result] = await db.execute('DELETE FROM despesas WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  // Buscar despesas por categoria
  async findByCategoria(categoria) {
    const [rows] = await db.execute(
      'SELECT * FROM despesas WHERE categoria = ? ORDER BY data_despesa DESC',
      [categoria]
    );
    return rows.map(row => Despesa.fromDatabase(row));
  }

  // Buscar despesas por período
  async findByPeriodo(dataInicio, dataFim) {
    const [rows] = await db.execute(
      'SELECT * FROM despesas WHERE data_despesa BETWEEN ? AND ? ORDER BY data_despesa DESC',
      [dataInicio, dataFim]
    );
    return rows.map(row => Despesa.fromDatabase(row));
  }

  // Buscar despesas por status
  async findByStatus(status) {
    const [rows] = await db.execute(
      'SELECT * FROM despesas WHERE status = ? ORDER BY data_despesa DESC',
      [status]
    );
    return rows.map(row => Despesa.fromDatabase(row));
  }

  // Estatísticas básicas
  async getEstatisticas(filters = {}) {
    let whereClause = 'WHERE 1=1';
    const params = [];

    // Aplicar filtros se fornecidos
    if (filters.dataInicio) {
      whereClause += ' AND data_despesa >= ?';
      params.push(filters.dataInicio);
    }

    if (filters.dataFim) {
      whereClause += ' AND data_despesa <= ?';
      params.push(filters.dataFim);
    }

    // Total de despesas
    const [totalRows] = await db.execute(`
      SELECT COUNT(*) as total, SUM(valor) as soma_total FROM despesas ${whereClause}
    `, params);

    // Despesas por status
    const [statusRows] = await db.execute(`
      SELECT status, COUNT(*) as quantidade, SUM(valor) as valor_total 
      FROM despesas ${whereClause} 
      GROUP BY status
    `, params);

    // Despesas por categoria (top 5)
    const [categoriaRows] = await db.execute(`
      SELECT categoria, COUNT(*) as quantidade, SUM(valor) as valor_total 
      FROM despesas ${whereClause} 
      GROUP BY categoria 
      ORDER BY valor_total DESC 
      LIMIT 5
    `, params);

    return {
      total: totalRows[0].total || 0,
      valorTotal: parseFloat(totalRows[0].soma_total || 0),
      porStatus: statusRows,
      porCategoria: categoriaRows
    };
  }

  // Verificar se existe despesa com mesma descrição e data
  async existsByDescricaoEData(descricao, dataDespesa, excludeId = null) {
    let query = 'SELECT COUNT(*) as count FROM despesas WHERE descricao = ? AND data_despesa = ?';
    const params = [descricao, dataDespesa];

    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }

    const [rows] = await db.execute(query, params);
    return rows[0].count > 0;
  }

  // Verificar se existe despesa associada a um tipo de despesa
  async existsByCategoria(categoria) {
    const [rows] = await db.execute(
      'SELECT COUNT(*) as count FROM despesas WHERE categoria = ?',
      [categoria]
    );
    return rows[0].count > 0;
  }

  // Verificar se existe despesa associada a um tipo de despesa por ID
  async existsByTipoDespesaId(tipoDespesaId) {
    const [rows] = await db.execute(
      'SELECT COUNT(*) as count FROM despesas WHERE tipo_despesa_id = ?',
      [tipoDespesaId]
    );
    return rows[0].count > 0;
  }
}

module.exports = new DespesaRepository();