const pool = require('../config/database');
const BaseRepository = require('../../../shared/repository/BaseRepository');
const Doador = require('../models/doador');

class DoadorRepository extends BaseRepository {
  constructor() {
    super('doadores', 'd');
    this.pool = pool;
  }
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

  // Método unificado para buscar histórico completo do doador (itens + monetárias)
  async findHistoricoUnificadoByDoadorId(doadorId) {
    const connection = await pool.getConnection();
    try {
      // Buscar doações de itens
      const [doacoesItens] = await connection.execute(
        `SELECT d.*, 
                doador.nome as nome_doador,
                doador.documento as documento_doador,
                'item' as tipo_doacao,
                d.data_doacao as data_movimentacao
         FROM doacoes d
         INNER JOIN doadores doador ON d.doador_id = doador.id 
         WHERE d.doador_id = ?
         ORDER BY d.data_doacao DESC`,
        [doadorId]
      );

      // Buscar doações monetárias
      const [doacoesMonetarias] = await connection.execute(
        `SELECT cm.*, 
                dr.nome as nome_doador,
                dr.documento as documento_doador,
                'monetaria' as tipo_doacao,
                cm.data_movimentacao
         FROM caixa_movimentacoes cm
         INNER JOIN doadores dr ON cm.doador_id = dr.id 
         WHERE cm.doador_id = ? AND cm.categoria = 'doacao_monetaria'
         ORDER BY cm.data_movimentacao DESC`,
        [doadorId]
      );

      // Combinar e ordenar por data
      const historico = [
        ...doacoesItens.map(doacao => ({
          id: doacao.id,
          tipo_doacao: 'item',
          valor: doacao.valor || 0,
          descricao: doacao.observacoes || 'Doação de item',
          data_movimentacao: doacao.data_doacao,
          nome_doador: doacao.nome_doador,
          documento_doador: doacao.documento_doador,
          detalhes_item: {
            medicamento_nome: doacao.medicamento_nome,
            quantidade: doacao.quantidade,
            lote: doacao.lote,
            validade: doacao.data_validade
          }
        })),
        ...doacoesMonetarias.map(doacao => ({
          id: doacao.id,
          tipo_doacao: 'monetaria',
          valor: doacao.valor || 0,
          descricao: doacao.descricao || 'Doação monetária',
          data_movimentacao: doacao.data_movimentacao,
          nome_doador: doacao.nome_doador,
          documento_doador: doacao.documento_doador,
          detalhes_monetaria: {
            forma_pagamento: doacao.forma_pagamento,
            numero_recibo: doacao.numero_recibo
          }
        }))
      ].sort((a, b) => new Date(b.data_movimentacao) - new Date(a.data_movimentacao));

      return historico;
    } finally {
      connection.release();
    }
  }

  // Método para obter estatísticas consolidadas do doador
  async getEstatisticasConsolidadas(doadorId) {
    const connection = await pool.getConnection();
    try {
      // Estatísticas de doações de itens
      const [statsItens] = await connection.execute(
        `SELECT 
          COUNT(*) as total_doacoes_itens,
          SUM(valor) as valor_total_itens,
          MIN(data_doacao) as primeira_doacao_item,
          MAX(data_doacao) as ultima_doacao_item
         FROM doacoes
         WHERE doador_id = ?`,
        [doadorId]
      );

      // Estatísticas de doações monetárias
      const [statsMonetarias] = await connection.execute(
        `SELECT 
          COUNT(*) as total_doacoes_monetarias,
          SUM(valor) as valor_total_monetario,
          MIN(data_movimentacao) as primeira_doacao_monetaria,
          MAX(data_movimentacao) as ultima_doacao_monetaria
         FROM caixa_movimentacoes
         WHERE doador_id = ? AND categoria = 'doacao_monetaria'`,
        [doadorId]
      );

      const itens = statsItens[0] || {};
      const monetarias = statsMonetarias[0] || {};

      return {
        doacoes_itens: {
          total: itens.total_doacoes_itens || 0,
          valor_total: itens.valor_total_itens || 0,
          primeira_doacao: itens.primeira_doacao_item,
          ultima_doacao: itens.ultima_doacao_item
        },
        doacoes_monetarias: {
          total: monetarias.total_doacoes_monetarias || 0,
          valor_total: monetarias.valor_total_monetario || 0,
          primeira_doacao: monetarias.primeira_doacao_monetaria,
          ultima_doacao: monetarias.ultima_doacao_monetaria
        },
        consolidado: {
          total_geral: (itens.total_doacoes_itens || 0) + (monetarias.total_doacoes_monetarias || 0),
          valor_total_geral: (itens.valor_total_itens || 0) + (monetarias.valor_total_monetario || 0),
          primeira_doacao_geral: [itens.primeira_doacao_item, monetarias.primeira_doacao_monetaria]
            .filter(Boolean)
            .sort((a, b) => new Date(a) - new Date(b))[0],
          ultima_doacao_geral: [itens.ultima_doacao_item, monetarias.ultima_doacao_monetaria]
            .filter(Boolean)
            .sort((a, b) => new Date(b) - new Date(a))[0]
        }
      };
    } finally {
      connection.release();
    }
  }
}

module.exports = new DoadorRepository();