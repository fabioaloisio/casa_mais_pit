const express = require('express')
const assistidaController = require('../controllers/assistidaController')
const { verifyToken, requirePermission } = require('../middleware/authMiddleware');

const router = express.Router()

// RF_B1 - Gerenciar Assistidas (Administrador e Colaborador)
router.get('/', verifyToken, requirePermission('RF_B1'), assistidaController.getAll)
router.get('/estatisticas', verifyToken, requirePermission('RF_B1'), assistidaController.estatisticas);
router.get('/:id', verifyToken, requirePermission('RF_B1'), assistidaController.getById)
router.post('/', verifyToken, requirePermission('RF_B1'), assistidaController.create);
router.put('/:id', verifyToken, requirePermission('RF_B1'), assistidaController.update);
router.delete('/:id', verifyToken, requirePermission('RF_B1'), assistidaController.detete);

module.exports = router