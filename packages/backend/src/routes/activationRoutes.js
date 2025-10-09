const express = require('express');
const activationController = require('../controllers/activationController');

const router = express.Router();

// Validar token de ativação
router.get('/validate/:token', activationController.validateToken);

// Ativar conta
router.post('/activate/:token', activationController.activateAccount);

module.exports = router;