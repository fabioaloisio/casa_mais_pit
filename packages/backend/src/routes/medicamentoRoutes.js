const express = require('express');
const medicamentoController = require('../controllers/medicamentoController');
const { verifyToken, requirePermission } = require('../middleware/authMiddleware');

const router = express.Router();

// RF_B4 - Gerenciar Medicamentos (Administrador e Colaborador)
router.get('/', medicamentoController.getAll);
router.get('/:id', medicamentoController.getById);
router.post('/', medicamentoController.create);
router.put('/:id', medicamentoController.update);
router.delete('/:id', medicamentoController.delete);


module.exports = router;
