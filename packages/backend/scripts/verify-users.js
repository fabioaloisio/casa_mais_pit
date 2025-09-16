const db = require('../src/config/database');

async function verifyUsers() {
  try {
    console.log('🔍 Verificando usuários criados...');

    const connection = await db.getConnection();

    const [users] = await connection.execute(`
      SELECT nome, email, status, ativo,
             CASE ativo
               WHEN 1 THEN '✅ Pode Logar'
               ELSE '❌ Não Pode Logar'
             END as acesso
      FROM usuarios
      ORDER BY id
    `);

    console.log('\n📊 USUÁRIOS NO SISTEMA:');
    console.log('┌─────────────────────────┬──────────────────────────────┬───────────┬──────────────────┐');
    console.log('│ Nome                    │ Email                        │ Status    │ Acesso           │');
    console.log('├─────────────────────────┼──────────────────────────────┼───────────┼──────────────────┤');

    users.forEach(user => {
      const nome = user.nome.padEnd(23);
      const email = user.email.padEnd(28);
      const status = user.status.padEnd(9);
      const acesso = user.acesso.padEnd(16);
      console.log(`│ ${nome} │ ${email} │ ${status} │ ${acesso} │`);
    });

    console.log('└─────────────────────────┴──────────────────────────────┴───────────┴──────────────────┘');

    // Verificar se o histórico foi criado
    const [historico] = await connection.execute(`
      SELECT COUNT(*) as total FROM usuarios_status_historico
    `);

    console.log(`\n📜 Histórico de Status: ${historico[0].total} registros`);

    // Estatísticas por status
    const [stats] = await connection.execute(`
      SELECT status, COUNT(*) as total
      FROM usuarios
      GROUP BY status
      ORDER BY total DESC
    `);

    console.log('\n📈 ESTATÍSTICAS POR STATUS:');
    stats.forEach(stat => {
      const emoji = {
        'ativo': '🟢',
        'pendente': '🟡',
        'aprovado': '🔵',
        'rejeitado': '🔴',
        'bloqueado': '⚫',
        'suspenso': '🟠',
        'inativo': '⚪'
      }[stat.status] || '🔸';

      console.log(`${emoji} ${stat.status}: ${stat.total} usuário(s)`);
    });

    connection.release();

    console.log('\n✅ Verificação concluída!');

  } catch (error) {
    console.error('❌ Erro ao verificar usuários:', error.message);
  } finally {
    process.exit(0);
  }
}

verifyUsers();