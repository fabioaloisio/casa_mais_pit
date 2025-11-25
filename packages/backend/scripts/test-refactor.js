/**
 * Script de teste COMPLETO para validar a refatoração MVC + Singleton
 * Cria dados de teste e executa fluxo completo
 * Como rodar: node packages/backend/scripts/test-refactor.js
 */

const path = require('path');
const envPath = path.resolve(__dirname, '../../../.env');
require('dotenv').config({ path: envPath });

const db = require('../src/config/database');
const Venda = require('../src/models/venda');

// Cores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  title: (msg) => console.log(`\n${colors.yellow}=== ${msg} ===${colors.reset}\n`)
};

let testsPassed = 0;
let testsFailed = 0;
let produtoId = null;

async function setup() {
  log.title('SETUP: Criando produto de teste');

  try {
    // Criar produto de teste diretamente no banco
    const [result] = await db.execute(`
      INSERT INTO produtos (nome, descricao, preco_venda, custo_estimado, margem_bruta, margem_percentual, ativo)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, ['Produto Teste MVC', 'Produto para teste de refatoração', 100.00, 60.00, 40.00, 40.00, 1]);

    produtoId = result.insertId;
    log.success(`Produto de teste criado com ID: ${produtoId}`);
    log.info(`  Nome: Produto Teste MVC`);
    log.info(`  Preço venda: R$ 100,00`);
    log.info(`  Custo estimado: R$ 60,00`);
    return true;
  } catch (error) {
    log.error(`Erro ao criar produto de teste: ${error.message}`);
    return false;
  }
}

async function cleanup() {
  log.title('CLEANUP: Removendo dados de teste');

  try {
    if (produtoId) {
      // Remover vendas do produto de teste
      await db.execute('DELETE FROM vendas WHERE produto_id = ?', [produtoId]);
      log.success('Vendas de teste removidas');

      // Remover produto de teste
      await db.execute('DELETE FROM produtos WHERE id = ?', [produtoId]);
      log.success(`Produto de teste ID ${produtoId} removido`);
    }
  } catch (error) {
    log.error(`Erro no cleanup: ${error.message}`);
  }
}

async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('  TESTES COMPLETOS - REFATORAÇÃO MVC + SINGLETON');
  console.log('='.repeat(60));

  // Setup
  const setupOk = await setup();
  if (!setupOk) {
    console.log('Setup falhou. Abortando testes.');
    process.exit(1);
  }

  // ==========================================
  // TESTE 1: Criar Venda via Model
  // ==========================================
  log.title('TESTE 1: Venda.create() - Fluxo MVC Completo');

  let vendaCriada = null;
  try {
    const dadosVenda = {
      produto_id: produtoId,
      quantidade: 5,
      desconto: 50,
      forma_pagamento: 'Pix',
      observacoes: 'Venda de teste MVC',
      data_venda: new Date().toISOString().split('T')[0]
    };

    vendaCriada = await Venda.create(dadosVenda);

    if (vendaCriada && vendaCriada.id) {
      log.success(`Venda criada com sucesso! ID: ${vendaCriada.id}`);
      testsPassed++;

      // Verificar cálculos
      // valor_bruto = 5 * 100 = 500
      // valor_final = 500 - 50 = 450
      // custo_total = 5 * 60 = 300
      // lucro = 450 - 300 = 150

      const checks = [
        { field: 'valor_bruto', expected: 500, actual: vendaCriada.valor_bruto },
        { field: 'valor_final', expected: 450, actual: vendaCriada.valor_final },
        { field: 'custo_estimado_total', expected: 300, actual: vendaCriada.custo_estimado_total },
        { field: 'lucro_estimado', expected: 150, actual: vendaCriada.lucro_estimado }
      ];

      for (const check of checks) {
        if (Math.abs(check.actual - check.expected) < 0.01) {
          log.success(`${check.field}: ${check.actual} (correto)`);
          testsPassed++;
        } else {
          log.error(`${check.field}: ${check.actual} (esperado: ${check.expected})`);
          testsFailed++;
        }
      }
    } else {
      log.error('Venda não foi criada');
      testsFailed++;
    }
  } catch (error) {
    log.error(`Erro ao criar venda: ${error.message}`);
    console.error(error);
    testsFailed++;
  }

  // ==========================================
  // TESTE 2: Buscar Venda por ID
  // ==========================================
  log.title('TESTE 2: Venda.findById()');

  if (vendaCriada) {
    try {
      const vendaEncontrada = await Venda.findById(vendaCriada.id);
      if (vendaEncontrada && vendaEncontrada.id === vendaCriada.id) {
        log.success(`Venda encontrada: ID ${vendaEncontrada.id}`);
        testsPassed++;

        // Testar toJSON()
        const json = vendaEncontrada.toJSON();
        if (json && typeof json === 'object' && json.id === vendaCriada.id) {
          log.success('toJSON() funciona corretamente');
          testsPassed++;
        } else {
          log.error('toJSON() não funciona corretamente');
          testsFailed++;
        }
      } else {
        log.error('Venda não encontrada por ID');
        testsFailed++;
      }
    } catch (error) {
      log.error(`Erro em findById: ${error.message}`);
      testsFailed++;
    }
  }

  // ==========================================
  // TESTE 3: Listar Vendas (findAll)
  // ==========================================
  log.title('TESTE 3: Venda.findAll()');

  try {
    const vendas = await Venda.findAll();
    if (Array.isArray(vendas) && vendas.length > 0) {
      log.success(`findAll() retornou ${vendas.length} venda(s)`);
      testsPassed++;
    } else {
      log.error('findAll() não retornou vendas');
      testsFailed++;
    }

    // Testar com filtro
    const vendasFiltradas = await Venda.findAll({ produto_id: produtoId });
    if (vendasFiltradas.length > 0) {
      log.success(`findAll() com filtro produto_id retornou ${vendasFiltradas.length} venda(s)`);
      testsPassed++;
    } else {
      log.error('findAll() com filtro não funcionou');
      testsFailed++;
    }
  } catch (error) {
    log.error(`Erro em findAll: ${error.message}`);
    testsFailed++;
  }

  // ==========================================
  // TESTE 4: Atualizar Venda
  // ==========================================
  log.title('TESTE 4: Venda.update()');

  if (vendaCriada) {
    try {
      const dadosAtualizacao = {
        quantidade: 10,  // Dobrar quantidade
        desconto: 100,   // Dobrar desconto
        observacoes: 'Venda atualizada pelo teste MVC'
      };

      const vendaAtualizada = await Venda.update(vendaCriada.id, dadosAtualizacao);

      // Novos cálculos:
      // valor_bruto = 10 * 100 = 1000
      // valor_final = 1000 - 100 = 900
      // custo_total = 10 * 60 = 600
      // lucro = 900 - 600 = 300

      if (vendaAtualizada) {
        const checks = [
          { field: 'quantidade', expected: 10, actual: vendaAtualizada.quantidade },
          { field: 'valor_bruto', expected: 1000, actual: vendaAtualizada.valor_bruto },
          { field: 'valor_final', expected: 900, actual: vendaAtualizada.valor_final },
          { field: 'custo_estimado_total', expected: 600, actual: vendaAtualizada.custo_estimado_total },
          { field: 'lucro_estimado', expected: 300, actual: vendaAtualizada.lucro_estimado }
        ];

        let allCorrect = true;
        for (const check of checks) {
          if (Math.abs(check.actual - check.expected) < 0.01) {
            log.success(`${check.field}: ${check.actual} (correto)`);
            testsPassed++;
          } else {
            log.error(`${check.field}: ${check.actual} (esperado: ${check.expected})`);
            testsFailed++;
            allCorrect = false;
          }
        }

        if (allCorrect) {
          log.success('UPDATE recalculou todos os valores corretamente!');
        }
      } else {
        log.error('Update não retornou venda atualizada');
        testsFailed++;
      }
    } catch (error) {
      log.error(`Erro em update: ${error.message}`);
      testsFailed++;
    }
  }

  // ==========================================
  // TESTE 5: Relatório
  // ==========================================
  log.title('TESTE 5: Venda.getRelatorio()');

  try {
    const hoje = new Date().toISOString().split('T')[0];
    const relatorio = await Venda.getRelatorio(hoje, hoje);

    if (Array.isArray(relatorio)) {
      log.success(`getRelatorio() retornou ${relatorio.length} registro(s)`);
      testsPassed++;

      if (relatorio.length > 0) {
        log.info(`  Data: ${relatorio[0].data}`);
        log.info(`  Total vendas: ${relatorio[0].total_vendas}`);
        log.info(`  Total valor final: R$ ${relatorio[0].total_valor_final}`);
        log.info(`  Total lucro: R$ ${relatorio[0].total_lucro_estimado}`);
      }
    } else {
      log.error('getRelatorio() não retornou array');
      testsFailed++;
    }

    // Testar validação
    try {
      await Venda.getRelatorio(null, null);
      log.error('Deveria ter lançado erro de validação');
      testsFailed++;
    } catch (error) {
      if (error.type === 'validation') {
        log.success('Validação de datas funciona corretamente');
        testsPassed++;
      }
    }
  } catch (error) {
    log.error(`Erro em getRelatorio: ${error.message}`);
    testsFailed++;
  }

  // ==========================================
  // TESTE 6: Excluir Venda
  // ==========================================
  log.title('TESTE 6: Venda.delete()');

  if (vendaCriada) {
    try {
      const deleted = await Venda.delete(vendaCriada.id);
      if (deleted) {
        log.success(`Venda ID ${vendaCriada.id} excluída com sucesso`);
        testsPassed++;

        // Verificar se realmente foi excluída
        const vendaExcluida = await Venda.findById(vendaCriada.id);
        if (!vendaExcluida) {
          log.success('Venda não existe mais no banco (confirmado)');
          testsPassed++;
        } else {
          log.error('Venda ainda existe após delete');
          testsFailed++;
        }
      } else {
        log.error('Delete retornou false');
        testsFailed++;
      }

      // Testar delete de venda inexistente
      try {
        await Venda.delete(vendaCriada.id);
        log.error('Deveria ter lançado erro not_found');
        testsFailed++;
      } catch (error) {
        if (error.type === 'not_found') {
          log.success('Erro not_found lançado para venda inexistente');
          testsPassed++;
        }
      }
    } catch (error) {
      log.error(`Erro em delete: ${error.message}`);
      testsFailed++;
    }
  }

  // Cleanup
  await cleanup();

  // ==========================================
  // RESULTADO FINAL
  // ==========================================
  console.log('\n' + '='.repeat(60));
  console.log('  RESULTADO DOS TESTES');
  console.log('='.repeat(60));
  console.log(`\n  ${colors.green}Passou: ${testsPassed}${colors.reset}`);
  console.log(`  ${colors.red}Falhou: ${testsFailed}${colors.reset}`);
  console.log(`  Total: ${testsPassed + testsFailed}\n`);

  if (testsFailed === 0) {
    console.log(`${colors.green}  ✓ TODOS OS TESTES PASSARAM!${colors.reset}`);
    console.log(`${colors.green}  ✓ REFATORAÇÃO MVC + SINGLETON VALIDADA!${colors.reset}\n`);
  } else {
    console.log(`${colors.red}  ✗ ALGUNS TESTES FALHARAM${colors.reset}\n`);
  }

  process.exit(testsFailed > 0 ? 1 : 0);
}

// Executar testes
runTests().catch(async error => {
  console.error('Erro fatal:', error);
  await cleanup();
  process.exit(1);
});
