const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function createUsers() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'casamais_db'
  });

  try {
    // Create admin user
    const adminEmail = 'fabioaloisio@gmail.com';
    const adminSenha = '123456';
    const adminHashedPassword = await bcrypt.hash(adminSenha, 10);

    // Check if admin already exists
    const [existingAdmin] = await connection.execute(
      'SELECT id FROM usuarios WHERE email = ?',
      [adminEmail]
    );

    if (existingAdmin.length > 0) {
      // Update existing user
      await connection.execute(
        'UPDATE usuarios SET senha = ?, nome = ?, nivel_acesso = ? WHERE email = ?',
        [adminHashedPassword, 'Fábio Aloisio', 'Administrador', adminEmail]
      );
      console.log('✅ Usuário admin atualizado!');
    } else {
      // Insert new user
      await connection.execute(
        'INSERT INTO usuarios (email, senha, nome, nivel_acesso) VALUES (?, ?, ?, ?)',
        [adminEmail, adminHashedPassword, 'Fábio Aloisio', 'Administrador']
      );
      console.log('✅ Usuário admin criado!');
    }

    // Create Financeiro test user
    const emailFinanceiro = 'financeiro@casamais.org';
    const senhaFinanceiro = 'senha123';
    const hashedPasswordFinanceiro = await bcrypt.hash(senhaFinanceiro, 10);

    const [existingFinanceiro] = await connection.execute(
      'SELECT id FROM usuarios WHERE email = ?',
      [emailFinanceiro]
    );

    if (existingFinanceiro.length > 0) {
      await connection.execute(
        'UPDATE usuarios SET senha = ?, nome = ?, nivel_acesso = ? WHERE email = ?',
        [hashedPasswordFinanceiro, 'Usuário Financeiro', 'Financeiro', emailFinanceiro]
      );
      console.log('✅ Usuário financeiro atualizado!');
    } else {
      await connection.execute(
        'INSERT INTO usuarios (email, senha, nome, nivel_acesso) VALUES (?, ?, ?, ?)',
        [emailFinanceiro, hashedPasswordFinanceiro, 'Usuário Financeiro', 'Financeiro']
      );
      console.log('✅ Usuário financeiro criado!');
    }

    console.log('\n=== USUÁRIOS CRIADOS/ATUALIZADOS ===\n');
    console.log('👤 ADMINISTRADOR:');
    console.log('📧 Email: fabioaloisio@gmail.com');
    console.log('🔑 Senha: 123456');
    console.log('🎯 Nível: Administrador');

    console.log('\n👤 FINANCEIRO:');
    console.log('📧 Email: financeiro@casamais.org');
    console.log('🔑 Senha: senha123');
    console.log('🎯 Nível: Financeiro\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await connection.end();
  }
}

createUsers();