const pool = require('../config/database');
const Doador = require('../models/doador');

class DoadorRepository {
  async create(doador) {
    const connection = await pool.getConnection();
    try {
      const doadorData = doador.toCreateObject();
      const [result] = await connection.execute(
        `INSERT INTO doadores (tipo_doador, nome, documento, email, telefone, endereco, cidade, estado, cep, ativo) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          doadorData.tipo_doador,
          doadorData.nome,
          doadorData.documento,
          doadorData.email,
          doadorData.telefone,
          doadorData.endereco,
          doadorData.cidade,
          doadorData.estado,
          doadorData.cep,
          doadorData.ativo
        ]
      );
      return result.insertId;
    } finally {
      connection.release();
    }
  }

  async findById(id) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM doadores WHERE id = ?',
        [id]
      );
      return rows.length > 0 ? Doador.fromRow(rows[0]) : null;
    } finally {
      connection.release();
    }
  }

  async findByDocumento(documento) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM doadores WHERE documento = ?',
        [documento]
      );
      return rows.length > 0 ? Doador.fromRow(rows[0]) : null;
    } finally {
      connection.release();
    }
  }

  async findAll(filters = {}) {
    const connection = await pool.getConnection();
    try {
      let query = 'SELECT * FROM doadores WHERE 1=1';
      const params = [];

      if (filters.tipo_doador) {
        query += ' AND tipo_doador = ?';
        params.push(filters.tipo_doador);
      }

      if (filters.ativo !== undefined) {
        query += ' AND ativo = ?';
        params.push(filters.ativo);
      }

      if (filters.search) {
        query += ' AND (nome LIKE ? OR documento LIKE ? OR email LIKE ?)';
        const searchParam = `%${filters.search}%`;
        params.push(searchParam, searchParam, searchParam);
      }

      query += ' ORDER BY nome ASC';

      const [rows] = await connection.execute(query, params);
      return rows.map(row => Doador.fromRow(row));
    } finally {
      connection.release();
    }
  }

  async update(id, doador) {
    const connection = await pool.getConnection();
    try {
      const updateData = doador.toUpdateObject();
      const fields = Object.keys(updateData);
      
      if (fields.length === 0) {
        return 0;
      }

      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => updateData[field]);
      values.push(id);

      const [result] = await connection.execute(
        `UPDATE doadores SET ${setClause} WHERE id = ?`,
        values
      );
      
      return result.affectedRows;
    } finally {
      connection.release();
    }
  }

  async delete(id) {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        'DELETE FROM doadores WHERE id = ?',
        [id]
      );
      return result.affectedRows;
    } finally {
      connection.release();
    }
  }

  async findDoacoesByDoadorId(doadorId) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT d.*, 
                doador.nome as nome_doador,
                doador.documento,
                doador.tipo_doador
         FROM doacoes d
         INNER JOIN doadores doador ON d.doador_id = doador.id
         WHERE d.doador_id = ?
         ORDER BY d.data_doacao DESC`,
        [doadorId]
      );
      return rows;
    } finally {
      connection.release();
    }
  }

  async getTotalDoacoesByDoador(doadorId) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT 
          COUNT(*) as total_doacoes,
          SUM(valor) as valor_total,
          MIN(data_doacao) as primeira_doacao,
          MAX(data_doacao) as ultima_doacao
         FROM doacoes
         WHERE doador_id = ?`,
        [doadorId]
      );
      return rows[0];
    } finally {
      connection.release();
    }
  }
}

module.exports = new DoadorRepository();