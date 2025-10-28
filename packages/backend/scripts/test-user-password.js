require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

/**
 * Script para testar se as senhas estão sendo armazenadas corretamente
 * ao criar novos usuários
 */

async function testUserPassword() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '3511',
    database: process.env.DB_NAME || 'casamais_db'
  });

  try {
    console.log('\n🔍 TESTE DE ARMAZENAMENTO DE SENHA\n');

    // Email de teste
    const emailTeste = 'teste_senha_' + Date.now() + '@casamais.com';
    const senhaTeste = 'senha123';
    const senhaHash = await bcrypt.hash(senhaTeste, 10);

    console.log('📝 Criando usuário de teste...');
    console.log('   Email:', emailTeste);
    console.log('   Senha:', senhaTeste);
    console.log('   Hash:', senhaHash.substring(0, 20) + '...');

    // Inserir usuário
    await connection.execute(
      'INSERT INTO usuarios (nome, email, senha, tipo, status) VALUES (?, ?, ?, ?, ?)',
      ['Teste Senha', emailTeste, senhaHash, 'Colaborador', 'ativo']
    );

    console.log('✅ Usuário criado com sucesso!\n');

    // Buscar usuário criado
    const [rows] = await connection.execute(
      'SELECT id, nome, email, senha, tipo, status FROM usuarios WHERE email = ?',
      [emailTeste]
    );

    if (rows.length === 0) {
      console.log('❌ ERRO: Usuário não encontrado no banco de dados!');
      return;
    }

    const usuario = rows[0];
    console.log('📋 Dados do usuário no banco:');
    console.log('   ID:', usuario.id);
    console.log('   Nome:', usuario.nome);
    console.log('   Email:', usuario.email);
    console.log('   Tipo:', usuario.tipo);
    console.log('   Status:', usuario.status);
    console.log('   Senha armazenada:', usuario.senha ? usuario.senha.substring(0, 20) + '...' : 'NULL');

    // Verificar se senha foi armazenada
    if (!usuario.senha) {
      console.log('\n❌ PROBLEMA: Senha não foi armazenada (valor NULL)!');
    } else {
      console.log('\n✅ Senha foi armazenada corretamente!');

      // Testar comparação de senha
      const senhaValida = await bcrypt.compare(senhaTeste, usuario.senha);

      if (senhaValida) {
        console.log('✅ Comparação de senha bem-sucedida! A senha funciona corretamente.');
      } else {
        console.log('❌ PROBLEMA: A senha armazenada não corresponde à senha original!');
      }
    }

    // Limpar - remover usuário de teste
    await connection.execute('DELETE FROM usuarios WHERE email = ?', [emailTeste]);
    console.log('\n🧹 Usuário de teste removido do banco de dados.\n');

  } catch (error) {
    console.error('\n❌ Erro durante o teste:', error.message);
    console.error(error);
  } finally {
    await connection.end();
  }
}

testUserPassword();
