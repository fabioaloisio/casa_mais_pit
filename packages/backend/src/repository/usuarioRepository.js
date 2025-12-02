const db = require('../config/database');
const BaseRepository = require('../../../shared/repository/BaseRepository');
const Usuario = require('../models/usuario');

class UsuarioRepository extends BaseRepository {
  constructor() {
    super('usuarios', 'u');
  }
  async findByEmail(email) {
    try {
      // CORREÇÃO: Remover filtro por ativo, deixar AuthController decidir baseado no status
      const query = 'SELECT * FROM usuarios WHERE email = ?';
      const [rows] = await db.execute(query, [email]);

      if (rows.length === 0) {
        return null;
      }

      return new Usuario(rows[0]);
    } catch (error) {
      console.error('Erro ao buscar usuário por email:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      // CORREÇÃO: Remover filtro por ativo, usar apenas ID para permitir gerenciamento de todos os status
      const query = 'SELECT * FROM usuarios WHERE id = ?';
      const [rows] = await db.execute(query, [id]);

      if (rows.length === 0) {
        return null;
      }

      return new Usuario(rows[0]);
    } catch (error) {
      console.error('Erro ao buscar usuário por ID:', error);
      throw error;
    }
  }

  async create(usuario) {
    try {
      const query = `
        INSERT INTO usuarios (nome, email, senha, tipo, status, token_ativacao, aprovado_por, data_aprovacao)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        usuario.nome,
        usuario.email,
        usuario.senha,
        usuario.tipo || 'Colaborador',
        usuario.status || 'pendente',
        usuario.token_ativacao || null,
        usuario.aprovado_por || null,
        usuario.data_aprovacao || null
      ];

      console.log('💾 [DEBUG] Criando usuário com valores:', {
        nome: values[0],
        email: values[1],
        tipo: values[3],
        status: values[4],
        token_ativacao: values[5],
        aprovado_por: values[6],
        data_aprovacao: values[7]
      });

      const [result] = await db.execute(query, values);

      console.log('✅ [DEBUG] Usuário inserido com ID:', result.insertId);

      return await this.findById(result.insertId);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  }

  async emailExists(email) {
    try {
      const query = 'SELECT COUNT(*) as count FROM usuarios WHERE email = ?';
      const [rows] = await db.execute(query, [email]);

      return rows[0].count > 0;
    } catch (error) {
      console.error('Erro ao verificar se email existe:', error);
      throw error;
    }
  }

  async emailExistsActive(email) {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM usuarios
        WHERE email = ?
        AND status != 'inativo'
      `;
      const [rows] = await db.execute(query, [email]);

      return rows[0].count > 0;
    } catch (error) {
      console.error('Erro ao verificar se email existe (ativo):', error);
      throw error;
    }
  }

  async findInactiveUserByEmail(email) {
    try {
      const query = `
        SELECT *
        FROM usuarios
        WHERE email = ?
        AND status = 'inativo'
      `;
      const [rows] = await db.execute(query, [email]);

      return rows.length > 0 ? new Usuario(rows[0]) : null;
    } catch (error) {
      console.error('Erro ao buscar usuário inativo por email:', error);
      throw error;
    }
  }

  async getAllActive() {
    try {
      // CORREÇÃO: Buscar usuários por status ao invés de campo ativo
      const query = 'SELECT * FROM usuarios WHERE status IN ("ativo", "pendente", "aprovado") ORDER BY nome';
      const [rows] = await db.execute(query);

      return rows.map(row => new Usuario(row));
    } catch (error) {
      console.error('Erro ao buscar usuários ativos:', error);
      throw error;
    }
  }

  async update(id, dadosAtualizacao) {
    try {
      const campos = [];
      const valores = [];

      // Construir query dinamicamente baseado nos campos fornecidos
      Object.keys(dadosAtualizacao).forEach(campo => {
        campos.push(`${campo} = ?`);
        valores.push(dadosAtualizacao[campo]);
      });

      // Adicionar data de atualização
      campos.push('data_atualizacao = NOW()');
      valores.push(id);

      const query = `UPDATE usuarios SET ${campos.join(', ')} WHERE id = ?`;
      
      await db.execute(query, valores);
      
      return await this.findById(id);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  }

  async softDelete(id, excluídoPor = null) {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      // Buscar status anterior para o histórico
      const [usuario] = await connection.execute(
        'SELECT status FROM usuarios WHERE id = ?',
        [id]
      );

      if (usuario.length === 0) {
        throw new Error('Usuário não encontrado');
      }

      const statusAnterior = usuario[0].status;

      // Atualizar usuário para inativo
      const updateQuery = `
        UPDATE usuarios
        SET status = 'inativo',
            ativo = 0,
            data_atualizacao = NOW()
        WHERE id = ?
      `;

      const [result] = await connection.execute(updateQuery, [id]);

      // Registrar no histórico
      const historicoQuery = `
        INSERT INTO usuarios_status_historico
        (usuario_id, status_anterior, status_novo, alterado_por, motivo)
        VALUES (?, ?, 'inativo', ?, 'Usuário excluído (soft delete)')
      `;

      await connection.execute(historicoQuery, [id, statusAnterior, excluídoPor]);

      await connection.commit();

      return result.affectedRows;
    } catch (error) {
      await connection.rollback();
      console.error('Erro ao desativar usuário:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  async updateStatus(id, ativo) {
    try {
      const query = 'UPDATE usuarios SET ativo = ?, data_atualizacao = NOW() WHERE id = ?';
      await db.execute(query, [ativo ? 1 : 0, id]);
    } catch (error) {
      console.error('Erro ao atualizar status do usuário:', error);
      throw error;
    }
  }

  async emailExistsExceptId(email, userId) {
    try {
      const query = 'SELECT COUNT(*) as count FROM usuarios WHERE email = ? AND id != ?';
      const [rows] = await db.execute(query, [email, userId]);
      
      return rows[0].count > 0;
    } catch (error) {
      console.error('Erro ao verificar se email existe:', error);
      throw error;
    }
  }

  async isFirstUser() {
    try {
      const query = 'SELECT COUNT(*) as count FROM usuarios WHERE ativo = 1';
      const [rows] = await db.execute(query);
      
      return rows[0].count === 0;
    } catch (error) {
      console.error('Erro ao verificar primeiro usuário:', error);
      throw error;
    }
  }

  async findByStatus(status) {
    try {
      const query = 'SELECT * FROM usuarios WHERE status = ? AND ativo = 1 ORDER BY data_cadastro DESC';
      const [rows] = await db.execute(query, [status]);
      
      return rows.map(row => new Usuario(row));
    } catch (error) {
      console.error('Erro ao buscar usuários por status:', error);
      throw error;
    }
  }

  async findByActivationToken(token) {
    try {
      console.log('🔍 [DEBUG] Buscando usuário por token:', token);

      // CORREÇÃO: Buscar por token sem filtro de ativo, verificar status = 'aprovado'
      const query = 'SELECT * FROM usuarios WHERE token_ativacao = ? AND status = "aprovado"';
      const [rows] = await db.execute(query, [token]);

      console.log('🔍 [DEBUG] Resultados encontrados:', rows.length);
      if (rows.length > 0) {
        console.log('🔍 [DEBUG] Primeiro resultado - ID:', rows[0].id, 'Status:', rows[0].status, 'Token:', rows[0].token_ativacao);
      }

      if (rows.length === 0) {
        console.log('❌ [DEBUG] Nenhum usuário encontrado com token:', token);
        return null;
      }

      return new Usuario(rows[0]);
    } catch (error) {
      console.error('Erro ao buscar usuário por token:', error);
      throw error;
    }
  }

  async updateApprovalStatus(id, status, token, approvedBy) {
    try {
      const query = `
        UPDATE usuarios 
        SET status = ?, 
            token_ativacao = ?, 
            aprovado_por = ?,
            data_aprovacao = NOW(),
            data_atualizacao = NOW()
        WHERE id = ?
      `;
      
      await db.execute(query, [status, token, approvedBy, id]);
    } catch (error) {
      console.error('Erro ao atualizar status de aprovação:', error);
      throw error;
    }
  }

  async activateAccount(id, senhaHash) {
    try {
      const query = `
        UPDATE usuarios 
        SET status = 'ativo',
            senha = ?,
            token_ativacao = NULL,
            data_ativacao = NOW(),
            data_atualizacao = NOW()
        WHERE id = ?
      `;
      
      await db.execute(query, [senhaHash, id]);
    } catch (error) {
      console.error('Erro ao ativar conta:', error);
      throw error;
    }
  }

  async logApprovalAction(usuarioId, acao, executadoPor, observacoes = null) {
    try {
      const query = `
        INSERT INTO usuarios_aprovacoes_log 
        (usuario_id, acao, executado_por, observacoes)
        VALUES (?, ?, ?, ?)
      `;
      
      await db.execute(query, [usuarioId, acao, executadoPor, observacoes]);
    } catch (error) {
      console.error('Erro ao registrar log de aprovação:', error);
      throw error;
    }
  }

  async getAllAdmins() {
    try {
      const query = `
        SELECT * FROM usuarios
        WHERE tipo = 'Administrador'
        AND status = 'ativo'
        AND ativo = 1
      `;
      const [rows] = await db.execute(query);

      return rows.map(row => new Usuario(row));
    } catch (error) {
      console.error('Erro ao buscar administradores:', error);
      throw error;
    }
  }

  // Novos métodos para gerenciamento de status
  async updateUserStatus(id, novoStatus, executadoPor, observacoes = null) {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      // Buscar status atual
      const [usuario] = await connection.execute(
        'SELECT status FROM usuarios WHERE id = ?',
        [id]
      );

      if (usuario.length === 0) {
        throw new Error('Usuário não encontrado');
      }

      const statusAnterior = usuario[0].status;

      // Atualizar status do usuário
      const updateQuery = `
        UPDATE usuarios
        SET status = ?,
            data_atualizacao = NOW()
        WHERE id = ?
      `;

      await connection.execute(updateQuery, [novoStatus, id]);

      // Registrar no histórico
      const historicoQuery = `
        INSERT INTO usuarios_status_historico
        (usuario_id, status_anterior, status_novo, alterado_por, motivo)
        VALUES (?, ?, ?, ?, ?)
      `;

      await connection.execute(historicoQuery, [
        id,
        statusAnterior,
        novoStatus,
        executadoPor,
        observacoes
      ]);

      await connection.commit();

      return await this.findById(id);
    } catch (error) {
      await connection.rollback();
      console.error('Erro ao atualizar status do usuário:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  async blockUser(id, motivo, bloqueadoPor) {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      // Atualizar usuário
      const updateQuery = `
        UPDATE usuarios
        SET status = 'bloqueado',
            ativo = 0,
            data_bloqueio = NOW(),
            motivo_bloqueio = ?,
            bloqueado_por = ?,
            data_atualizacao = NOW()
        WHERE id = ?
      `;

      await connection.execute(updateQuery, [motivo, bloqueadoPor, id]);

      // Registrar no histórico
      await connection.execute(
        `INSERT INTO usuarios_status_historico
         (usuario_id, status_anterior, status_novo, alterado_por, motivo)
         SELECT id, status, 'bloqueado', ?, ? FROM usuarios WHERE id = ?`,
        [bloqueadoPor, motivo, id]
      );

      await connection.commit();

      return await this.findById(id);
    } catch (error) {
      await connection.rollback();
      console.error('Erro ao bloquear usuário:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  async suspendUser(id, dataFim, motivo, suspensoPor) {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      // Atualizar usuário
      const updateQuery = `
        UPDATE usuarios
        SET status = 'suspenso',
            ativo = 0,
            data_suspensao = NOW(),
            data_fim_suspensao = ?,
            motivo_suspensao = ?,
            suspenso_por = ?,
            data_atualizacao = NOW()
        WHERE id = ?
      `;

      await connection.execute(updateQuery, [
        dataFim,
        motivo,
        suspensoPor,
        id
      ]);

      // Registrar no histórico
      await connection.execute(
        `INSERT INTO usuarios_status_historico
         (usuario_id, status_anterior, status_novo, alterado_por, motivo, detalhes)
         SELECT id, status, 'suspenso', ?, ?, ? FROM usuarios WHERE id = ?`,
        [suspensoPor, motivo, JSON.stringify({ data_fim: dataFim }), id]
      );

      await connection.commit();

      return await this.findById(id);
    } catch (error) {
      await connection.rollback();
      console.error('Erro ao suspender usuário:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  async unblockUser(id, desbloqueadoPor) {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      // Atualizar usuário
      const updateQuery = `
        UPDATE usuarios
        SET status = 'ativo',
            ativo = 1,
            data_bloqueio = NULL,
            motivo_bloqueio = NULL,
            bloqueado_por = NULL,
            data_atualizacao = NOW()
        WHERE id = ?
      `;

      await connection.execute(updateQuery, [id]);

      // Registrar no histórico
      await connection.execute(
        `INSERT INTO usuarios_status_historico
         (usuario_id, status_anterior, status_novo, alterado_por, motivo)
         VALUES (?, 'bloqueado', 'ativo', ?, 'Usuário desbloqueado')`,
        [id, desbloqueadoPor]
      );

      await connection.commit();

      return await this.findById(id);
    } catch (error) {
      await connection.rollback();
      console.error('Erro ao desbloquear usuário:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  async reactivateUser(id, reativadoPor) {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      // Atualizar usuário
      const updateQuery = `
        UPDATE usuarios
        SET status = 'ativo',
            ativo = 1,
            data_suspensao = NULL,
            data_fim_suspensao = NULL,
            motivo_suspensao = NULL,
            suspenso_por = NULL,
            data_atualizacao = NOW()
        WHERE id = ?
      `;

      await connection.execute(updateQuery, [id]);

      // Registrar no histórico
      await connection.execute(
        `INSERT INTO usuarios_status_historico
         (usuario_id, status_anterior, status_novo, alterado_por, motivo)
         SELECT id, status, 'ativo', ?, 'Usuário reativado' FROM usuarios WHERE id = ?`,
        [reativadoPor, id]
      );

      await connection.commit();

      return await this.findById(id);
    } catch (error) {
      await connection.rollback();
      console.error('Erro ao reativar usuário:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  async getStatusHistory(usuarioId, limit = 10) {
    try {
      // Buscar histórico de status do usuário
      const query = `
        SELECT
          h.*,
          u.nome as alterado_por_nome
        FROM usuarios_status_historico h
        LEFT JOIN usuarios u ON h.alterado_por = u.id
        WHERE h.usuario_id = ?
        ORDER BY h.data_alteracao DESC
        LIMIT ?
      `;

      const [rows] = await db.query(query, [usuarioId, limit]);

      return rows.map(row => ({
        ...row,
        // Corrigir: usar 'detalhes' (campo JSON) ao invés de 'observacoes' (que não existe)
        detalhes: row.detalhes && typeof row.detalhes === 'string' ? JSON.parse(row.detalhes) : row.detalhes,
        // Manter compatibilidade: mapear 'motivo' para 'observacoes' para o frontend
        observacoes: row.motivo
      }));
    } catch (error) {
      console.error('Erro ao buscar histórico de status:', error);
      throw error;
    }
  }

  async findInactiveUsers(diasInativo = 90) {
    try {
      const query = `
        SELECT * FROM usuarios
        WHERE status = 'ativo'
        AND ativo = 1
        AND (
          data_ultimo_acesso IS NULL
          OR data_ultimo_acesso < DATE_SUB(NOW(), INTERVAL ? DAY)
        )
        ORDER BY data_ultimo_acesso ASC
      `;

      const [rows] = await db.execute(query, [diasInativo]);

      return rows.map(row => new Usuario(row));
    } catch (error) {
      console.error('Erro ao buscar usuários inativos:', error);
      throw error;
    }
  }

  async findSuspendedToReactivate() {
    try {
      const query = `
        SELECT * FROM usuarios
        WHERE status = 'suspenso'
        AND data_fim_suspensao IS NOT NULL
        AND data_fim_suspensao <= NOW()
        ORDER BY data_fim_suspensao ASC
      `;

      const [rows] = await db.execute(query);

      return rows.map(row => new Usuario(row));
    } catch (error) {
      console.error('Erro ao buscar usuários para reativar:', error);
      throw error;
    }
  }

  async updateLastAccess(id) {
    try {
      const query = 'UPDATE usuarios SET data_ultimo_acesso = NOW() WHERE id = ?';
      await db.execute(query, [id]);
    } catch (error) {
      console.error('Erro ao atualizar último acesso:', error);
      throw error;
    }
  }

  async getAllWithStatusDetails() {
    try {
      const query = `
        SELECT
          u.*,
          aprovador.nome as aprovado_por_nome,
          bloqueador.nome as bloqueado_por_nome,
          suspensor.nome as suspenso_por_nome
        FROM usuarios u
        LEFT JOIN usuarios aprovador ON u.aprovado_por = aprovador.id
        LEFT JOIN usuarios bloqueador ON u.bloqueado_por = bloqueador.id
        LEFT JOIN usuarios suspensor ON u.suspenso_por = suspensor.id
        WHERE u.status != 'inativo'
        ORDER BY u.data_cadastro DESC
      `;

      const [rows] = await db.execute(query);

      return rows.map(row => {
        const usuario = new Usuario(row);
        // Adicionar propriedades extras diretamente à instância
        usuario.aprovado_por_nome = row.aprovado_por_nome;
        usuario.bloqueado_por_nome = row.bloqueado_por_nome;
        usuario.suspenso_por_nome = row.suspenso_por_nome;
        return usuario;
      });
    } catch (error) {
      console.error('Erro ao buscar usuários com detalhes:', error);
      throw error;
    }
  }
}

module.exports = UsuarioRepository;