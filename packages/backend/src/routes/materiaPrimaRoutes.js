const express = require('express');
const materiaPrimaController = require('../controllers/materiaPrimaController');
const { verifyToken, requirePermission } = require('../middleware/authMiddleware');

const router = express.Router();

// Gerenciar Matérias-Primas (Administrador e Financeiro)
router.get('/', verifyToken, requirePermission('RF_B4'), materiaPrimaController.getAll);
router.get('/:id', verifyToken, requirePermission('RF_B4'), materiaPrimaController.getById);
router.post('/', verifyToken, requirePermission('RF_B4'), materiaPrimaController.create);
router.put('/:id', verifyToken, requirePermission('RF_B4'), materiaPrimaController.update);
router.delete('/:id', verifyToken, requirePermission('RF_B4'), materiaPrimaController.delete);

module.exports = router;

