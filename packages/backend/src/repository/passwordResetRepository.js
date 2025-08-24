const db = require('../config/database');

class PasswordResetRepository {
  async createResetToken(usuarioId, token, expiresAt) {
    try {
      const query = `
        INSERT INTO password_reset_tokens (usuario_id, token, expires_at)
        VALUES (?, ?, ?)
      `;
      
      const [result] = await db.execute(query, [usuarioId, token, expiresAt]);
      
      return {
        id: result.insertId,
        usuario_id: usuarioId,
        token,
        expires_at: expiresAt,
        used: false
      };
    } catch (error) {
      console.error('Erro ao criar token de reset:', error);
      throw error;
    }
  }

  async findValidToken(token) {
    try {
      const query = `
        SELECT prt.*, u.id as usuario_id, u.nome, u.email
        FROM password_reset_tokens prt
        INNER JOIN usuarios u ON prt.usuario_id = u.id
        WHERE prt.token = ? 
          AND prt.used = 0 
          AND prt.expires_at > NOW()
          AND u.ativo = 1
      `;
      
      const [rows] = await db.execute(query, [token]);
      
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Erro ao buscar token de reset:', error);
      throw error;
    }
  }

  async markTokenAsUsed(tokenId) {
    try {
      const query = `
        UPDATE password_reset_tokens 
        SET used = 1
        WHERE id = ?
      `;
      
      await db.execute(query, [tokenId]);
    } catch (error) {
      console.error('Erro ao marcar token como usado:', error);
      throw error;
    }
  }

  async invalidateUserTokens(usuarioId) {
    try {
      const query = `
        UPDATE password_reset_tokens 
        SET used = 1
        WHERE usuario_id = ? AND used = 0
      `;
      
      await db.execute(query, [usuarioId]);
    } catch (error) {
      console.error('Erro ao invalidar tokens do usuário:', error);
      throw error;
    }
  }

  async cleanExpiredTokens() {
    try {
      const query = `
        DELETE FROM password_reset_tokens 
        WHERE expires_at < NOW() OR used = 1
      `;
      
      const [result] = await db.execute(query);
      
      if (result.affectedRows > 0) {
        console.log(`🧹 Limpeza: ${result.affectedRows} tokens expirados/usados removidos`);
      }
      
      return result.affectedRows;
    } catch (error) {
      console.error('Erro ao limpar tokens expirados:', error);
      throw error;
    }
  }

  async countActiveTokensForUser(usuarioId) {
    try {
      const query = `
        SELECT COUNT(*) as count 
        FROM password_reset_tokens 
        WHERE usuario_id = ? 
          AND used = 0 
          AND expires_at > NOW()
      `;
      
      const [rows] = await db.execute(query, [usuarioId]);
      
      return rows[0].count;
    } catch (error) {
      console.error('Erro ao contar tokens ativos:', error);
      throw error;
    }
  }

  // Estatísticas para administradores
  async getResetStats(days = 7) {
    try {
      const query = `
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as total_requests,
          SUM(CASE WHEN used = 1 THEN 1 ELSE 0 END) as completed_resets,
          SUM(CASE WHEN expires_at < NOW() AND used = 0 THEN 1 ELSE 0 END) as expired_tokens
        FROM password_reset_tokens 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `;
      
      const [rows] = await db.execute(query, [days]);
      
      return rows;
    } catch (error) {
      console.error('Erro ao buscar estatísticas de reset:', error);
      throw error;
    }
  }
}

module.exports = PasswordResetRepository;