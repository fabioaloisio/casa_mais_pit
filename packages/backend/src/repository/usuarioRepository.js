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
}

module.exports = UsuarioRepository;