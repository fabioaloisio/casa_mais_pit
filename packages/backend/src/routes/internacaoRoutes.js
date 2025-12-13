const express = require('express');
const router = express.Router();
const internacaoController = require('../controllers/internacaoController');
const { verifyToken, requirePermission } = require('../middleware/authMiddleware');

// Listar todas as internações (ativas e finalizadas) - rota raiz
router.get('/', verifyToken, requirePermission('RF_F1'), internacaoController.listarTodas);

// RF_F1 - Efetuar Entrada na Instituição (Administrador e Colaborador)
router.post('/entrada', verifyToken, requirePermission('RF_F1'), internacaoController.efetuarEntrada);

// RF_F2 - Efetuar Saída da Instituição (Administrador e Colaborador)
router.post('/saida', verifyToken, requirePermission('RF_F2'), internacaoController.efetuarSaida);

// Rotas auxiliares - também precisam de permissão
router.get('/ativas', verifyToken, requirePermission('RF_F1'), internacaoController.listarAtivas);
router.get('/historico/:assistidaId', verifyToken, requirePermission('RF_F1'), internacaoController.buscarHistorico);
router.get('/estatisticas', verifyToken, requirePermission('RF_F1'), internacaoController.estatisticas);
// Alias para compatibilidade com frontend
router.get('/stats', verifyToken, requirePermission('RF_F1'), internacaoController.estatisticas);

// RF_F2 - Atualizar Saída da Instituição (Administrador e Colaborador)
router.put('/entrada/:id',verifyToken,requirePermission('RF_F1'),internacaoController.atualizarEntrada);
router.put('/saida/:id',verifyToken, requirePermission('RF_F2'), internacaoController.atualizarSaida);
// router.post('/retorno', verifyToken, requirePermission('RF_F1'), internacaoController.registrarRetorno);




module.exports = router;
