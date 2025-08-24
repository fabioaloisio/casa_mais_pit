const db = require('../config/database');
const TipoDespesa = require('../models/tipoDespesa');

class TipoDespesaRepository {
  async findAll(filters = {}) {
    let query = 'SELECT * FROM tipos_despesas';
    const params = [];
    const conditions = [];

    if (filters.ativo !== undefined) {
      conditions.push('ativo = ?');
      params.push(filters.ativo);
    }

    if (filters.search) {
      conditions.push('nome LIKE ?');
      params.push(`%${filters.search}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY nome ASC';

    const [rows] = await db.execute(query, params);
    return rows.map(row => new TipoDespesa(row));
  }

  async findById(id) {
    const [rows] = await db.execute('SELECT * FROM tipos_despesas WHERE id = ?', [id]);
    return rows.length ? new TipoDespesa(rows[0]) : null;
  }

  async findByNome(nome) {
    const [rows] = await db.execute('SELECT * FROM tipos_despesas WHERE nome LIKE ? ORDER BY nome ASC', [`%${nome}%`]);
    return rows.map(row => new TipoDespesa(row));
  }

  async create(tipoDespesa) {
    const [result] = await db.execute(`
      INSERT INTO tipos_despesas (nome, descricao, ativo) 
      VALUES (?, ?, ?)
    `, [tipoDespesa.nome, tipoDespesa.descricao, tipoDespesa.ativo]);

    tipoDespesa.id = result.insertId;
    return tipoDespesa;
  }

  async update(id, tipoDespesa) {
    const campos = [];
    const valores = [];

    if (tipoDespesa.nome !== undefined) {
      campos.push('nome = ?');
      valores.push(tipoDespesa.nome);
    }
    if (tipoDespesa.descricao !== undefined) {
      campos.push('descricao = ?');
      valores.push(tipoDespesa.descricao);
    }
    if (tipoDespesa.ativo !== undefined) {
      campos.push('ativo = ?');
      valores.push(tipoDespesa.ativo);
    }

    if (campos.length === 0) return false;

    valores.push(id);

    const [result] = await db.execute(`
      UPDATE tipos_despesas SET ${campos.join(', ')} WHERE id = ?
    `, valores);

    return result.affectedRows > 0;
  }

  async delete(id) {
    const [result] = await db.execute('DELETE FROM tipos_despesas WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  async existsByNome(nome, excludeId = null) {
    let query = 'SELECT COUNT(*) as count FROM tipos_despesas WHERE nome = ?';
    const params = [nome];

    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }

    const [rows] = await db.execute(query, params);
    return rows[0].count > 0;
  }
}

module.exports = new TipoDespesaRepository();