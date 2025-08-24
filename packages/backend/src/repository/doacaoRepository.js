const pool = require('../config/database');
const Doacao = require('../models/doacao');

class DoacaoRepository {
  // Criar nova doação
  async criar(doacaoData) {
    const doacao = new Doacao(doacaoData);
    const dadosMySQL = doacao.paraMySQL();
    
    const query = `
      INSERT INTO doacoes (
        doador_id, valor, data_doacao, observacoes, data_cadastro
      ) VALUES (?, ?, ?, ?, ?)
    `;
    
    const valores = [
      dadosMySQL.doador_id,
      dadosMySQL.valor,
      dadosMySQL.data_doacao,
      dadosMySQL.observacoes,
      dadosMySQL.data_cadastro
    ];
    
    const [resultado] = await pool.execute(query, valores);
    return resultado.insertId;
  }

  // Buscar todas as doações com filtros opcionais
  async buscarTodos(filtros = {}) {
    let query = `
      SELECT 
        d.*,
        dr.nome as doador_nome,
        dr.documento as doador_documento,
        dr.tipo_doador as doador_tipo_doador,
        dr.email as doador_email,
        dr.telefone as doador_telefone,
        dr.ativo as doador_ativo
      FROM doacoes d
      INNER JOIN doadores dr ON d.doador_id = dr.id
      WHERE 1=1
    `;
    const valores = [];
    
    // Filtro por tipo de doador
    if (filtros.tipoDoador) {
      query += ' AND dr.tipo_doador = ?';
      valores.push(filtros.tipoDoador);
    }
    
    // Filtro por nome do doador
    if (filtros.nomeDoador) {
      query += ' AND dr.nome LIKE ?';
      valores.push(`%${filtros.nomeDoador}%`);
    }
    
    // Filtro por documento
    if (filtros.documento) {
      query += ' AND dr.documento = ?';
      valores.push(filtros.documento.replace(/\D/g, ''));
    }
    
    // Filtro por doador ID
    if (filtros.doadorId) {
      query += ' AND d.doador_id = ?';
      valores.push(filtros.doadorId);
    }
    
    // Filtro por período
    if (filtros.dataInicio) {
      query += ' AND d.data_doacao >= ?';
      valores.push(filtros.dataInicio);
    }
    
    if (filtros.dataFim) {
      query += ' AND d.data_doacao <= ?';
      valores.push(filtros.dataFim);
    }
    
    // Ordenação
    query += ' ORDER BY d.data_doacao DESC, d.id DESC';
    
    const [rows] = await pool.execute(query, valores);
    return rows.map(row => Doacao.fromDatabase(row));
  }

  // Buscar doação por ID
  async buscarPorId(id) {
    const query = `
      SELECT 
        d.*,
        dr.nome as doador_nome,
        dr.documento as doador_documento,
        dr.tipo_doador as doador_tipo_doador,
        dr.email as doador_email,
        dr.telefone as doador_telefone,
        dr.ativo as doador_ativo
      FROM doacoes d
      INNER JOIN doadores dr ON d.doador_id = dr.id
      WHERE d.id = ?
    `;
    const [rows] = await pool.execute(query, [id]);
    
    if (rows.length === 0) {
      return null;
    }
    
    return Doacao.fromDatabase(rows[0]);
  }

  // Buscar doações por doador ID
  async buscarPorDoador(doadorId) {
    const query = `
      SELECT 
        d.*,
        dr.nome as doador_nome,
        dr.documento as doador_documento,
        dr.tipo_doador as doador_tipo_doador,
        dr.email as doador_email,
        dr.telefone as doador_telefone,
        dr.ativo as doador_ativo
      FROM doacoes d
      INNER JOIN doadores dr ON d.doador_id = dr.id
      WHERE d.doador_id = ?
      ORDER BY d.data_doacao DESC
    `;
    
    const [rows] = await pool.execute(query, [doadorId]);
    return rows.map(row => Doacao.fromDatabase(row));
  }

  // Atualizar doação
  async atualizar(id, doacaoData) {
    const doacao = new Doacao({ ...doacaoData, id });
    const dadosMySQL = doacao.paraMySQL();
    
    const query = `
      UPDATE doacoes SET
        doador_id = ?,
        valor = ?,
        data_doacao = ?,
        observacoes = ?,
        data_atualizacao = NOW()
      WHERE id = ?
    `;
    
    const valores = [
      dadosMySQL.doador_id,
      dadosMySQL.valor,
      dadosMySQL.data_doacao,
      dadosMySQL.observacoes,
      id
    ];
    
    const [resultado] = await pool.execute(query, valores);
    return resultado.affectedRows > 0;
  }

  // Excluir doação
  async excluir(id) {
    const query = 'DELETE FROM doacoes WHERE id = ?';
    const [resultado] = await pool.execute(query, [id]);
    return resultado.affectedRows > 0;
  }

  // Obter estatísticas
  async obterEstatisticas(filtros = {}) {
    let queryBase = 'FROM doacoes d INNER JOIN doadores dr ON d.doador_id = dr.id WHERE 1=1';
    const valores = [];
    
    // Aplicar filtros de período
    if (filtros.dataInicio) {
      queryBase += ' AND d.data_doacao >= ?';
      valores.push(filtros.dataInicio);
    }
    
    if (filtros.dataFim) {
      queryBase += ' AND d.data_doacao <= ?';
      valores.push(filtros.dataFim);
    }
    
    // Total de doações
    const [totalRows] = await pool.execute(
      `SELECT COUNT(*) as total ${queryBase}`,
      valores
    );
    
    // Soma dos valores
    const [somaRows] = await pool.execute(
      `SELECT COALESCE(SUM(d.valor), 0) as soma ${queryBase}`,
      valores
    );
    
    // Doações por tipo
    const [tipoRows] = await pool.execute(
      `SELECT dr.tipo_doador, COUNT(*) as quantidade, COALESCE(SUM(d.valor), 0) as total 
       ${queryBase} 
       GROUP BY dr.tipo_doador`,
      valores
    );
    
    // Última doação
    const [ultimaRows] = await pool.execute(
      `SELECT 
        d.*,
        dr.nome as doador_nome,
        dr.documento as doador_documento,
        dr.tipo_doador as doador_tipo_doador,
        dr.email as doador_email,
        dr.telefone as doador_telefone,
        dr.ativo as doador_ativo
       ${queryBase} 
       ORDER BY d.data_doacao DESC, d.id DESC 
       LIMIT 1`,
      valores
    );
    
    return {
      totalDoacoes: totalRows[0].total,
      valorTotal: parseFloat(somaRows[0].soma),
      doacoesPorTipo: tipoRows,
      ultimaDoacao: ultimaRows.length > 0 ? Doacao.fromDatabase(ultimaRows[0]) : null
    };
  }

  // Verificar se doação existe
  async existe(id) {
    const query = 'SELECT COUNT(*) as total FROM doacoes WHERE id = ?';
    const [rows] = await pool.execute(query, [id]);
    return rows[0].total > 0;
  }
}

module.exports = new DoacaoRepository();