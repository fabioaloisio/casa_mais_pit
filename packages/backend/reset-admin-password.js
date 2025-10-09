const bcrypt = require('bcrypt');
const db = require('./src/config/database');

async function resetAdminPassword() {
  let connection;

  try {
    connection = await db.getConnection();
    console.log('🔗 Conectado ao banco de dados');

    const hashedPassword = await bcrypt.hash('123456', 10);

    await connection.execute(`
      UPDATE usuarios
      SET senha = ?
      WHERE email = 'fabioaloisio@gmail.com'
    `, [hashedPassword]);

    console.log('✅ Senha do admin resetada para: 123456');
    console.log('📧 Email: fabioaloisio@gmail.com');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    if (connection) {
      connection.release();
    }
    process.exit(0);
  }
}

resetAdminPassword();