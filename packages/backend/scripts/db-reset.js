const db = require('../src/config/database');
const path = require('path');
const SQLExecutor = require('./utils/sql-executor');

async function resetDatabase() {
  let connection;
  
  try {
    connection = await db.getConnection();
    console.log('🔗 Conectado ao banco de dados');

    // Usar SQLExecutor para executar reset (apenas DROP)
    const sqlExecutor = new SQLExecutor(connection);
    const sqlFilePath = path.join(__dirname, 'sql', 'reset_tables.sql');
    
    console.log('\n🗑️ Removendo todas as tabelas...');
    await sqlExecutor.executeFile(sqlFilePath);

    console.log('\n✅ Reset completo realizado!');
    console.log('🎯 Todas as tabelas foram removidas');
    console.log('💡 Use db:create para recriar estrutura');
    console.log('💡 Use db:setup para criar + popular dados');

  } catch (error) {
    console.error('❌ Erro durante reset:', error.message);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

if (require.main === module) {
  console.log('🚀 Iniciando reset do banco...');
  resetDatabase()
    .then(() => {
      console.log('\n🎉 Script finalizado!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Falha:', error);
      process.exit(1);
    });
}

module.exports = resetDatabase;