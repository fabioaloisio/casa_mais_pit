const db = require('../config/database');
const UnidadeMedida = require('../models/unidadeMedida');

class UnidadeMedidaRepository {
  async findAll() {
    const [rows] = await db.execute('SELECT * FROM unidades_medida ORDER BY nome ASC;');
    return rows.map(row => new UnidadeMedida(row));
  }

  async findById(id) {
    const [rows] = await db.execute('SELECT * FROM unidades_medida WHERE id = ? ORDER BY nome ASC;', [id]);
    return rows.length ? new UnidadeMedida(rows[0]) : null;
  }

  async findByNome(nome) {
    const [rows] = await db.execute('SELECT * FROM unidades_medida WHERE nome LIKE ? ORDER BY nome ASC;', [`%${nome}%`]);
    return rows.map(row => new UnidadeMedida(row));
  }

  async create(unidadeMedida) {
    const [result] = await db.execute(
      `INSERT INTO unidades_medida (nome, sigla) VALUES (?, ?);`,
      [unidadeMedida.nome, unidadeMedida.sigla]
    );
    unidadeMedida.id = result.insertId;
    return unidadeMedida;
  }

  async update(id, unidadeMedida) {
    const campos = [];
    const valores = [];

    if (unidadeMedida.nome !== undefined) {
      campos.push('nome = ?');
      valores.push(unidadeMedida.nome);
    }
    if (unidadeMedida.sigla !== undefined) {
      campos.push('sigla = ?');
      valores.push(unidadeMedida.sigla);
    }

    if (campos.length === 0) return false;

    valores.push(id);

    const [result] = await db.execute(
      `UPDATE unidades_medida SET ${campos.join(', ')} WHERE id = ?;`,
      valores
    );

    return result.affectedRows > 0;
  }

  async delete(id) {
    const [result] = await db.execute('DELETE FROM unidades_medida WHERE id = ?;', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = new UnidadeMedidaRepository();