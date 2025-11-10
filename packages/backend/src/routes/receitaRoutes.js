const express = require('express');
const receitaController = require('../controllers/receitaController');
const { verifyToken, requirePermission } = require('../middleware/authMiddleware');

const router = express.Router();

// Gerenciar Receitas (Administrador e Financeiro)
router.get('/', verifyToken, requirePermission('RF_B4'), receitaController.getAll);
router.get('/:id', verifyToken, requirePermission('RF_B4'), receitaController.getById);
router.post('/', verifyToken, requirePermission('RF_B4'), receitaController.create);
router.put('/:id', verifyToken, requirePermission('RF_B4'), receitaController.update);
router.delete('/:id', verifyToken, requirePermission('RF_B4'), receitaController.delete);

module.exports = router;

