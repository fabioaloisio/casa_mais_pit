const db = require('../config/database');
const BaseRepository = require('../../../shared/repository/BaseRepository');
const Receita = require('../models/receita');
const MateriaPrima = require('../models/materiaPrima');

class ReceitaRepository extends BaseRepository {
  constructor() {
    super('receitas', 'r');
  }

  async findAll() {
    const [rows] = await db.execute(`
      SELECT * FROM receitas
      WHERE ativo = 1
      ORDER BY nome ASC;
    `);

    const receitas = await Promise.all(
      rows.map(async (row) => {
        const receita = new Receita(row);
        receita.materias_primas = await this.getMateriasPrimas(receita.id);
        return receita;
      })
    );

    return receitas;
  }

  async findById(id) {
    const [rows] = await db.execute(`
      SELECT * FROM receitas
      WHERE id = ?;
    `, [id]);

    if (!rows.length) return null;

    const receita = new Receita(rows[0]);
    receita.materias_primas = await this.getMateriasPrimas(id);
    return receita;
  }

  async getMateriasPrimas(receitaId) {
    const [rows] = await db.execute(`
      SELECT
        rmp.*,
        mp.nome as materia_prima_nome,
        mp.unidade_medida,
        mp.preco_por_unidade
      FROM receitas_materias_primas rmp
      JOIN materias_primas mp ON rmp.materia_prima_id = mp.id
      WHERE rmp.receita_id = ?;
    `, [receitaId]);

    return rows;
  }

  async create(receita) {
    const [result] = await db.execute(`
      INSERT INTO receitas (nome, descricao, rendimento, custo_estimado, ativo)
      VALUES (?, ?, ?, ?, ?);
    `, [
      receita.nome,
      receita.descricao,
      receita.rendimento,
      receita.custo_estimado || 0,
      receita.ativo
    ]);

    receita.id = result.insertId;

    // Adicionar matérias-primas se fornecidas
    if (receita.materias_primas && receita.materias_primas.length > 0) {
      await this.addMateriasPrimas(receita.id, receita.materias_primas);
      await this.recalcularCusto(receita.id);
    }

    return receita;
  }

  async addMateriasPrimas(receitaId, materiasPrimas) {
    // Remove todas as matérias-primas existentes
    await db.execute(`
      DELETE FROM receitas_materias_primas WHERE receita_id = ?;
    `, [receitaId]);

    // Adiciona as novas matérias-primas
    for (const mp of materiasPrimas) {
      // Buscar preço da matéria-prima
      const [mpRows] = await db.execute(`
        SELECT preco_por_unidade FROM materias_primas WHERE id = ?;
      `, [mp.materia_prima_id]);

      if (!mpRows.length) {
        throw new Error(`Matéria-prima com ID ${mp.materia_prima_id} não encontrada`);
      }

      // Garantir que são números válidos
      const precoPorUnidade = parseFloat(mpRows[0].preco_por_unidade);
      if (isNaN(precoPorUnidade)) {
        throw new Error(`Preço inválido para matéria-prima ID ${mp.materia_prima_id}`);
      }

      // Normalizar quantidade: pode vir como string ou number
      let quantidade = mp.quantidade;
      if (typeof quantidade === 'string') {
        // Remover formatação e converter vírgula para ponto
        quantidade = quantidade.replace(/[^\d.,]/g, '').replace(',', '.');
      }
      quantidade = parseFloat(quantidade);

      if (isNaN(quantidade) || quantidade <= 0) {
        throw new Error(`Quantidade inválida: ${mp.quantidade}`);
      }

      // Calcular custo parcial (o trigger também vai calcular, mas vamos garantir)
      const custoParcial = parseFloat((quantidade * precoPorUnidade).toFixed(2));

      await db.execute(`
        INSERT INTO receitas_materias_primas (receita_id, materia_prima_id, quantidade, custo_parcial)
        VALUES (?, ?, ?, ?);
      `, [
        receitaId,
        parseInt(mp.materia_prima_id),
        quantidade,
        custoParcial
      ]);
    }

    // Recalcular custo da receita (os triggers vão atualizar automaticamente)
    await this.recalcularCusto(receitaId);
  }

  async recalcularCusto(receitaId) {
    const [rows] = await db.execute(`
      SELECT SUM(custo_parcial) as custo_total
      FROM receitas_materias_primas
      WHERE receita_id = ?;
    `, [receitaId]);

    const custoTotal = parseFloat(rows[0]?.custo_total) || 0;

    await db.execute(`
      UPDATE receitas
      SET custo_estimado = ?
      WHERE id = ?;
    `, [custoTotal, receitaId]);

    // Buscar rendimento da receita
    const [receitaRows] = await db.execute(`
      SELECT rendimento FROM receitas WHERE id = ?;
    `, [receitaId]);

    if (receitaRows.length > 0) {
      const rendimento = parseInt(receitaRows[0].rendimento) || 1;

      if (rendimento > 0) {
        const custoPorUnidade = parseFloat((custoTotal / rendimento).toFixed(2));

        // Atualizar custo dos produtos que usam esta receita
        await db.execute(`
          UPDATE produtos
          SET custo_estimado = ?,
              margem_bruta = preco_venda - ?,
              margem_percentual = CASE
                WHEN preco_venda > 0 THEN
                  ((preco_venda - ?) / preco_venda) * 100
                ELSE 0
              END
          WHERE receita_id = ?;
        `, [custoPorUnidade, custoPorUnidade, custoPorUnidade, receitaId]);
      }
    }
  }

  async update(id, receita) {
    const campos = [];
    const valores = [];

    if (receita.nome !== undefined) {
      campos.push('nome = ?');
      valores.push(receita.nome);
    }
    if (receita.descricao !== undefined) {
      campos.push('descricao = ?');
      valores.push(receita.descricao);
    }
    if (receita.rendimento !== undefined) {
      campos.push('rendimento = ?');
      valores.push(receita.rendimento);
    }
    if (receita.ativo !== undefined) {
      campos.push('ativo = ?');
      valores.push(receita.ativo);
    }

    if (campos.length > 0) {
      valores.push(id);
      const [result] = await db.execute(`
        UPDATE receitas SET ${campos.join(', ')} WHERE id = ?;
      `, valores);
    }

    // Atualizar matérias-primas se fornecidas
    if (receita.materias_primas !== undefined) {
      await this.addMateriasPrimas(id, receita.materias_primas);
      await this.recalcularCusto(id);
    }

    return true;
  }

  async delete(id) {
    // Soft delete
    const [result] = await db.execute(`
      UPDATE receitas SET ativo = 0 WHERE id = ?;
    `, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = new ReceitaRepository();

