const db = require('./src/config/database');

async function checkMariaHistory() {
  const connection = await db.getConnection();

  try {
    // Primeiro, encontrar ID da Maria
    const [users] = await connection.execute('SELECT id, nome, email FROM usuarios WHERE email = ?', ['maria.aprovada@casamais.org']);

    if (users.length > 0) {
      const mariaId = users[0].id;
      console.log('Maria Santos Aprovada ID:', mariaId);

      // Buscar histórico dela
      const [history] = await connection.execute(`
        SELECT h.*, u.nome as alterado_por_nome
        FROM usuarios_status_historico h
        LEFT JOIN usuarios u ON h.alterado_por = u.id
        WHERE h.usuario_id = ?
        ORDER BY h.data_alteracao DESC
      `, [mariaId]);

      console.log('\nHistórico de Maria Santos Aprovada:');
      history.forEach((record, i) => {
        console.log(`${i+1}. ID: ${record.id}`);
        console.log(`   Status: ${record.status_anterior} → ${record.status_novo}`);
        console.log(`   Motivo: ${record.motivo}`);
        console.log(`   Detalhes: ${JSON.stringify(record.detalhes)}`);
        console.log(`   Alterado por: ${record.alterado_por_nome}`);
        console.log(`   Data: ${record.data_alteracao}`);
        console.log('---');
      });
    } else {
      console.log('Maria Santos Aprovada não encontrada');
    }
  } catch (error) {
    console.error('Erro:', error.message);
  } finally {
    connection.release();
    process.exit(0);
  }
}

checkMariaHistory();