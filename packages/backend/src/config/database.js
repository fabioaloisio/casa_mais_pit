const mysql = require('mysql2/promise');

// Carregar variáveis de ambiente
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '3511', //admin
  database: process.env.DB_NAME || 'casamais_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Test connection function (call manually when needed)
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Conectado com sucesso ao banco de dados');
    connection.release();
    return true;
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados MySQL:', error.message);
    return false;
  }
}

module.exports = pool;
module.exports.testConnection = testConnection;