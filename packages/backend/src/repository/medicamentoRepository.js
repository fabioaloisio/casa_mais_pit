// Aldruin Bonfim de Lima Souza - RA 10482416915

const db = require('../config/database');
const Medicamento = require('../models/medicamento');

class MedicamentoRepository {
  async findAll() {
    const [rows] = await db.execute(`
      SELECT m.*, u.nome AS unidade_nome, u.sigla AS unidade_sigla 
      FROM medicamentos m 
      LEFT JOIN unidades_medida u ON m.unidade_medida_id = u.id 
      ORDER BY m.nome ASC;
    `);
    return rows.map(row => new Medicamento(row));
  }

  async findById(id) {
    const [rows] = await db.execute(`
      SELECT m.*, u.nome AS unidade_nome, u.sigla AS unidade_sigla 
      FROM medicamentos m 
      LEFT JOIN unidades_medida u ON m.unidade_medida_id = u.id 
      WHERE m.id = ?;
    `, [id]);
    return rows.length ? new Medicamento(rows[0]) : null;
  }

  async findByFormaFarmaceutica(forma_farmaceutica) {
    const [rows] = await db.execute(`
      SELECT m.*, u.nome AS unidade_nome, u.sigla AS unidade_sigla 
      FROM medicamentos m 
      LEFT JOIN unidades_medida u ON m.unidade_medida_id = u.id 
      WHERE m.forma_farmaceutica LIKE ? 
      ORDER BY m.nome ASC;
    `, [`%${forma_farmaceutica}%`]);
    return rows.map(row => new Medicamento(row));
  }

  async findByNome(nome) {
    const [rows] = await db.execute(`
      SELECT m.*, u.nome AS unidade_nome, u.sigla AS unidade_sigla 
      FROM medicamentos m 
      LEFT JOIN unidades_medida u ON m.unidade_medida_id = u.id 
      WHERE m.nome LIKE ? 
      ORDER BY m.nome ASC;
    `, [`%${nome}%`]);
    return rows.map(row => new Medicamento(row));
  }

  async create(medicamento) {
    const [result] = await db.execute(`
      INSERT INTO medicamentos (nome, forma_farmaceutica, descricao, unidade_medida_id) 
      VALUES (?, ?, ?, ?);
    `, [medicamento.nome, medicamento.forma_farmaceutica, medicamento.descricao, medicamento.unidade_medida_id]);

    medicamento.id = result.insertId;
    return medicamento;
  }

  async update(id, medicamento) {
    const campos = [];
    const valores = [];

    if (medicamento.nome !== undefined) {
      campos.push('nome = ?');
      valores.push(medicamento.nome);
    }
    if (medicamento.forma_farmaceutica !== undefined) {
      campos.push('forma_farmaceutica = ?');
      valores.push(medicamento.forma_farmaceutica);
    }
    if (medicamento.descricao !== undefined) {
      campos.push('descricao = ?');
      valores.push(medicamento.descricao);
    }
    if (medicamento.unidade_medida_id !== undefined) {
      campos.push('unidade_medida_id = ?');
      valores.push(medicamento.unidade_medida_id);
    }

    if (campos.length === 0) return false;

    valores.push(id);

    const [result] = await db.execute(`
      UPDATE medicamentos SET ${campos.join(', ')} WHERE id = ?;
    `, valores);

    return result.affectedRows > 0;
  }

  async delete(id) {
    const [result] = await db.execute('DELETE FROM medicamentos WHERE id = ?;', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = new MedicamentoRepository();