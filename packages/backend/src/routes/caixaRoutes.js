const express = require('express');
const router = express.Router();
const caixaController = require('../controllers/caixaController');
const { verifyToken, requirePermission } = require('../middleware/authMiddleware');

// Listar movimentações do caixa - rota raiz
router.get('/', verifyToken, requirePermission('RF_F5'), caixaController.listarMovimentacoes);

// RF_F4 - Lançar Doação Monetária (Administrador e Financeiro)
router.post('/doacao-monetaria', verifyToken, requirePermission('RF_F4'), caixaController.lancarDoacaoMonetaria);

// RF_F5 - Atualizar Caixa (Administrador e Financeiro)
router.post('/atualizar', verifyToken, requirePermission('RF_F5'), caixaController.atualizarCaixa);

// Rotas auxiliares - também precisam de permissão financeira
router.get('/saldo', verifyToken, requirePermission('RF_F5'), caixaController.obterSaldo);
router.get('/movimentacoes', verifyToken, requirePermission('RF_F5'), caixaController.listarMovimentacoes);
router.get('/movimentacoes/recentes', verifyToken, requirePermission('RF_F5'), caixaController.listarMovimentacoesRecentes);
router.get('/estatisticas', verifyToken, requirePermission('RF_F5'), caixaController.obterEstatisticas);
router.get('/extrato', verifyToken, requirePermission('RF_F5'), caixaController.obterExtrato);
router.post('/fechar', verifyToken, requirePermission('RF_F5'), caixaController.fecharCaixa);

module.exports = router;
