const db = require('../src/config/database');

async function addBlockedUser() {
  let connection;

  try {
    connection = await db.getConnection();
    console.log('🔗 Conectado ao banco de dados');

    // Verificar se usuário bloqueado já existe
    const [existing] = await connection.execute(
      'SELECT id, status FROM usuarios WHERE email = ?',
      ['ana.bloqueada@casamais.org']
    );

    if (existing.length > 0) {
      console.log('⚠️ Usuário ana.bloqueada@casamais.org já existe');
      console.log(`   Status atual: ${existing[0].status}`);

      if (existing[0].status !== 'bloqueado') {
        // Atualizar para status bloqueado
        await connection.execute(`
          UPDATE usuarios
          SET status = 'bloqueado',
              ativo = 0,
              data_bloqueio = DATE_SUB(NOW(), INTERVAL 2 DAY),
              motivo_bloqueio = 'Violação das políticas internas da instituição - conduta inadequada com assistidas',
              bloqueado_por = 1,
              data_atualizacao = NOW()
          WHERE email = ?
        `, ['ana.bloqueada@casamais.org']);

        console.log('✅ Status atualizado para bloqueado');
      } else {
        console.log('✅ Usuário já está bloqueado');
      }
    } else {
      // Inserir novo usuário bloqueado
      await connection.execute(`
        INSERT INTO usuarios (
          nome, email, senha, tipo, status, ativo,
          data_cadastro, data_aprovacao, token_ativacao, aprovado_por,
          data_bloqueio, motivo_bloqueio, bloqueado_por
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'Ana Silva Bloqueada',
        'ana.bloqueada@casamais.org',
        null,
        'Colaborador',
        'bloqueado',
        0,
        new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 dias atrás
        new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),  // 2 dias atrás
        null,
        1,
        new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),  // 2 dias atrás
        'Violação das políticas internas da instituição - conduta inadequada com assistidas',
        1
      ]);

      console.log('✅ Usuário bloqueado criado com sucesso');
    }

    // Criar histórico de status
    const [user] = await connection.execute(
      'SELECT id FROM usuarios WHERE email = ?',
      ['ana.bloqueada@casamais.org']
    );

    if (user.length > 0) {
      // Verificar se já existe histórico
      const [historyExists] = await connection.execute(
        'SELECT id FROM usuarios_status_historico WHERE usuario_id = ? AND status_novo = "bloqueado"',
        [user[0].id]
      );

      if (historyExists.length === 0) {
        await connection.execute(`
          INSERT INTO usuarios_status_historico
          (usuario_id, status_anterior, status_novo, alterado_por, motivo, data_alteracao)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          user[0].id,
          'aprovado',
          'bloqueado',
          1,
          'Usuário bloqueado por violação das políticas internas',
          new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 dias atrás
        ]);

        console.log('✅ Histórico de status criado');
      } else {
        console.log('✅ Histórico de status já existe');
      }
    }

    // Verificar resultado
    const [result] = await connection.execute(`
      SELECT nome, email, status, ativo,
             CASE ativo
               WHEN 1 THEN '✅ Pode Logar'
               ELSE '❌ Não Pode Logar'
             END as acesso,
             motivo_bloqueio
      FROM usuarios
      WHERE email = 'ana.bloqueada@casamais.org'
    `);

    if (result.length > 0) {
      const user = result[0];
      console.log('\n📊 USUÁRIO BLOQUEADO:');
      console.log(`   Nome: ${user.nome}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Status: ${user.status}`);
      console.log(`   Acesso: ${user.acesso}`);
      console.log(`   Motivo: ${user.motivo_bloqueio || 'N/A'}`);
    }

  } catch (error) {
    console.error('❌ Erro ao adicionar usuário bloqueado:', error.message);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

if (require.main === module) {
  console.log('🚀 Adicionando usuário bloqueado...');
  addBlockedUser()
    .then(() => {
      console.log('\n🎉 Usuário bloqueado adicionado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Falha:', error);
      process.exit(1);
    });
}

module.exports = addBlockedUser;