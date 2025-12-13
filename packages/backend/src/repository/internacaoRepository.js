const db = require('../config/database');
const BaseRepository = require('../../../shared/repository/BaseRepository');

class InternacaoRepository extends BaseRepository {
  constructor() {
    super('internacoes', 'i');
  }
  // Helper method to map database fields to frontend camelCase
  mapToFrontend(row) {
    return {
      ...row,
      dataEntrada: row.data_entrada,
      dataSaida: row.data_saida,
      motivoSaida: row.motivo_saida,
      observacoesSaida: row.observacoes_saida,
      usuarioEntradaId: row.usuario_entrada_id,
      usuarioSaidaId: row.usuario_saida_id,
      // Remove snake_case fields
      data_entrada: undefined,
      data_saida: undefined,
      motivo_saida: undefined,
      observacoes_saida: undefined,
      usuario_entrada_id: undefined,
      usuario_saida_id: undefined
    };
  }

  // RF_F1 - Criar entrada (internação)
  async criarEntrada(data) {
    const { assistida_id, motivo, observacoes, usuario_id } = data;

    const query = `
      INSERT INTO internacoes (
        assistida_id,
        data_entrada,
        motivo,
        observacoes,
        status,
        usuario_entrada_id
      ) VALUES (?, NOW(), ?, ?, 'ativa', ?)
    `;

    const [result] = await db.query(query, [
      assistida_id,
      motivo || null,
      observacoes || null,
      usuario_id
    ]);
    await db.execute(
      `UPDATE assistidas SET status = 'Ativa' WHERE id = ?`,
      [assistida_id]
    );
    return this.findById(result.insertId);
  }

  // RF_F2 - Efetuar saída
  async efetuarSaida(data) {
    const { id, motivo_saida, observacoes_saida, usuario_saida_id, assistida_id } = data;

    const query = `
      UPDATE internacoes
      SET data_saida = NOW(),
          motivo_saida = ?,
          observacoes_saida = ?,
          status = 'finalizada',
          usuario_saida_id = ?
      WHERE id = ?
    `;

    await db.query(query, [motivo_saida || null, observacoes_saida || null, usuario_saida_id, id]);

    await db.execute(
      `UPDATE assistidas SET status = 'Inativa' WHERE id = ?`,
      [assistida_id]
    );


    return this.findById(id);
  }

  // Buscar internação por ID
  async findById(id) {
    const query = `
      SELECT
        i.*,
        a.nome as assistida_nome,
        a.cpf as assistida_cpf,
        u1.nome as usuario_entrada_nome,
        u2.nome as usuario_saida_nome
      FROM internacoes i
      LEFT JOIN assistidas a ON i.assistida_id = a.id
      LEFT JOIN usuarios u1 ON i.usuario_entrada_id = u1.id
      LEFT JOIN usuarios u2 ON i.usuario_saida_id = u2.id
      WHERE i.id = ?
    `;

    const [rows] = await db.query(query, [id]);
    const row = rows[0];

    if (!row) return null;

    // Mapear para estrutura esperada pelo frontend
    const mapped = this.mapToFrontend(row);
    return {
      ...mapped,
      assistida: {
        nome: row.assistida_nome,
        cpf: row.assistida_cpf
      },
      usuario_entrada: {
        nome: row.usuario_entrada_nome
      },
      usuario_saida: row.usuario_saida_nome ? {
        nome: row.usuario_saida_nome
      } : null,
      // Remover campos duplicados
      assistida_nome: undefined,
      assistida_cpf: undefined,
      usuario_entrada_nome: undefined,
      usuario_saida_nome: undefined
    };
  }

  // Buscar internação ativa por assistida
  async findAtivaByAssistida(assistida_id) {
    const query = `
      SELECT * FROM internacoes
      WHERE assistida_id = ? AND status = 'ativa'
      LIMIT 1
    `;

    const [rows] = await db.query(query, [assistida_id]);
    return rows[0];
  }

  // Listar todas as internações ativas
  async findAllAtivas() {
    const query = `
      SELECT
        i.*,
        a.nome as assistida_nome,
        a.cpf as assistida_cpf,
        TIMESTAMPDIFF(DAY, i.data_entrada, NOW()) as dias_internada,
        u.nome as usuario_entrada_nome
      FROM internacoes i
      LEFT JOIN assistidas a ON i.assistida_id = a.id
      LEFT JOIN usuarios u ON i.usuario_entrada_id = u.id
      WHERE i.status = 'ativa'
      ORDER BY i.data_entrada DESC
    `;

    const [rows] = await db.query(query);

    // Mapear para estrutura esperada pelo frontend
    return rows.map(row => {
      const mapped = this.mapToFrontend(row);
      return {
        ...mapped,
        assistida: {
          nome: row.assistida_nome,
          cpf: row.assistida_cpf
        },
        usuario_entrada: {
          nome: row.usuario_entrada_nome
        },
        // Remover campos duplicados
        assistida_nome: undefined,
        assistida_cpf: undefined,
        usuario_entrada_nome: undefined
      };
    });
  }

  // Buscar histórico de internações por assistida
  async findHistoricoByAssistida(assistida_id) {
    const query = `
      SELECT
        i.*,
        a.nome as assistida_nome,
        TIMESTAMPDIFF(DAY, i.data_entrada, COALESCE(i.data_saida, NOW())) as dias_internada,
        u1.nome as usuario_entrada_nome,
        u2.nome as usuario_saida_nome
      FROM internacoes i
      LEFT JOIN assistidas a ON i.assistida_id = a.id
      LEFT JOIN usuarios u1 ON i.usuario_entrada_id = u1.id
      LEFT JOIN usuarios u2 ON i.usuario_saida_id = u2.id
      WHERE i.assistida_id = ?
      ORDER BY i.data_entrada DESC
    `;

    const [rows] = await db.query(query, [assistida_id]);

    // Mapear para estrutura esperada pelo frontend
    return rows.map(row => {
      const mapped = this.mapToFrontend(row);
      return {
        ...mapped,
        assistida: {
          nome: row.assistida_nome
        },
        usuario_entrada: {
          nome: row.usuario_entrada_nome
        },
        usuario_saida: row.usuario_saida_nome ? {
          nome: row.usuario_saida_nome
        } : null,
        // Remover campos duplicados
        assistida_nome: undefined,
        usuario_entrada_nome: undefined,
        usuario_saida_nome: undefined
      };
    });
  }

  // Obter estatísticas de internações
  async getEstatisticas() {
    const queries = {
      totalAtivas: `
        SELECT COUNT(*) as total
        FROM internacoes
        WHERE status = 'ativa'
      `,
      totalMes: `
        SELECT COUNT(*) as total
        FROM internacoes
        WHERE MONTH(data_entrada) = MONTH(CURRENT_DATE())
        AND YEAR(data_entrada) = YEAR(CURRENT_DATE())
      `,
      mediaPermancia: `
        SELECT AVG(TIMESTAMPDIFF(DAY, data_entrada, COALESCE(data_saida, NOW()))) as media_dias
        FROM internacoes
        WHERE data_saida IS NOT NULL
      `,
      topMotivos: `
        SELECT motivo, COUNT(*) as total
        FROM internacoes
        WHERE motivo IS NOT NULL
        GROUP BY motivo
        ORDER BY total DESC
        LIMIT 5
      `
    };

    const [ativas] = await db.query(queries.totalAtivas);
    const [mes] = await db.query(queries.totalMes);
    const [media] = await db.query(queries.mediaPermancia);
    const [motivos] = await db.query(queries.topMotivos);

    return {
      totalAtivas: ativas[0].total,
      totalHistorico: await this.getTotalHistorico(),
      mediaPermanencia: Math.round(media[0].media_dias || 0),
      totalMesAtual: mes[0].total,
      topMotivos: motivos
    };
  }

  // Helper method to get total historic count
  async getTotalHistorico() {
    const query = `
      SELECT COUNT(*) as total
      FROM internacoes
    `;

    const [rows] = await db.query(query);
    return rows[0].total;
  }

  // Listar todas as internações (ativas e finalizadas)
  // Listar todas as internações (ativas e finalizadas)
  async findAll() {
    const query = `
    SELECT
      i.*,
      a.nome as assistida_nome,
      a.cpf as assistida_cpf,
      TIMESTAMPDIFF(DAY, i.data_entrada, COALESCE(i.data_saida, NOW())) as dias_internada,
      u1.nome as usuario_entrada_nome,
      u2.nome as usuario_saida_nome
    FROM internacoes i
    LEFT JOIN assistidas a ON i.assistida_id = a.id
    LEFT JOIN usuarios u1 ON i.usuario_entrada_id = u1.id
    LEFT JOIN usuarios u2 ON i.usuario_saida_id = u2.id
    ORDER BY i.data_entrada DESC
  `;

    const [rows] = await db.query(query);

    return rows.map(row => {
      const mapped = this.mapToFrontend(row);

      return {
        ...mapped,
        // 🔹 Incluindo dados da assistida
        assistida: {
          nome: row.assistida_nome,
          cpf: row.assistida_cpf
        },
        // 🔹 Usuário que realizou entrada
        usuario_entrada: {
          nome: row.usuario_entrada_nome
        },
        // 🔹 Usuário que realizou saída (se existir)
        usuario_saida: row.usuario_saida_nome
          ? { nome: row.usuario_saida_nome }
          : null,

        // 🔹 "modo_retorno" VEM DIRETO da tabela
        // mapped já mantém i.modo_retorno -> modoRetorno
        modoRetorno: row.modo_retorno === 1 || row.modo_retorno === true,

        // Removendo duplicados
        assistida_nome: undefined,
        assistida_cpf: undefined,
        usuario_entrada_nome: undefined,
        usuario_saida_nome: undefined
      };
    });
  }


  // No InternacaoRepository
  async updateEntrada(id, data) {
    const { data_entrada, motivo, observacoes, usuario_entrada_id } = data;

    const query = `
    UPDATE internacoes
    SET
      data_entrada = ?,
      motivo = ?,
      observacoes = ?,
      usuario_entrada_id = ?
    WHERE id = ?
  `;

    await db.query(query, [
      data_entrada || null,
      motivo || null,
      observacoes || null,
      usuario_entrada_id,
      id
    ]);

    return this.findById(id);
  }

  // Atualizar dados de saída da internação
  async updateSaida(id, data) {
    const {
      data_saida,
      motivo_saida,
      observacoes_saida,
      usuario_saida_id
    } = data;

    const query = `
    UPDATE internacoes
    SET
      data_saida = ?,
      motivo_saida = ?,
      observacoes_saida = ?,
      usuario_saida_id = ?,
      status = 'finalizada'
    WHERE id = ?
  `;

    await db.query(query, [
      data_saida || new Date(),
      motivo_saida || null,
      observacoes_saida || null,
      usuario_saida_id,
      id
    ]);

    return this.findById(id);
  }


  // RF_F3 - Registrar Retorno da Assistida
  async criarRetorno(data) {
    const { assistida_id, motivo, observacoes, usuario_id } = data;

    const query = `
    INSERT INTO internacoes (
      assistida_id,
      data_entrada,
      motivo,
      observacoes,
      status,
      usuario_entrada_id,
      modo_retorno
    ) VALUES (?, NOW(), ?, ?, 'ativa', ?, TRUE)
  `;

    const [result] = await db.query(query, [
      assistida_id,
      motivo || null,
      observacoes || null,
      usuario_id
    ]);

    await db.execute(
      `UPDATE assistidas SET status = 'Ativa' WHERE id = ?`,
      [assistida_id]
    );

    return this.findById(result.insertId);
  }




}

module.exports = InternacaoRepository;
