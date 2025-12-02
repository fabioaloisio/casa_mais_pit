const express = require('express');
const despesaController = require('../controllers/despesaController');
const { verifyToken, requirePermission } = require('../middleware/authMiddleware');

const router = express.Router();

// RF_F3 - Gerenciar Despesas (Administrador e Financeiro)
// Rotas básicas CRUD
router.get('/', verifyToken, requirePermission('RF_F3'), despesaController.getAll);
router.get('/:id', verifyToken, requirePermission('RF_F3'), despesaController.getById);
router.post('/', verifyToken, requirePermission('RF_F3'), despesaController.create);
router.put('/:id', verifyToken, requirePermission('RF_F3'), despesaController.update);
router.delete('/:id', verifyToken, requirePermission('RF_F3'), despesaController.delete);

// Rotas especiais - também precisam de permissão para relatórios de despesas
router.get('/estatisticas', verifyToken, requirePermission('RF_F3'), despesaController.getEstatisticas);
router.get('/categoria/:categoria', verifyToken, requirePermission('RF_F3'), despesaController.getByCategoria);
router.get('/periodo/:dataInicio/:dataFim', verifyToken, requirePermission('RF_F3'), despesaController.getByPeriodo);
router.get('/status/:status', verifyToken, requirePermission('RF_F3'), despesaController.getByStatus);

module.exports = router;
