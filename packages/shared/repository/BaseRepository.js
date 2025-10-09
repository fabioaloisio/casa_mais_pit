const db = require('../../backend/src/config/database');

class BaseRepository {
  constructor(tableName, tableAlias = null) {
    this.tableName = tableName;
    this.tableAlias = tableAlias || tableName.charAt(0);
    this.db = db;
  }

  // Métodos básicos de CRUD

  async findAll(conditions = {}, options = {}) {
    let query = `SELECT * FROM ${this.tableName}`;
    const params = [];
    
    // Adicionar condições WHERE
    const whereConditions = this.buildWhereClause(conditions, params);
    if (whereConditions) {
      query += ` WHERE ${whereConditions}`;
    }
    
    // Adicionar ordenação
    if (options.orderBy) {
      query += ` ORDER BY ${options.orderBy}`;
    }
    
    // Adicionar limite
    if (options.limit) {
      query += ` LIMIT ?`;
      params.push(parseInt(options.limit));
    }
    
    const [rows] = await this.db.query(query, params);
    return rows;
  }

  async findById(id) {
    const query = `SELECT * FROM ${this.tableName} WHERE id = ? LIMIT 1`;
    const [rows] = await this.db.query(query, [id]);
    return rows[0];
  }

  async create(data) {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const placeholders = fields.map(() => '?').join(', ');
    
    const query = `
      INSERT INTO ${this.tableName} (${fields.join(', ')}) 
      VALUES (${placeholders})
    `;
    
    const [result] = await this.db.query(query, values);
    return this.findById(result.insertId);
  }

  async update(id, data) {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    
    const query = `
      UPDATE ${this.tableName} 
      SET ${setClause} 
      WHERE id = ?
    `;
    
    values.push(id);
    await this.db.query(query, values);
    return this.findById(id);
  }

  async delete(id) {
    const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
    const [result] = await this.db.query(query, [id]);
    return result.affectedRows > 0;
  }

  async softDelete(id, fieldName = 'deleted_at') {
    const query = `UPDATE ${this.tableName} SET ${fieldName} = NOW() WHERE id = ?`;
    const [result] = await this.db.query(query, [id]);
    return result.affectedRows > 0;
  }

  // Métodos utilitários

  async count(conditions = {}) {
    let query = `SELECT COUNT(*) as total FROM ${this.tableName}`;
    const params = [];
    
    const whereConditions = this.buildWhereClause(conditions, params);
    if (whereConditions) {
      query += ` WHERE ${whereConditions}`;
    }
    
    const [rows] = await this.db.query(query, params);
    return rows[0].total;
  }

  async exists(conditions) {
    const count = await this.count(conditions);
    return count > 0;
  }

  async findOne(conditions) {
    const results = await this.findAll(conditions, { limit: 1 });
    return results[0];
  }

  async executeQuery(query, params = []) {
    const [rows] = await this.db.query(query, params);
    return rows;
  }

  async executeUpdate(query, params = []) {
    const [result] = await this.db.query(query, params);
    return result;
  }

  // Helpers

  buildWhereClause(conditions, params) {
    const clauses = [];
    
    for (const [field, value] of Object.entries(conditions)) {
      if (value === null) {
        clauses.push(`${field} IS NULL`);
      } else if (Array.isArray(value)) {
        const placeholders = value.map(() => '?').join(', ');
        clauses.push(`${field} IN (${placeholders})`);
        params.push(...value);
      } else if (typeof value === 'object' && value.operator) {
        // Suporte para operadores customizados
        clauses.push(`${field} ${value.operator} ?`);
        params.push(value.value);
      } else {
        clauses.push(`${field} = ?`);
        params.push(value);
      }
    }
    
    return clauses.length > 0 ? clauses.join(' AND ') : null;
  }

  // Métodos para transações

  async beginTransaction() {
    await this.db.beginTransaction();
  }

  async commit() {
    await this.db.commit();
  }

  async rollback() {
    await this.db.rollback();
  }

  async transaction(callback) {
    try {
      await this.beginTransaction();
      const result = await callback();
      await this.commit();
      return result;
    } catch (error) {
      await this.rollback();
      throw error;
    }
  }
}

module.exports = BaseRepository;