const db = require('../src/config/database');
const path = require('path');
const SQLExecutor = require('./utils/sql-executor');

async function createDatabase() {
  let connection;
  
  try {
    console.log('📡 Conectando ao MySQL...');
    // Conectar ao MySQL sem especificar database
    const mysql = require('mysql2/promise');
    const tempConnection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 3306
    });
    
    // Criar banco se não existir
    await tempConnection.execute('CREATE DATABASE IF NOT EXISTS casamais_db');
    console.log('🏗️ Banco casamais_db criado/verificado');
    await tempConnection.end();
    
    // Conectar ao banco específico
    console.log('🔗 Conectando ao banco casamais_db...');
    connection = await db.getConnection();
    console.log('✅ Conectado ao banco de dados');

    // Usar SQLExecutor para executar arquivo SQL
    const sqlExecutor = new SQLExecutor(connection);
    const sqlFilePath = path.join(__dirname, 'sql', 'create_tables.sql');
    
    console.log('\n📋 Criando estrutura das tabelas...');
    await sqlExecutor.executeFile(sqlFilePath);

    // Mostrar estatísticas
    const tables = [
      'tipos_despesas', 'doadores', 'unidades_medida', 'assistidas', 
      'usuarios', 'despesas', 'doacoes', 'medicamentos', 'consultas',
      'internacoes', 'medicamentos_utilizados'
    ];
    
    await sqlExecutor.showTableStats(tables);
    await sqlExecutor.showForeignKeys();

    console.log('\n✅ Estrutura do banco criada com sucesso!');
    console.log('🎯 Use db:populate para adicionar dados de exemplo');

  } catch (error) {
    console.error('❌ Erro ao criar banco:', error.message);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

if (require.main === module) {
  console.log('🚀 Iniciando criação do banco de dados...');
  createDatabase()
    .then(() => {
      console.log('\n🎉 Script finalizado!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Falha:', error);
      process.exit(1);
    });
}

module.exports = createDatabase;