const express = require('express');
const tipoDespesaController = require('../controllers/tipoDespesaController');
const { verifyToken, requirePermission } = require('../middleware/authMiddleware');

const router = express.Router();

// RF_B7 - Gerenciar Tipos de Despesas (Administrador e Financeiro)
router.get('/', verifyToken, requirePermission('RF_B7'), tipoDespesaController.getAll);
router.get('/:id', verifyToken, requirePermission('RF_B7'), tipoDespesaController.getById);
router.post('/', verifyToken, requirePermission('RF_B7'), tipoDespesaController.create);
router.put('/:id', verifyToken, requirePermission('RF_B7'), tipoDespesaController.update);
router.delete('/:id', verifyToken, requirePermission('RF_B7'), tipoDespesaController.delete);

module.exports = router;