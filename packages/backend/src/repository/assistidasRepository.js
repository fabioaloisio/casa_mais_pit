
const db = require('../config/database');
const { Assistida } = require('../models/assistida');

class AssistidaRepository {
  async findAll() {
    try {
      const [rows] = await db.execute('SELECT * FROM assistidas');
      return rows.map(row => new Assistida(row));
    } catch (error) {
      throw new Error(`Erro ao buscar assistidas: ${error.message}`);
    }
  }

  async create(assistidaData) {
    const {
      nome, cpf, rg, idade, data_nascimento, nacionalidade,
      estado_civil, profissao, escolaridade, status,
      logradouro, bairro, numero, cep, estado, cidade,
      telefone, telefone_contato
    } = assistidaData;

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [result] = await conn.execute(`
        INSERT INTO assistidas (
          nome, cpf, rg, idade, data_nascimento, nacionalidade,
          estado_civil, profissao, escolaridade, status,
          logradouro, bairro, numero, cep, estado, cidade,
          telefone, telefone_contato
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        nome, cpf, rg, idade, data_nascimento, nacionalidade,
        estado_civil, profissao, escolaridade, status,
        logradouro, bairro, numero, cep, estado, cidade,
        telefone, telefone_contato,
      ]);

      await conn.commit();
      return await this.findById(result.insertId);

    } catch (error) {
      await conn.rollback();
      throw new Error(`Erro ao criar assistida: ${error.message}`);
    } finally {
      conn.release();
    }
  }

  async update(id, assistidaData) {
    const {
      nome, cpf, rg, idade, data_nascimento, nacionalidade,
      estado_civil, profissao, escolaridade, status,
      logradouro, bairro, numero, cep, estado, cidade,
      telefone, telefone_contato
    } = assistidaData;

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      await conn.execute(`
        UPDATE assistidas SET
          nome = ?, cpf = ?, rg = ?, idade = ?, data_nascimento = ?, nacionalidade = ?,
          estado_civil = ?, profissao = ?, escolaridade = ?, status = ?,
          logradouro = ?, bairro = ?, numero = ?, cep = ?, estado = ?, cidade = ?,
          telefone = ?, telefone_contato = ?
        WHERE id = ?
      `, [
        nome, cpf, rg, idade, data_nascimento, nacionalidade,
        estado_civil, profissao, escolaridade, status,
        logradouro, bairro, numero, cep, estado, cidade,
        telefone, telefone_contato, id
      ]);

      await conn.commit();
      return await this.findById(id);

    } catch (error) {
      await conn.rollback();
      throw new Error(`Erro ao atualizar assistida: ${error.message}`);
    } finally {
      conn.release();
    }
  }

  async delete(id) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [rows] = await conn.execute('SELECT * FROM assistidas WHERE id = ?', [id]);
      if (rows.length === 0) {
        throw new Error('Assistida não encontrada');
      }

      await conn.execute('DELETE FROM assistidas WHERE id = ?', [id]);
      await conn.commit();

      return { success: true, message: 'Assistida removida com sucesso' };

    } catch (error) {
      await conn.rollback();
      throw new Error(`Erro ao remover assistida: ${error.message}`);
    } finally {
      conn.release();
    }
  }

  async findById(id) {
    try {
      const [rows] = await db.execute('SELECT * FROM assistidas WHERE id = ?', [id]);
      if (rows.length === 0) return null;
      return new Assistida(rows[0]);
    } catch (error) {
      throw new Error(`Erro ao buscar assistida: ${error.message}`);
    }
  }

  async findTodosComFiltros({ nome, cpf, idade, status }) {
    try {
      let query = 'SELECT * FROM assistidas WHERE 1=1';
      const params = [];

      if (nome) {
        query += ' AND nome LIKE ?';
        params.push(`%${nome}%`);
      }
      if (cpf) {
        query += ' AND cpf = ?';
        params.push(cpf);
      }
      if (idade) {
        query += ' AND idade = ?';
        params.push(idade);
      }
      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }

      const [rows] = await db.execute(query, params);
      return rows.map(row => new Assistida(row));

    } catch (error) {
      throw new Error(`Erro ao buscar assistidas com filtros: ${error.message}`);
    }
  }

  async obterEstatisticas(filtros = {}) {
    let queryBase = 'FROM assistidas WHERE 1=1';
    const valores = [];

    if (filtros.status) {
      queryBase += ' AND status = ?';
      valores.push(filtros.status);
    }
    if (filtros.cidade) {
      queryBase += ' AND cidade = ?';
      valores.push(filtros.cidade);
    }

    const [totalRows] = await db.execute(`SELECT COUNT(*) as total ${queryBase}`, valores);
    const [statusRows] = await db.execute(`SELECT status, COUNT(*) as quantidade ${queryBase} GROUP BY status`, valores);

    const stats = { total: totalRows[0].total, ativas: 0, HprCadastrada: 0, inativas: 0 };
    for (const row of statusRows) {
      if (row.status === 'Ativa') stats.ativas = row.quantidade;
      if (row.status === 'Hpr Cadastrada') stats.HprCadastrada = row.quantidade;
      if (row.status === 'Inativa') stats.inativas = row.quantidade;
    }

    return stats;
  }
}

module.exports = new AssistidaRepository();
