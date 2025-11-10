const db = require('../config/database');
const BaseRepository = require('../../../shared/repository/BaseRepository');
const MateriaPrima = require('../models/materiaPrima');

class MateriaPrimaRepository extends BaseRepository {
  constructor() {
    super('materias_primas', 'mp');
  }

  async findAll() {
    const [rows] = await db.execute(`
      SELECT * FROM materias_primas 
      WHERE ativo = 1
      ORDER BY nome ASC;
    `);
    return rows.map(row => new MateriaPrima(row));
  }

  async findById(id) {
    const [rows] = await db.execute(`
      SELECT * FROM materias_primas 
      WHERE id = ?;
    `, [id]);
    return rows.length ? new MateriaPrima(rows[0]) : null;
  }

  async create(materiaPrima) {
    const [result] = await db.execute(`
      INSERT INTO materias_primas (nome, unidade_medida, preco_por_unidade, descricao, ativo) 
      VALUES (?, ?, ?, ?, ?);
    `, [
      materiaPrima.nome,
      materiaPrima.unidade_medida,
      materiaPrima.preco_por_unidade,
      materiaPrima.descricao,
      materiaPrima.ativo
    ]);

    materiaPrima.id = result.insertId;
    return materiaPrima;
  }

  async update(id, materiaPrima) {
    const campos = [];
    const valores = [];

    if (materiaPrima.nome !== undefined) {
      campos.push('nome = ?');
      valores.push(materiaPrima.nome);
    }
    if (materiaPrima.unidade_medida !== undefined) {
      campos.push('unidade_medida = ?');
      valores.push(materiaPrima.unidade_medida);
    }
    if (materiaPrima.preco_por_unidade !== undefined) {
      campos.push('preco_por_unidade = ?');
      valores.push(materiaPrima.preco_por_unidade);
    }
    if (materiaPrima.descricao !== undefined) {
      campos.push('descricao = ?');
      valores.push(materiaPrima.descricao);
    }
    if (materiaPrima.ativo !== undefined) {
      campos.push('ativo = ?');
      valores.push(materiaPrima.ativo);
    }

    if (campos.length === 0) return false;

    valores.push(id);

    const [result] = await db.execute(`
      UPDATE materias_primas SET ${campos.join(', ')} WHERE id = ?;
    `, valores);

    return result.affectedRows > 0;
  }

  async delete(id) {
    // Soft delete
    const [result] = await db.execute(`
      UPDATE materias_primas SET ativo = 0 WHERE id = ?;
    `, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = new MateriaPrimaRepository();

