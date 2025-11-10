const db = require('../config/database');
const BaseRepository = require('../../../shared/repository/BaseRepository');
const Produto = require('../models/produto');

class ProdutoRepository extends BaseRepository {
  constructor() {
    super('produtos', 'p');
  }

  async findAll() {
    const [rows] = await db.execute(`
      SELECT p.*, r.nome as receita_nome, r.rendimento as receita_rendimento
      FROM produtos p
      LEFT JOIN receitas r ON p.receita_id = r.id
      WHERE p.ativo = 1
      ORDER BY p.nome ASC;
    `);
    return rows.map(row => {
      const produto = new Produto(row);
      return produto;
    });
  }

  async findById(id) {
    const [rows] = await db.execute(`
      SELECT p.*, r.nome as receita_nome, r.rendimento as receita_rendimento
      FROM produtos p
      LEFT JOIN receitas r ON p.receita_id = r.id
      WHERE p.id = ?;
    `, [id]);
    return rows.length ? new Produto(rows[0]) : null;
  }

  async create(produto) {
    let custoEstimado = produto.custo_estimado || 0;

    // Se tem receita vinculada, calcular custo estimado a partir da receita
    if (produto.receita_id) {
      const [receitaRows] = await db.execute(`
        SELECT custo_estimado, rendimento
        FROM receitas
        WHERE id = ?;
      `, [produto.receita_id]);

      if (receitaRows.length > 0) {
        const receita = receitaRows[0];
        const custoReceita = parseFloat(receita.custo_estimado) || 0;
        const rendimento = parseInt(receita.rendimento) || 1;

        if (rendimento > 0) {
          custoEstimado = parseFloat((custoReceita / rendimento).toFixed(2));
        }
      }
    }

    const [result] = await db.execute(`
      INSERT INTO produtos (nome, descricao, preco_venda, receita_id, custo_estimado, margem_bruta, margem_percentual, ativo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `, [
      produto.nome,
      produto.descricao,
      produto.preco_venda,
      produto.receita_id || null,
      custoEstimado,
      produto.margem_bruta || 0,
      produto.margem_percentual || 0,
      produto.ativo
    ]);

    produto.id = result.insertId;
    produto.custo_estimado = custoEstimado;

    // Recalcular margem (os triggers também vão fazer isso, mas garantimos aqui)
    await this.recalcularMargem(produto.id);

    // Buscar o produto atualizado
    return await this.findById(produto.id);
  }

  async update(id, produto) {
    const campos = [];
    const valores = [];

    if (produto.nome !== undefined) {
      campos.push('nome = ?');
      valores.push(produto.nome);
    }
    if (produto.descricao !== undefined) {
      campos.push('descricao = ?');
      valores.push(produto.descricao);
    }
    if (produto.preco_venda !== undefined) {
      campos.push('preco_venda = ?');
      valores.push(produto.preco_venda);
    }

    // Se receita_id está sendo atualizado, calcular custo estimado
    if (produto.receita_id !== undefined) {
      campos.push('receita_id = ?');
      valores.push(produto.receita_id || null);

      // Se tem receita, calcular custo estimado
      if (produto.receita_id) {
        const [receitaRows] = await db.execute(`
          SELECT custo_estimado, rendimento
          FROM receitas
          WHERE id = ?;
        `, [produto.receita_id]);

        if (receitaRows.length > 0) {
          const receita = receitaRows[0];
          const custoReceita = parseFloat(receita.custo_estimado) || 0;
          const rendimento = parseInt(receita.rendimento) || 1;

          if (rendimento > 0) {
            const custoEstimado = parseFloat((custoReceita / rendimento).toFixed(2));
            campos.push('custo_estimado = ?');
            valores.push(custoEstimado);
          }
        }
      } else {
        // Se receita_id é null, manter ou zerar custo_estimado
        campos.push('custo_estimado = ?');
        valores.push(produto.custo_estimado || 0);
      }
    }

    if (produto.ativo !== undefined) {
      campos.push('ativo = ?');
      valores.push(produto.ativo);
    }

    if (campos.length === 0) return false;

    valores.push(id);

    const [result] = await db.execute(`
      UPDATE produtos SET ${campos.join(', ')} WHERE id = ?;
    `, valores);

    // Recalcular margem se necessário (os triggers também fazem isso)
    if (result.affectedRows > 0) {
      await this.recalcularMargem(id);
    }

    return result.affectedRows > 0;
  }

  async recalcularMargem(id) {
    const [rows] = await db.execute(`
      SELECT preco_venda, custo_estimado
      FROM produtos
      WHERE id = ?;
    `, [id]);

    if (rows.length > 0) {
      const precoVenda = parseFloat(rows[0].preco_venda) || 0;
      const custoEstimado = parseFloat(rows[0].custo_estimado) || 0;
      const margemBruta = parseFloat((precoVenda - custoEstimado).toFixed(2));
      const margemPercentual = precoVenda > 0
        ? parseFloat(((margemBruta / precoVenda) * 100).toFixed(2))
        : 0;

      await db.execute(`
        UPDATE produtos
        SET margem_bruta = ?, margem_percentual = ?
        WHERE id = ?;
      `, [margemBruta, margemPercentual, id]);
    }
  }

  async delete(id) {
    // Soft delete
    const [result] = await db.execute(`
      UPDATE produtos SET ativo = 0 WHERE id = ?;
    `, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = new ProdutoRepository();

