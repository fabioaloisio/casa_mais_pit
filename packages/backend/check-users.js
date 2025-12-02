const bcrypt = require('bcrypt');
const db = require('./src/config/database');

async function checkAndCreateUsers() {
  let connection;

  try {
    connection = await db.getConnection();
    console.log('🔗 Conectado ao banco de dados');

    // Verificar usuários existentes
    const [users] = await connection.execute('SELECT id, nome, email, status, ativo FROM usuarios ORDER BY id');

    console.log('\n👥 USUÁRIOS EXISTENTES:');
    users.forEach(user => {
      console.log(`   ID: ${user.id} | ${user.nome} | ${user.email} | Status: ${user.status} | Ativo: ${user.ativo}`);
    });

    // Verificar se existe admin ativo
    const [admins] = await connection.execute(
      'SELECT * FROM usuarios WHERE tipo = "Administrador" AND status = "ativo" AND ativo = 1'
    );

    if (admins.length === 0) {
      console.log('\n🆕 Criando admin de teste...');
      const hashedPassword = await bcrypt.hash('123456', 10);

      await connection.execute(`
        INSERT INTO usuarios (nome, email, senha, tipo, status, ativo, data_cadastro)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
      `, [
        'Admin Test',
        'admin@test.com',
        hashedPassword,
        'Administrador',
        'ativo',
        1
      ]);

      console.log('✅ Admin criado: admin@test.com / senha: 123456');
    } else {
      console.log('\n✅ Admin ativo já existe:', admins[0].email);
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    if (connection) {
      connection.release();
    }
    process.exit(0);
  }
}

checkAndCreateUsers();