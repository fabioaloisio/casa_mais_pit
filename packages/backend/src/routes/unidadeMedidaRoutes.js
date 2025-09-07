const express = require('express');
const unidadeMedidaController = require('../controllers/unidadeMedidaController');
const { verifyToken, requirePermission } = require('../middleware/authMiddleware');

const router = express.Router();

// RF_B5 - Gerenciar Unidades de Medida (Administrador e Colaborador)
router.get('/', verifyToken, requirePermission('RF_B5'), unidadeMedidaController.getAll);
router.get('/:id', verifyToken, requirePermission('RF_B5'), unidadeMedidaController.getById);
router.post('/', verifyToken, requirePermission('RF_B5'), unidadeMedidaController.create);
router.put('/:id', verifyToken, requirePermission('RF_B5'), unidadeMedidaController.update);
router.delete('/:id', verifyToken, requirePermission('RF_B5'), unidadeMedidaController.delete);

module.exports = router;