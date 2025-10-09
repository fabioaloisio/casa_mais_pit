const pool = require('../config/database');

class CampanhaRepository {
  // ================ CAMPANHAS ================

  async criarCampanha(dadosCampanha) {
    const connection = await pool.getConnection();
    try {
      const { nome, descricao, meta_valor, data_inicio, data_fim, tipo, imagem_url, criado_por } = dadosCampanha;

      const [result] = await connection.execute(
        `INSERT INTO campanhas (nome, descricao, meta_valor, data_inicio, data_fim, tipo, imagem_url, status, criado_por)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'planejada', ?)`,
        [nome, descricao, meta_valor, data_inicio, data_fim, tipo || null, imagem_url || null, criado_por]
      );

      return result.insertId;
    } finally {
      connection.release();
    }
  }

  async listarCampanhas(filtros = {}) {
    const connection = await pool.getConnection();
    try {
      let query = `
        SELECT
          c.*,
          u.nome as criado_por_nome,
          vca.total_doadores,
          vca.total_doacoes,
          vca.total_arrecadado,
          vca.percentual_meta,
          vca.situacao_temporal
        FROM campanhas c
        LEFT JOIN usuarios u ON c.criado_por = u.id
        LEFT JOIN vw_campanhas_arrecadacao vca ON c.id = vca.id
        WHERE 1=1
      `;
      const params = [];

      if (filtros.status) {
        query += ' AND c.status = ?';
        params.push(filtros.status);
      }

      if (filtros.tipo) {
        query += ' AND c.tipo = ?';
        params.push(filtros.tipo);
      }

      if (filtros.ativas) {
        query += ' AND c.data_inicio <= CURDATE() AND (c.data_fim IS NULL OR c.data_fim >= CURDATE())';
      }

      query += ' ORDER BY c.criado_em DESC';

      const [campanhas] = await connection.execute(query, params);
      return campanhas;
    } finally {
      connection.release();
    }
  }

  async obterCampanhaPorId(id) {
    const connection = await pool.getConnection();
    try {
      const [campanhas] = await connection.execute(
        `SELECT
          c.*,
          u.nome as criado_por_nome,
          vca.total_doadores,
          vca.total_doacoes,
          vca.total_arrecadado,
          vca.percentual_meta,
          vca.situacao_temporal
        FROM campanhas c
        LEFT JOIN usuarios u ON c.criado_por = u.id
        LEFT JOIN vw_campanhas_arrecadacao vca ON c.id = vca.id
        WHERE c.id = ?`,
        [id]
      );

      return campanhas[0] || null;
    } finally {
      connection.release();
    }
  }

  async atualizarCampanha(id, dados) {
    const connection = await pool.getConnection();
    try {
      const camposAtualizaveis = ['nome', 'descricao', 'meta_valor', 'data_inicio', 'data_fim', 'status', 'tipo', 'imagem_url'];
      const campos = [];
      const valores = [];

      for (const campo of camposAtualizaveis) {
        if (dados[campo] !== undefined) {
          campos.push(`${campo} = ?`);
          valores.push(dados[campo]);
        }
      }

      if (campos.length === 0) {
        return false;
      }

      valores.push(id);
      const query = `UPDATE campanhas SET ${campos.join(', ')} WHERE id = ?`;

      const [result] = await connection.execute(query, valores);
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  // ================ DOADORES_CAMPANHAS (N:N) ================

  async associarDoadorCampanha(dados) {
    const connection = await pool.getConnection();
    try {
      const { doador_id, campanha_id, valor_doado, forma_pagamento, recibo_numero, anonimo, mensagem, usuario_registro_id } = dados;

      const [result] = await connection.execute(
        `INSERT INTO doadores_campanhas
         (doador_id, campanha_id, valor_doado, forma_pagamento, recibo_numero, anonimo, mensagem, usuario_registro_id, data_contribuicao)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          doador_id,
          campanha_id,
          valor_doado,
          forma_pagamento || null,
          recibo_numero || null,
          anonimo || false,
          mensagem || null,
          usuario_registro_id
        ]
      );

      return result.insertId;
    } finally {
      connection.release();
    }
  }

  async listarDoadoresCampanha(campanhaId) {
    const connection = await pool.getConnection();
    try {
      const [doadores] = await connection.execute(
        `SELECT
          dc.*,
          CASE
            WHEN dc.anonimo = TRUE THEN 'Doador Anônimo'
            ELSE d.nome
          END as doador_nome,
          d.tipo_doador,
          d.email as doador_email,
          d.telefone as doador_telefone,
          u.nome as registrado_por_nome
        FROM doadores_campanhas dc
        JOIN doadores d ON dc.doador_id = d.id
        LEFT JOIN usuarios u ON dc.usuario_registro_id = u.id
        WHERE dc.campanha_id = ? AND dc.status = 'confirmada'
        ORDER BY dc.data_contribuicao DESC`,
        [campanhaId]
      );

      return doadores;
    } finally {
      connection.release();
    }
  }

  async listarCampanhasDoador(doadorId) {
    const connection = await pool.getConnection();
    try {
      const [campanhas] = await connection.execute(
        `SELECT
          c.*,
          dc.valor_doado,
          dc.data_contribuicao,
          dc.forma_pagamento,
          dc.recibo_numero,
          dc.mensagem
        FROM campanhas c
        JOIN doadores_campanhas dc ON c.id = dc.campanha_id
        WHERE dc.doador_id = ? AND dc.status = 'confirmada'
        ORDER BY dc.data_contribuicao DESC`,
        [doadorId]
      );

      return campanhas;
    } finally {
      connection.release();
    }
  }

  // ================ RELATÓRIOS ================

  async obterEstatisticasCampanha(campanhaId) {
    const connection = await pool.getConnection();
    try {
      // Estatísticas gerais
      const [estatisticas] = await connection.execute(
        `SELECT
          COUNT(DISTINCT doador_id) as total_doadores,
          COUNT(*) as total_doacoes,
          COALESCE(SUM(valor_doado), 0) as total_arrecadado,
          COALESCE(AVG(valor_doado), 0) as valor_medio,
          COALESCE(MAX(valor_doado), 0) as maior_doacao,
          COALESCE(MIN(valor_doado), 0) as menor_doacao
        FROM doadores_campanhas
        WHERE campanha_id = ? AND status = 'confirmada'`,
        [campanhaId]
      );

      // Top doadores
      const [topDoadores] = await connection.execute(
        `SELECT
          CASE
            WHEN dc.anonimo = TRUE THEN 'Doador Anônimo'
            ELSE d.nome
          END as doador_nome,
          SUM(dc.valor_doado) as total_doado,
          COUNT(dc.id) as quantidade_doacoes
        FROM doadores_campanhas dc
        JOIN doadores d ON dc.doador_id = d.id
        WHERE dc.campanha_id = ? AND dc.status = 'confirmada'
        GROUP BY dc.doador_id, dc.anonimo, d.nome
        ORDER BY total_doado DESC
        LIMIT 10`,
        [campanhaId]
      );

      // Evolução diária
      const [evolucaoDiaria] = await connection.execute(
        `SELECT
          DATE(data_contribuicao) as data,
          COUNT(*) as quantidade_doacoes,
          SUM(valor_doado) as total_dia
        FROM doadores_campanhas
        WHERE campanha_id = ? AND status = 'confirmada'
        GROUP BY DATE(data_contribuicao)
        ORDER BY data`,
        [campanhaId]
      );

      return {
        estatisticas: estatisticas[0],
        topDoadores,
        evolucaoDiaria
      };
    } finally {
      connection.release();
    }
  }

  async obterRankingCampanhas(limit = 10) {
    const connection = await pool.getConnection();
    try {
      // Usar query ao invés de execute para evitar problemas com prepared statements
      const [ranking] = await connection.query(
        `SELECT
          c.id,
          c.nome,
          c.meta_valor,
          c.status,
          COUNT(DISTINCT dc.doador_id) as total_doadores,
          COALESCE(SUM(dc.valor_doado), 0) as total_arrecadado,
          CASE
            WHEN c.meta_valor > 0 THEN ROUND((COALESCE(SUM(dc.valor_doado), 0) / c.meta_valor * 100), 2)
            ELSE 0
          END as percentual_meta
        FROM campanhas c
        LEFT JOIN doadores_campanhas dc ON c.id = dc.campanha_id AND dc.status = 'confirmada'
        GROUP BY c.id, c.nome, c.meta_valor, c.status
        ORDER BY total_arrecadado DESC
        LIMIT ${parseInt(limit)}`
      );

      return ranking;
    } finally {
      connection.release();
    }
  }

  // ================ VALIDAÇÕES ================

  async verificarDoadorJaContribuiu(doadorId, campanhaId) {
    const connection = await pool.getConnection();
    try {
      const [resultado] = await connection.execute(
        `SELECT COUNT(*) as total
         FROM doadores_campanhas
         WHERE doador_id = ? AND campanha_id = ? AND status = 'confirmada'`,
        [doadorId, campanhaId]
      );

      return resultado[0].total > 0;
    } finally {
      connection.release();
    }
  }

  async campanhaEstaAtiva(campanhaId) {
    const connection = await pool.getConnection();
    try {
      const [resultado] = await connection.execute(
        `SELECT
          CASE
            WHEN status = 'ativa' AND data_inicio <= CURDATE()
              AND (data_fim IS NULL OR data_fim >= CURDATE())
            THEN TRUE
            ELSE FALSE
          END as ativa
        FROM campanhas
        WHERE id = ?`,
        [campanhaId]
      );

      return resultado[0]?.ativa || false;
    } finally {
      connection.release();
    }
  }
}

module.exports = new CampanhaRepository();