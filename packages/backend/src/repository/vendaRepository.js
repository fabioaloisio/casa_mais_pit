const db = require('../config/database');
const BaseRepository = require('../../../shared/repository/BaseRepository');
const Venda = require('../models/venda');

class VendaRepository extends BaseRepository {
  constructor() {
    super('vendas', 'v');
  }

  async findAll(filters = {}) {
    let query = `
      SELECT 
        v.*,
        p.nome as produto_nome,
        p.preco_venda as produto_preco_venda,
        u.nome as usuario_nome
      FROM vendas v
      LEFT JOIN produtos p ON v.produto_id = p.id
      LEFT JOIN usuarios u ON v.usuario_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.data_inicio) {
      query += ' AND v.data_venda >= ?';
      params.push(filters.data_inicio);
    }

    if (filters.data_fim) {
      query += ' AND v.data_venda <= ?';
      params.push(filters.data_fim);
    }

    if (filters.produto_id) {
      query += ' AND v.produto_id = ?';
      params.push(filters.produto_id);
    }

    query += ' ORDER BY v.data_venda DESC, v.id DESC';

    const [rows] = await db.execute(query, params);
    return rows.map(row => new Venda(row));
  }

  async findById(id) {
    const [rows] = await db.execute(`
      SELECT 
        v.*,
        p.nome as produto_nome,
        p.preco_venda as produto_preco_venda,
        u.nome as usuario_nome
      FROM vendas v
      LEFT JOIN produtos p ON v.produto_id = p.id
      LEFT JOIN usuarios u ON v.usuario_id = u.id
      WHERE v.id = ?;
    `, [id]);
    return rows.length ? new Venda(rows[0]) : null;
  }

  async create(venda) {
    // Buscar preço e custo do produto
    const [produtoRows] = await db.execute(`
      SELECT preco_venda, custo_estimado 
      FROM produtos 
      WHERE id = ?;
    `, [venda.produto_id]);

    if (!produtoRows.length) {
      throw new Error('Produto não encontrado.');
    }

    const produto = produtoRows[0];
    const valorBruto = venda.quantidade * produto.preco_venda;
    const valorFinal = valorBruto - (venda.desconto || 0);
    const custoEstimadoTotal = venda.quantidade * produto.custo_estimado;
    const lucroEstimado = valorFinal - custoEstimadoTotal;

    const [result] = await db.execute(`
      INSERT INTO vendas (
        produto_id, quantidade, valor_bruto, desconto, valor_final,
        forma_pagamento, custo_estimado_total, lucro_estimado,
        observacoes, data_venda, usuario_id
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `, [
      venda.produto_id,
      venda.quantidade,
      valorBruto,
      venda.desconto || 0,
      valorFinal,
      venda.forma_pagamento,
      custoEstimadoTotal,
      lucroEstimado,
      venda.observacoes || '',
      venda.data_venda,
      venda.usuario_id || null
    ]);

    venda.id = result.insertId;
    venda.valor_bruto = valorBruto;
    venda.valor_final = valorFinal;
    venda.custo_estimado_total = custoEstimadoTotal;
    venda.lucro_estimado = lucroEstimado;

    return venda;
  }

  async update(id, venda) {
    // Buscar preço e custo do produto
    const [produtoRows] = await db.execute(`
      SELECT preco_venda, custo_estimado 
      FROM produtos 
      WHERE id = ?;
    `, [venda.produto_id]);

    if (!produtoRows.length) {
      throw new Error('Produto não encontrado.');
    }

    const produto = produtoRows[0];
    const valorBruto = venda.quantidade * produto.preco_venda;
    const valorFinal = valorBruto - (venda.desconto || 0);
    const custoEstimadoTotal = venda.quantidade * produto.custo_estimado;
    const lucroEstimado = valorFinal - custoEstimadoTotal;

    const campos = [];
    const valores = [];

    if (venda.produto_id !== undefined) {
      campos.push('produto_id = ?');
      valores.push(venda.produto_id);
    }
    if (venda.quantidade !== undefined) {
      campos.push('quantidade = ?');
      valores.push(venda.quantidade);
      campos.push('valor_bruto = ?');
      valores.push(valorBruto);
      campos.push('custo_estimado_total = ?');
      valores.push(custoEstimadoTotal);
    }
    if (venda.desconto !== undefined) {
      campos.push('desconto = ?');
      valores.push(venda.desconto);
      campos.push('valor_final = ?');
      valores.push(valorFinal);
    }
    if (venda.forma_pagamento !== undefined) {
      campos.push('forma_pagamento = ?');
      valores.push(venda.forma_pagamento);
    }
    if (venda.observacoes !== undefined) {
      campos.push('observacoes = ?');
      valores.push(venda.observacoes);
    }
    if (venda.data_venda !== undefined) {
      campos.push('data_venda = ?');
      valores.push(venda.data_venda);
    }

    campos.push('lucro_estimado = ?');
    valores.push(lucroEstimado);

    if (campos.length === 0) return false;

    valores.push(id);

    const [result] = await db.execute(`
      UPDATE vendas SET ${campos.join(', ')} WHERE id = ?;
    `, valores);

    return result.affectedRows > 0;
  }

  async delete(id) {
    const [result] = await db.execute('DELETE FROM vendas WHERE id = ?;', [id]);
    return result.affectedRows > 0;
  }

  async getRelatorioPeriodo(dataInicio, dataFim) {
    const [rows] = await db.execute(`
      SELECT 
        DATE(v.data_venda) as data,
        COUNT(v.id) as total_vendas,
        SUM(v.quantidade) as total_quantidade,
        SUM(v.valor_bruto) as total_valor_bruto,
        SUM(v.desconto) as total_desconto,
        SUM(v.valor_final) as total_valor_final,
        SUM(v.custo_estimado_total) as total_custo_estimado,
        SUM(v.lucro_estimado) as total_lucro_estimado
      FROM vendas v
      WHERE v.data_venda >= ? AND v.data_venda <= ?
      GROUP BY DATE(v.data_venda)
      ORDER BY data DESC;
    `, [dataInicio, dataFim]);

    return rows;
  }
}

module.exports = new VendaRepository();

