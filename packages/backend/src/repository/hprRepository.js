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

  async create(hprData) {
    const {
      assistida_id, data_atendimento, hora,
      historia_patologica, tempo_sem_uso,
      motivacao_internacoes, fatos_marcantes,
      infancia, adolescencia, drogas = [], internacoes = [], medicamentos = []
    } = hprData;

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // Inserir HPR
      const [result] = await conn.execute(`
        INSERT INTO HPR
        (assistida_id, data_atendimento, hora, historia_patologica, tempo_sem_uso, motivacao_internacoes, fatos_marcantes, infancia, adolescencia)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [assistida_id, data_atendimento, hora, historia_patologica, tempo_sem_uso, motivacao_internacoes, fatos_marcantes, infancia, adolescencia]
      );

      // Inserir drogas
      for (const droga of drogas) {
        await conn.execute(`
          INSERT INTO drogas_utilizadas
          (assistida_id, tipo, idade_inicio, tempo_uso, intensidade, observacoes)
          VALUES (?, ?, ?, ?, ?, ?)`,
          [
            droga.assistida_id,
            droga.tipo,
            droga.idade_inicio,
            droga.tempo_uso,
            droga.intensidade,
            droga.observacoes || ''
          ]
        );
      }

      // Inserir internações
      for (const internacao of internacoes) {
        await conn.execute(`
          INSERT INTO internacoes
          (assistida_id, local, duracao, data)
          VALUES (?, ?, ?, ?)`,
          [assistida_id, internacao.local, internacao.duracao, internacao.data]
        );
      }

      // Inserir medicamentos
      for (const med of medicamentos) {
        await conn.execute(`
          INSERT INTO medicamentos_utilizados
          (assistida_id, nome, dosagem, frequencia)
          VALUES (?, ?, ?, ?)`,
          [assistida_id, med.nome, med.dosagem, med.frequencia]
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

  async update(id, hprData) {
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
        infancia=?, adolescencia=?
        WHERE assistida_id=?`,
        [assistida_id, data_atendimento, hora, historia_patologica, tempo_sem_uso,
          motivacao_internacoes, fatos_marcantes, infancia, adolescencia, assistida_id]
      );

      // Limpar registros antigos
      await conn.execute('DELETE FROM drogas_utilizadas WHERE assistida_id = ?', [assistida_id]);
      await conn.execute('DELETE FROM internacoes WHERE assistida_id = ?', [assistida_id]);
      await conn.execute('DELETE FROM medicamentos_utilizados WHERE assistida_id = ?', [assistida_id]);

      // Inserir novamente
      for (const droga of drogas) {
        await conn.execute(`
          INSERT INTO drogas_utilizadas
          (assistida_id, tipo, idade_inicio, tempo_uso, intensidade, observacoes)
          VALUES (?, ?, ?, ?, ?, ?)`,
          [assistida_id, droga.tipo, droga.idade_inicio, droga.tempo_uso, droga.intensidade, droga.observacoes || '']
        );
      }

      for (const internacao of internacoes) {
        await conn.execute(`
          INSERT INTO internacoes (assistida_id, local, duracao, data)
          VALUES (?, ?, ?, ?)`,
          [assistida_id, internacao.local, internacao.duracao, internacao.data]
        );
      }

      for (const med of medicamentos) {
        await conn.execute(`
          INSERT INTO medicamentos_utilizados (assistida_id, nome, dosagem, frequencia)
          VALUES (?, ?, ?, ?)`,
          [assistida_id, med.nome, med.dosagem, med.frequencia]
        );
      }

      await conn.commit();
      return await this.findById(id);

    } catch (error) {
      await conn.rollback();
      throw new Error(`Erro ao atualizar HPR: ${error.message}`);
    } finally {
      conn.release();
    }
  }

  async delete(id) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [rows] = await conn.execute('SELECT * FROM HPR WHERE id = ?', [id]);
      if (rows.length === 0) throw new Error('HPR não encontrada');

      await conn.execute('DELETE FROM HPR WHERE id = ?', [id]); // cascade deve cuidar das tabelas relacionadas
      await conn.commit();
      return { success: true, message: 'HPR excluída com sucesso' };

    } catch (error) {
      await conn.rollback();
      throw new Error(`Erro ao deletar HPR: ${error.message}`);
    } finally {
      conn.release();
    }
  }

  async findById(id) {
    const [rows] = await db.execute('SELECT * FROM HPR WHERE assistida_id = ?', [id]);
    if (rows.length === 0) return null;

    const hprRow = rows[0];
    const drogas = await this.findDrogasByHPRId(id) || [];
    const internacoes = await this.findInternacoesByHPRId(id) || [];
    const medicamentos = await this.findMedicamentosByHPRId(id) || [];

    return new HPR({ ...hprRow, drogas, internacoes, medicamentos });
  }

  async findDrogasByHPRId(hprId) {
    const [rows] = await db.execute(
      'SELECT assistida_id,tipo, idade_inicio, tempo_uso,intensidade, observacoes FROM drogas_utilizadas WHERE assistida_id = ?',
      [hprId]
    );
    return rows.map(row => new DrogaUtilizada(row));
  }

  async findInternacoesByHPRId(hprId) {
    const [rows] = await db.execute(
      'SELECT local, duracao, data FROM internacoes WHERE assistida_id = ?',
      [hprId]
    );
    return rows.map(row => new Internacao(row));
  }

  async findMedicamentosByHPRId(hprId) {
    const [rows] = await db.execute(
      'SELECT nome, dosagem, frequencia FROM medicamentos_utilizados WHERE assistida_id = ?',
      [hprId]
    );
    return rows.map(row => new MedicamentoUtilizado(row));
  }

}

module.exports = new HPRRepository();
