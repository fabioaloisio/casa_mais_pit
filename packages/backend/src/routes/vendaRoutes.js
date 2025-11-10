const express = require('express');
const vendaController = require('../controllers/vendaController');
const { verifyToken, requirePermission } = require('../middleware/authMiddleware');

const router = express.Router();

// Gerenciar Vendas (Administrador e Financeiro)
router.get('/', verifyToken, requirePermission('RF_B4'), vendaController.getAll);
router.get('/relatorio', verifyToken, requirePermission('RF_B4'), vendaController.getRelatorio);
router.get('/:id', verifyToken, requirePermission('RF_B4'), vendaController.getById);
router.post('/', verifyToken, requirePermission('RF_B4'), vendaController.create);
router.put('/:id', verifyToken, requirePermission('RF_B4'), vendaController.update);
router.delete('/:id', verifyToken, requirePermission('RF_B4'), vendaController.delete);

module.exports = router;

