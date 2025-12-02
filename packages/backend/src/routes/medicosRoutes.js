const express = require('express');
const router = express.Router();
const medicosController = require('../controllers/medicosController');
const { verifyToken, requirePermission } = require('../middleware/authMiddleware');

// Listar médicos disponíveis para consultas
router.get('/', verifyToken, requirePermission('RF_F6'), medicosController.listar);

module.exports = router;