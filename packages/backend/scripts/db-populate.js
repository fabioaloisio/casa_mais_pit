const db = require('../src/config/database');
const path = require('path');
const readline = require('readline');
const bcrypt = require('bcrypt');
const fs = require('fs');
const SQLExecutor = require('./utils/sql-executor');

// Função para perguntas interativas
function askQuestion(rl, question, hideInput = false) {
  return new Promise((resolve) => {
    if (hideInput) {
      // Para senhas - implementação mais robusta
      rl.close(); // Fechar readline temporariamente
      
      const stdin = process.stdin;
      const stdout = process.stdout;
      
      stdout.write(question);
      stdin.setRawMode(true);
      stdin.resume();
      stdin.setEncoding('utf8');
      
      let password = '';
      
      const cleanup = () => {
        stdin.setRawMode(false);
        stdin.pause();
        stdin.removeAllListeners('data');
      };
      
      const onKeypress = (char) => {
        switch (char) {
          case '\n':
          case '\r':
          case '\u0004': // Ctrl+D (EOF)
            cleanup();
            stdout.write('\n');
            // Recriar readline
            const newRl = readline.createInterface({
              input: process.stdin,
              output: process.stdout
            });
            resolve({ password, rl: newRl });
            break;
            
          case '\u0003': // Ctrl+C
            cleanup();
            process.exit();
            break;
            
          case '\u007f': // Backspace (DEL)
          case '\b':     // Backspace
            if (password.length > 0) {
              password = password.slice(0, -1);
              // Limpar o asterisco anterior
              stdout.write('\b \b');
            }
            break;
            
          default:
            // Apenas aceitar caracteres printáveis
            const code = char.charCodeAt(0);
            if (code >= 32 && code <= 126) {
              password += char;
              stdout.write('*');
            }
            break;
        }
      };
      
      stdin.on('data', onKeypress);
      
    } else {
      rl.question(question, (answer) => resolve({ password: answer.trim(), rl }));
    }
  });
}

// Função para coletar dados do administrador
async function askAdminData(rl) {
  console.log('\n👤 CONFIGURAÇÃO DO ADMINISTRADOR');
  console.log('Para começar a desenvolver, vamos criar seu usuário administrador:\n');

  let email, nome, senha, currentRl = rl;
  
  // Validar email
  while (true) {
    const emailResult = await askQuestion(currentRl, '📧 Digite seu email: ');
    email = emailResult.password;
    currentRl = emailResult.rl;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
      console.log('❌ Email é obrigatório!');
      continue;
    }
    
    if (!emailRegex.test(email)) {
      console.log('❌ Email inválido! Use um formato válido como exemplo@dominio.com');
      continue;
    }
    
    break;
  }

  // Validar nome
  while (true) {
    const nomeResult = await askQuestion(currentRl, '👤 Digite seu nome completo: ');
    nome = nomeResult.password;
    currentRl = nomeResult.rl;
    
    if (!nome || nome.trim().length < 2) {
      console.log('❌ Nome deve ter pelo menos 2 caracteres!');
      continue;
    }
    
    nome = nome.trim();
    break;
  }

  // Validar senha
  while (true) {
    const senhaResult = await askQuestion(currentRl, '🔐 Digite uma senha segura: ', true);
    senha = senhaResult.password;
    currentRl = senhaResult.rl;
    
    if (!senha) {
      console.log('❌ Senha é obrigatória!');
      continue;
    }
    
    if (senha.length < 6) {
      console.log('❌ Senha deve ter pelo menos 6 caracteres!');
      continue;
    }
    
    const confirmResult = await askQuestion(currentRl, '🔐 Confirme a senha: ', true);
    const confirmSenha = confirmResult.password;
    currentRl = confirmResult.rl;
    
    if (senha !== confirmSenha) {
      console.log('❌ Senhas não conferem! Tente novamente.');
      continue;
    }
    
    break;
  }

  return { email, nome, senha, rl: currentRl };
}

// Função para criar administrador interativo
async function createInteractiveAdmin(connection, adminData) {
  const { email, nome, senha } = adminData;
  
  // Verificar se email já existe
  const [existing] = await connection.execute(
    'SELECT id FROM usuarios WHERE email = ?', 
    [email]
  );
  
  if (existing.length > 0) {
    throw new Error(`❌ Email ${email} já está cadastrado no sistema!`);
  }
  
  // Gerar hash da senha
  const senhaHash = await bcrypt.hash(senha, 10);
  
  // Inserir administrador
  const [result] = await connection.execute(`
    INSERT INTO usuarios (nome, email, senha, tipo, status, ativo, data_cadastro) 
    VALUES (?, ?, ?, 'Administrador', 'ativo', 1, NOW())
  `, [nome, email, senhaHash]);
  
  console.log(`\n✅ Administrador criado com sucesso!`);
  console.log(`   ID: ${result.insertId}`);
  console.log(`   Nome: ${nome}`);
  console.log(`   Email: ${email}`);
  console.log(`   Tipo: Administrador`);
  
  return result.insertId;
}

// Função para popular dados do dashboard
async function populateDashboardData(connection) {
  console.log('\n📊 Populando dados específicos para o dashboard...');

  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

  // Buscar assistidas existentes
  const [assistidas] = await connection.execute('SELECT id FROM assistidas LIMIT 5');

  if (assistidas.length > 0) {
    // Criar consultas distribuídas no mês atual
    console.log('  📝 Criando consultas do mês atual...');
    for (let i = 0; i < 10; i++) {
      const dataConsulta = new Date(inicioMes);
      dataConsulta.setDate(dataConsulta.getDate() + (i * 2));

      await connection.execute(
        `INSERT INTO consultas (assistida_id, data_consulta, medico_id, tipo_consulta, status, observacoes)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          assistidas[i % assistidas.length].id,
          dataConsulta.toISOString().split('T')[0],
          i % 2 === 0 ? 1 : 2, // 1 para Dr. Silva, 2 para Dra. Santos
          i % 2 === 0 ? 'Clínico Geral' : 'Psiquiatria',
          'realizada',
          `Consulta de rotina`
        ]
      );
    }

    // Criar internações ativas
    console.log('  🏥 Criando internações ativas...');
    for (let i = 0; i < Math.min(3, assistidas.length); i++) {
      await connection.execute(
        'INSERT INTO internacoes (assistida_id, data_entrada, status, observacoes) VALUES (?, DATE_SUB(NOW(), INTERVAL ? DAY), ?, ?)',
        [assistidas[i].id, i * 2, 'ativa', `Internação para tratamento`]
      );
    }
  }

  // Criar despesas do mês
  console.log('  💰 Criando despesas do mês atual...');
  const [tipos] = await connection.execute('SELECT id FROM tipos_despesas LIMIT 1');
  if (tipos.length > 0) {
    const categorias = ['Alimentação', 'Medicamentos', 'Manutenção', 'Utilidades', 'Material de Escritório'];
    const formasPagamento = ['pix', 'cartao_credito', 'transferencia', 'boleto', 'dinheiro'];

    for (let i = 0; i < 5; i++) {
      const dataDespesa = new Date(inicioMes);
      dataDespesa.setDate(dataDespesa.getDate() + (i * 3));

      await connection.execute(
        `INSERT INTO despesas (tipo_despesa_id, descricao, categoria, valor, data_despesa, forma_pagamento, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          tipos[0].id,
          `Despesa operacional ${i + 1}`,
          categorias[i % categorias.length],
          200 + (i * 100),
          dataDespesa.toISOString().split('T')[0],
          formasPagamento[i % formasPagamento.length],
          'paga'
        ]
      );
    }
  }

  // Criar movimentações de caixa (doações monetárias)
  console.log('  💵 Criando doações monetárias...');
  const [doadores] = await connection.execute('SELECT id FROM doadores LIMIT 5');
  if (doadores.length > 0) {
    for (let i = 0; i < 5; i++) {
      const dataMovimentacao = new Date(inicioMes);
      dataMovimentacao.setDate(dataMovimentacao.getDate() + (i * 4));

      await connection.execute(
        `INSERT INTO caixa_movimentacoes (tipo, categoria, valor, data_movimentacao, descricao, doador_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          'entrada',
          'doacao_monetaria',
          500 + (i * 200),
          dataMovimentacao.toISOString().split('T')[0],
          `Doação monetária - ${doadores[i % doadores.length].id}`,
          doadores[i % doadores.length].id
        ]
      );
    }
  }

  console.log('  ✅ Dados do dashboard populados com sucesso');
}

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
    const usersFilePath = path.join(__dirname, 'sql', 'populate_users_all_profiles.sql');
    const additionalSqlFilePath = path.join(__dirname, 'sql', 'populate_additional_data.sql');

    console.log('\n🌱 Populando banco com dados de exemplo...');
    await sqlExecutor.executeFile(sqlFilePath);

    // Executar criação de usuários com diferentes status (OBRIGATÓRIO)
    if (fs.existsSync(usersFilePath)) {
      console.log('\n👥 Criando usuários com diferentes status...');
      await sqlExecutor.executeFile(usersFilePath);
    }

    // Executar dados adicionais (colaboradores de teste) - APÓS usuários
    if (fs.existsSync(additionalSqlFilePath)) {
      console.log('\n🌿 Populando dados complementares (internações, consultas)...');
      await sqlExecutor.executeFile(additionalSqlFilePath);
    }

    // Popular dados específicos do dashboard
    await populateDashboardData(connection);

    // Verificar se já existe um administrador no sistema
    const [adminCheck] = await connection.execute(
      "SELECT nome, email FROM usuarios WHERE tipo = 'Administrador' LIMIT 1"
    );

    if (adminCheck.length > 0) {
      // Admin já existe, mostrar informações
      console.log('\n✅ Administrador já configurado no sistema:');
      console.log(`   Nome: ${adminCheck[0].nome}`);
      console.log(`   Email: ${adminCheck[0].email}`);
      console.log('   📝 Use as credenciais definidas no script SQL para fazer login.');
    } else {
      // Não existe admin, criar interativamente
      console.log('\n⚠️ Nenhum administrador encontrado. Vamos criar um agora.');

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      try {
        const adminResult = await askAdminData(rl);
        await createInteractiveAdmin(connection, adminResult);
      } finally {
        if (rl && typeof rl.close === 'function') {
          rl.close();
        }
      }
    }

    // Mostrar estatísticas finais (expandida para incluir novas tabelas)
    console.log('\n📊 Dados inseridos:');
    const tables = [
      'tipos_despesas', 'doadores', 'despesas', 'doacoes', 
      'unidades_medida', 'medicamentos', 'assistidas',
      'usuarios', 'internacoes', 'consultas', 
      'drogas_utilizadas', 'medicamentos_utilizados',
      'caixa_movimentacoes', 'caixa_fechamentos'
    ];
    await sqlExecutor.showTableStats(tables);

    console.log('\n🎯 SETUP COMPLETO! 🎉');
    console.log('');
    console.log('✅ Banco populado com dados de exemplo');
    console.log('✅ Usuários configurados e prontos para usar');
    console.log('');
    console.log('🚀 PRÓXIMOS PASSOS:');
    console.log('   1. Acesse http://localhost:5173');
    console.log('   2. Faça login com uma das credenciais abaixo');
    console.log('   3. Explore o sistema com dados de exemplo');
    console.log('');
    console.log('👥 USUÁRIOS DISPONÍVEIS:');
    console.log('');
    console.log('🔐 ADMINISTRADOR:');
    console.log('   • fabioaloisio@gmail.com (senha: 123456)');
    console.log('');
    console.log('💰 FINANCEIRO:');
    console.log('   • financeiro@casamais.org (senha: senha123)');
    console.log('');
    console.log('👷 COLABORADORES (senha: senha123):');
    console.log('   • joao.colaborador@casamais.org');
    console.log('   • maria.colaborador@casamais.org');
    console.log('   • pedro.colaborador@casamais.org');

  } catch (error) {
    console.error('❌ Erro ao popular banco:', error.message);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

if (require.main === module) {
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

module.exports = populateDatabase;