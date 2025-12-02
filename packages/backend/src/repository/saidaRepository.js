const db = require('../config/database');
const Saida = require('../models/saida');

class SaidaRepository {
  async findAll() {
    const [rows] = await db.execute(`
      SELECT s.*
      FROM saidas s
      ORDER BY s.dataSaida DESC;
    `);
    return rows.map(row => new Saida(row));
  }

  async findById(id) {
    const [rows] = await db.execute(`
      SELECT s.*
      FROM saidas s
      WHERE s.id = ?;
    `, [id]);
    return rows.length ? new Saida(rows[0]) : null;
  }

  async findByAssistidaId(assistidaId) {
  const [rows] = await db.execute(
    `SELECT * FROM saidas WHERE assistidaId = ?`,
    [assistidaId]
  );

  // Se não houver resultados, retorna array vazio
  if (!rows || rows.length === 0) return [];

  // Mapeia cada linha para uma instância de Saida
  return rows.map(row => new Saida(row));
}


  async create(saida) {
    const [result] = await db.execute(`
      INSERT INTO saidas (assistidaId, dataSaida, diasInternacao, motivoSaida, observacoesSaida)
      VALUES (?, ?, ?, ?, ?);
    `, [
      saida.assistidaId,
      saida.dataSaida,
      saida.diasInternacao,
      saida.motivoSaida,
      saida.observacoesSaida
    ]);

    saida.id = result.insertId;

    await db.execute(
      `UPDATE assistidas SET status = 'Inativa' WHERE id = ?`,
      [saida.assistidaId]
    );

    return saida;
  }

  async update(id, saida) {
    const campos = [];
    const valores = [];

    if (saida.assistidaId !== undefined) {
      campos.push('assistidaId = ?');
      valores.push(saida.assistidaId);
    }
    if (saida.dataSaida !== undefined) {
      campos.push('dataSaida = ?');
      valores.push(saida.dataSaida);
    }
    if (saida.diasInternacao !== undefined) {
      campos.push('diasInternacao = ?');
      valores.push(saida.diasInternacao);
    }
    if (saida.motivoSaida !== undefined) {
      campos.push('motivoSaida = ?');
      valores.push(saida.motivoSaida);
    }
    if (saida.observacoesSaida !== undefined) {
      campos.push('observacoesSaida = ?');
      valores.push(saida.observacoesSaida);
    }

    if (campos.length === 0) return false;

    valores.push(id);

    const [result] = await db.execute(`
      UPDATE saidas SET ${campos.join(', ')} WHERE id = ?;
    `, valores);

    return result.affectedRows > 0;
  }

  async delete(id) {
    const [result] = await db.execute('DELETE FROM saidas WHERE id = ?;', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = new SaidaRepository();
