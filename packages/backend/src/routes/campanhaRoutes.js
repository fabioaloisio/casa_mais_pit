const express = require('express');
const router = express.Router();
const campanhaController = require('../controllers/campanhaController');
const { verifyToken, requirePermission } = require('../middleware/authMiddleware');

// ================ ROTAS DE CAMPANHAS ================

// Listar todas as campanhas (público - sem autenticação)
router.get('/', campanhaController.listarCampanhas);

// Obter ranking de campanhas (público) - DEVE vir antes de /:id
router.get('/relatorio/ranking', campanhaController.obterRanking);

// Atualizar status de todas as campanhas baseado nas datas (protegido)
router.post('/atualizar-status', verifyToken, requirePermission('RF_F5'), campanhaController.atualizarStatusCampanhas);

// Obter detalhes de uma campanha específica (público)
router.get('/:id', campanhaController.obterCampanha);

// Obter estatísticas de uma campanha (público)
router.get('/:id/estatisticas', campanhaController.obterEstatisticas);

// ================ ROTAS PROTEGIDAS - REQUEREM AUTENTICAÇÃO ================

// Criar nova campanha (Administrador e Financeiro)
router.post('/', verifyToken, requirePermission('RF_F5'), campanhaController.criarCampanha);

// Atualizar campanha (Administrador e Financeiro)
router.put('/:id', verifyToken, requirePermission('RF_F5'), campanhaController.atualizarCampanha);

// ================ ROTAS DE CONTROLE DE STATUS ================

// Encerrar campanha manualmente
router.put('/:id/encerrar', verifyToken, requirePermission('RF_F5'), campanhaController.encerrarCampanha);

// Cancelar campanha
router.put('/:id/cancelar', verifyToken, requirePermission('RF_F5'), campanhaController.cancelarCampanha);

// Reativar campanha
router.put('/:id/reativar', verifyToken, requirePermission('RF_F5'), campanhaController.reativarCampanha);

// ================ ROTAS DE DOADORES_CAMPANHAS (N:N) ================

// Associar doador a uma campanha (registrar doação)
router.post('/:id/doadores', verifyToken, requirePermission('RF_F4'), campanhaController.associarDoador);

// Listar doadores de uma campanha
router.get('/:id/doadores', verifyToken, requirePermission('RF_F5'), campanhaController.listarDoadoresCampanha);

// Listar campanhas de um doador específico
router.get('/doador/:doadorId/campanhas', verifyToken, requirePermission('RF_F5'), campanhaController.listarCampanhasDoador);

module.exports = router;