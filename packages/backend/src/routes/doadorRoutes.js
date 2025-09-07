const express = require('express');
const router = express.Router();
const doadorController = require('../controllers/doadorController');
const { verifyToken, requirePermission } = require('../middleware/authMiddleware');

// RF_B3 - Gerenciar Doadores (Apenas Administrador)
router.post('/', verifyToken, requirePermission('RF_B3'), doadorController.create);

router.get('/', verifyToken, requirePermission('RF_B3'), doadorController.findAll);

router.get('/:id', verifyToken, requirePermission('RF_B3'), doadorController.findById);

router.put('/:id', verifyToken, requirePermission('RF_B3'), doadorController.update);

router.delete('/:id', verifyToken, requirePermission('RF_B3'), doadorController.delete);

router.get('/:id/doacoes', verifyToken, requirePermission('RF_B3'), doadorController.findDoacoes);

module.exports = router;