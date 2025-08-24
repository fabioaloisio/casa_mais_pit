import db from '../src/config/database.js';
import path from 'path';
import { fileURLToPath } from 'url';
import SQLExecutor from './utils/sql-executor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function populateDatabase() {
  let connection;
  
  try {
    connection = await db.getConnection();
    console.log('🔗 Conectado ao banco de dados');

    // Verificar se dados já existem
    const [tiposCount] = await connection.execute('SELECT COUNT(*) as total FROM tipos_despesas');
    const [doadoresCount] = await connection.execute('SELECT COUNT(*) as total FROM doadores');
    
    if (tiposCount[0].total > 0 || doadoresCount[0].total > 0) {
      console.log('\n⚠️ Dados já existem no banco!');
      console.log('💡 Use db:reset antes de popular novamente');
      
      // Mostrar estatísticas atuais
      const sqlExecutor = new SQLExecutor(connection);
      const tables = [
        'tipos_despesas', 'doadores', 'despesas', 'doacoes', 
        'unidades_medida', 'medicamentos', 'assistidas'
      ];
      await sqlExecutor.showTableStats(tables);
      return;
    }

    // Usar SQLExecutor para executar arquivo SQL de população
    const sqlExecutor = new SQLExecutor(connection);
    const sqlFilePath = path.join(__dirname, 'sql', 'populate_data.sql');
    
    console.log('\n🌱 Populando banco com dados de exemplo...');
    await sqlExecutor.executeFile(sqlFilePath);

    // Mostrar estatísticas finais
    console.log('\n📊 Dados inseridos:');
    const tables = [
      'tipos_despesas', 'doadores', 'despesas', 'doacoes', 
      'unidades_medida', 'medicamentos', 'assistidas'
    ];
    await sqlExecutor.showTableStats(tables);

    console.log('\n✅ Banco populado com sucesso!');
    console.log('🎯 Pronto para uso com dados de exemplo');

  } catch (error) {
    console.error('❌ Erro ao popular banco:', error.message);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🚀 Iniciando população do banco...');
  populateDatabase()
    .then(() => {
      console.log('\n🎉 Script finalizado!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Falha:', error);
      process.exit(1);
    });
}

export default populateDatabase;