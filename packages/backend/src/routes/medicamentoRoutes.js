const express = require('express');
const medicamentoController = require('../controllers/medicamentoController');
const { verifyToken, requirePermission } = require('../middleware/authMiddleware');

const router = express.Router();

// RF_B4 - Gerenciar Medicamentos (Administrador e Colaborador)
router.get('/', verifyToken, requirePermission('RF_B4'), medicamentoController.getAll);
router.get('/:id', verifyToken, requirePermission('RF_B4'), medicamentoController.getById);
router.post('/', verifyToken, requirePermission('RF_B4'), medicamentoController.create);
router.put('/:id', verifyToken, requirePermission('RF_B4'), medicamentoController.update);
router.delete('/:id', verifyToken, requirePermission('RF_B4'), medicamentoController.delete);


module.exports = router;