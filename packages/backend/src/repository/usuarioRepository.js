const db = require('../config/database');
const Usuario = require('../models/usuario');

class UsuarioRepository {
  async findByEmail(email) {
    try {
      const query = 'SELECT * FROM usuarios WHERE email = ? AND ativo = 1';
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
      const query = 'SELECT * FROM usuarios WHERE id = ? AND ativo = 1';
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
        INSERT INTO usuarios (nome, email, senha, tipo)
        VALUES (?, ?, ?, ?)
      `;
      
      const [result] = await db.execute(query, [
        usuario.nome,
        usuario.email,
        usuario.senha,
        usuario.tipo || 'usuario'
      ]);
      
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

  async getAllActive() {
    try {
      const query = 'SELECT * FROM usuarios WHERE ativo = 1 ORDER BY nome';
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

  async softDelete(id) {
    try {
      const query = 'UPDATE usuarios SET ativo = 0, data_atualizacao = NOW() WHERE id = ?';
      await db.execute(query, [id]);
    } catch (error) {
      console.error('Erro ao desativar usuário:', error);
      throw error;
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
}

module.exports = UsuarioRepository;