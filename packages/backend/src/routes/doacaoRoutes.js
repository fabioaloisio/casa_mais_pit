const express = require('express');
const router = express.Router();
const doacaoController = require('../controllers/doacaoController');
const { verifyToken, requirePermission } = require('../middleware/authMiddleware');

// RF_B6 / RF_F4 - Gerenciar Doações (Administrador e Financeiro)
router.post('/', verifyToken, requirePermission('RF_B6'), doacaoController.criar);
router.get('/', verifyToken, requirePermission('RF_B6'), doacaoController.listar);
router.get('/estatisticas', verifyToken, requirePermission('RF_B6'), doacaoController.estatisticas);
router.get('/:id', verifyToken, requirePermission('RF_B6'), doacaoController.buscarPorId);
router.get('/doador/:doadorId', verifyToken, requirePermission('RF_B6'), doacaoController.buscarPorDoador);
router.put('/:id', verifyToken, requirePermission('RF_B6'), doacaoController.atualizar);
router.delete('/:id', verifyToken, requirePermission('RF_B6'), doacaoController.excluir); // Retorna erro 403 - Doações não podem ser excluídas

module.exports = router;