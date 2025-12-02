require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function createTestUser() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'casa_mais'
  });

  try {
    // Create test admin user
    const email = 'teste@casamais.com';
    const senha = 'senha123';
    const hashedPassword = await bcrypt.hash(senha, 10);

    // Check if user already exists
    const [existing] = await connection.execute(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      // Update existing user
      await connection.execute(
        'UPDATE usuarios SET senha = ?, nome = ?, nivel_acesso = ? WHERE email = ?',
        [hashedPassword, 'Administrador Teste', 'Administrador', email]
      );
      console.log('✅ Usuário de teste atualizado!');
    } else {
      // Insert new user
      await connection.execute(
        'INSERT INTO usuarios (email, senha, nome, nivel_acesso) VALUES (?, ?, ?, ?)',
        [email, hashedPassword, 'Administrador Teste', 'Administrador']
      );
      console.log('✅ Usuário de teste criado!');
    }

    console.log('\n📧 Email: teste@casamais.com');
    console.log('🔑 Senha: senha123');
    console.log('👤 Nível: Administrador\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await connection.end();
  }
}

createTestUser();