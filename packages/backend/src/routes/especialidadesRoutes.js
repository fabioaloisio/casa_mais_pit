const express = require('express');
const router = express.Router();
const especialidadesController = require('../controllers/especialidadesController');
const { verifyToken, requirePermission } = require('../middleware/authMiddleware');

// Listar especialidades disponíveis para consultas
router.get('/', verifyToken, requirePermission('RF_F6'), especialidadesController.listar);

module.exports = router;