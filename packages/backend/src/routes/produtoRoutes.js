const express = require('express');
const produtoController = require('../controllers/produtoController');
const { verifyToken, requirePermission } = require('../middleware/authMiddleware');

const router = express.Router();

// Gerenciar Produtos (Administrador e Financeiro)
router.get('/', verifyToken, requirePermission('RF_B4'), produtoController.getAll);
router.get('/:id', verifyToken, requirePermission('RF_B4'), produtoController.getById);
router.post('/', verifyToken, requirePermission('RF_B4'), produtoController.create);
router.put('/:id', verifyToken, requirePermission('RF_B4'), produtoController.update);
router.delete('/:id', verifyToken, requirePermission('RF_B4'), produtoController.delete);

module.exports = router;

