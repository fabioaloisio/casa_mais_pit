const mysql = require('mysql2/promise');
const path = require('path');

// Carregar variáveis de ambiente do arquivo .env na raiz do projeto
// Procurar .env na raiz do projeto monorepo
const envPath = path.resolve(__dirname, '../../../../.env');
require('dotenv').config({ path: envPath });

/**
 * Classe Database - Implementação do Padrão Singleton (GoF)
 *
 * Garante uma única instância de conexão com o banco de dados
 * em toda a aplicação.
 */
class Database {
  // Variável estática privada para armazenar a instância única
  static #instance = null;

  // Pool de conexões MySQL
  #pool = null;

  // Configuração do banco de dados
  #config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '3511',
    database: process.env.DB_NAME || 'casamais_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
    queueLimit: 0
  };

  /**
   * Construtor privado - previne instanciação direta
   * @throws {Error} Se tentar instanciar diretamente quando já existe instância
   */
  constructor() {
    if (Database.#instance) {
      throw new Error(
        'Database já foi instanciado. Use Database.getInstance() para obter a instância.'
      );
    }
    this.#pool = mysql.createPool(this.#config);
  }

  /**
   * Método estático para obter a instância única (Lazy Initialization)
   * @returns {Database} A instância única do Database
   */
  static getInstance() {
    if (!Database.#instance) {
      Database.#instance = new Database();
    }
    return Database.#instance;
  }

  /**
   * Retorna o pool de conexões para uso direto
   * @returns {Pool} Pool de conexões MySQL
   */
  getPool() {
    return this.#pool;
  }

  /**
   * Executa uma query preparada (prepared statement)
   * @param {string} query - Query SQL
   * @param {Array} params - Parâmetros da query
   * @returns {Promise<Array>} Resultado da query
   */
  async execute(query, params = []) {
    return this.#pool.execute(query, params);
  }

  /**
   * Executa uma query simples
   * @param {string} query - Query SQL
   * @param {Array} params - Parâmetros da query
   * @returns {Promise<Array>} Resultado da query
   */
  async query(query, params = []) {
    return this.#pool.query(query, params);
  }

  /**
   * Obtém uma conexão do pool para transações
   * @returns {Promise<Connection>} Conexão do pool
   */
  async getConnection() {
    return this.#pool.getConnection();
  }

  /**
   * Testa a conexão com o banco de dados
   * @returns {Promise<boolean>} true se conectado, false caso contrário
   */
  async testConnection() {
    try {
      const connection = await this.#pool.getConnection();
      console.log('Conectado com sucesso ao banco de dados');
      connection.release();
      return true;
    } catch (error) {
      console.error('Erro ao conectar ao banco de dados MySQL:', error.message);
      return false;
    }
  }

  /**
   * Fecha todas as conexões do pool (para shutdown graceful)
   * @returns {Promise<void>}
   */
  async close() {
    if (this.#pool) {
      await this.#pool.end();
      console.log('Pool de conexões fechado');
    }
  }
}

// ============================================
// CAMADA DE COMPATIBILIDADE (BACKWARD COMPAT)
// ============================================

// Obter instância singleton
const instance = Database.getInstance();

// Proxy que permite usar como pool diretamente (compatibilidade)
// Isso permite que `db.execute()` e `db.query()` funcionem sem alterações
module.exports = {
  // Métodos delegados ao pool (compatibilidade com código existente)
  execute: (...args) => instance.execute(...args),
  query: (...args) => instance.query(...args),
  getConnection: () => instance.getConnection(),

  // Método testConnection existente
  testConnection: () => instance.testConnection(),

  // Expor a classe para uso do padrão Singleton
  Database: Database,

  // Método getInstance para acesso explícito ao Singleton
  getInstance: () => Database.getInstance()
};
