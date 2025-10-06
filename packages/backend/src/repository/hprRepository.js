const db = require('../config/database');
const { HPR, DrogaUtilizada, Internacao, MedicamentoUtilizado } = require('../models/HPR');

class HPRRepository {
  async findAll() {
    try {
      const [rows] = await db.execute('SELECT * FROM HPR');

      const hprs = await Promise.all(
        rows.map(async (row) => {

          const drogas = await this.findDrogasByHPRId(row.id);
          const internacoes = await this.findInternacoesByHPRId(row.id);
          const medicamentos = await this.findMedicamentosByHPRId(row.id);

          return new HPR({ ...row, drogas, internacoes, medicamentos });
        })
      );

      return hprs;

    } catch (error) {
      throw new Error(`Erro ao buscar HPRs: ${error.message}`);
    }
  }

  async create(hprData, userId) {
    const {
      assistida_id, data_atendimento, hora,
      historia_patologica, tempo_sem_uso,
      motivacao_internacoes, fatos_marcantes,
      infancia, adolescencia, drogas = [], internacoes = [], medicamentos = []
    } = hprData;

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [result] = await conn.execute(`
      INSERT INTO HPR
      (assistida_id, data_atendimento, hora, historia_patologica, tempo_sem_uso, motivacao_internacoes,
       fatos_marcantes, infancia, adolescencia, created_by, updated_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [assistida_id, data_atendimento, hora, historia_patologica, tempo_sem_uso,
          motivacao_internacoes, fatos_marcantes, infancia, adolescencia, userId, userId]
      );

      const hprId = result.insertId;

      // Inserir filhos...
      for (const droga of drogas) {
        await conn.execute(`
        INSERT INTO drogas_utilizadas
        (hpr_id, tipo, idade_inicio, tempo_uso, intensidade, observacoes)
        VALUES (?, ?, ?, ?, ?, ?)`,
          [hprId, droga.tipo, droga.idade_inicio, droga.tempo_uso, droga.intensidade, droga.observacoes || '']
        );
      }

      for (const internacao of internacoes) {
        await conn.execute(`
        INSERT INTO internacoes
        (hpr_id, local, duracao, data)
        VALUES (?, ?, ?, ?)`,
          [hprId, internacao.local, internacao.duracao, internacao.data]
        );
      }

      for (const med of medicamentos) {
        await conn.execute(`
        INSERT INTO medicamentos_utilizados
        (hpr_id, nome, dosagem, frequencia)
        VALUES (?, ?, ?, ?)`,
          [hprId, med.nome, med.dosagem, med.frequencia]
        );
      }

      await conn.commit();
      return await this.findById(assistida_id);

    } catch (error) {
      await conn.rollback();
      throw new Error(`Erro ao criar HPR: ${error.message}`);
    } finally {
      conn.release();
    }
  }


  async update(id, hprData, userId) {
    const {
      assistida_id, data_atendimento, hora,
      historia_patologica, tempo_sem_uso,
      motivacao_internacoes, fatos_marcantes,
      infancia, adolescencia, drogas = [], internacoes = [], medicamentos = []
    } = hprData;

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // Atualiza HPR
      await conn.execute(`
      UPDATE HPR SET
      assistida_id=?, data_atendimento=?, hora=?, historia_patologica=?,
      tempo_sem_uso=?, motivacao_internacoes=?, fatos_marcantes=?,
      infancia=?, adolescencia=?, updated_by=?, updated_at=NOW()
      WHERE id=?`,
        [assistida_id, data_atendimento, hora, historia_patologica, tempo_sem_uso,
          motivacao_internacoes, fatos_marcantes, infancia, adolescencia, userId, id]
      );

      // Limpar registros antigos
      await conn.execute('DELETE FROM drogas_utilizadas WHERE hpr_id = ?', [id]);
      await conn.execute('DELETE FROM internacoes WHERE hpr_id = ?', [id]);
      await conn.execute('DELETE FROM medicamentos_utilizados WHERE hpr_id = ?', [id]);

      // Inserir novamente
      for (const droga of drogas) {
        await conn.execute(`
        INSERT INTO drogas_utilizadas
        (hpr_id, tipo, idade_inicio, tempo_uso, intensidade, observacoes)
        VALUES (?, ?, ?, ?, ?, ?)`,
          [id, droga.tipo, droga.idade_inicio, droga.tempo_uso, droga.intensidade, droga.observacoes || '']
        );
      }

      for (const internacao of internacoes) {
        await conn.execute(`
        INSERT INTO internacoes (hpr_id, local, duracao, data)
        VALUES (?, ?, ?, ?)`,
          [id, internacao.local, internacao.duracao, internacao.data]
        );
      }

      for (const med of medicamentos) {
        await conn.execute(`
        INSERT INTO medicamentos_utilizados (hpr_id, nome, dosagem, frequencia)
        VALUES (?, ?, ?, ?)`,
          [id, med.nome, med.dosagem, med.frequencia]
        );
      }

      await conn.commit();
      return await this.findById(assistida_id);

    } catch (error) {
      await conn.rollback();
      throw new Error(`Erro ao atualizar HPR: ${error.message}`);
    } finally {
      conn.release();
    }
  }


  async delete(id, userId) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [rows] = await conn.execute('SELECT * FROM HPR WHERE id = ?', [id]);
      if (rows.length === 0) throw new Error('HPR não encontrada');

      await conn.execute(`
      UPDATE HPR
      SET deleted_flag = TRUE, deleted_at = NOW(), updated_by = ?
      WHERE id = ?`,
        [userId, id]
      );

      await conn.commit();
      return { success: true, message: 'HPR marcada como excluída' };

    } catch (error) {
      await conn.rollback();
      throw new Error(`Erro ao deletar HPR: ${error.message}`);
    } finally {
      conn.release();
    }
  }



  async findById(assistidaId) {
    const [rows] = await db.execute(
      'SELECT * FROM HPR WHERE assistida_id = ?',
      [assistidaId]
    );

    if (rows.length === 0) return [];

    // Para cada HPR encontrado, buscar drogas, internações e medicamentos
    const hprList = await Promise.all(
      rows.map(async (hprRow) => {
        const drogas = await this.findDrogasByHPRId(hprRow.id) || [];
        const internacoes = await this.findInternacoesByHPRId(hprRow.id) || [];
        const medicamentos = await this.findMedicamentosByHPRId(hprRow.id) || [];

        return new HPR({ ...hprRow, drogas, internacoes, medicamentos });
      })
    );

    return hprList; // retorna um array de HPRs
  }


  async findDrogasByHPRId(hprId) {
    const [rows] = await db.execute(
      'SELECT tipo, idade_inicio, tempo_uso,intensidade, observacoes FROM drogas_utilizadas WHERE hpr_id = ?',
      [hprId]
    );
    return rows.map(row => new DrogaUtilizada(row));
  }

  async findInternacoesByHPRId(hprId) {
    const [rows] = await db.execute(
      'SELECT local, duracao, data FROM internacoes WHERE hpr_id = ?',
      [hprId]
    );
    return rows.map(row => new Internacao(row));
  }

  async findMedicamentosByHPRId(hprId) {
    const [rows] = await db.execute(
      'SELECT nome, dosagem, frequencia FROM medicamentos_utilizados WHERE hpr_id = ?',
      [hprId]
    );
    return rows.map(row => new MedicamentoUtilizado(row));
  }

}

module.exports = new HPRRepository();
