const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Rota de login
router.post('/login', authController.login);

// Rota de cadastro
router.post('/register', authController.register);

// Rota para verificar dados do usuário logado
router.get('/me', authController.verifyToken, authController.me);

module.exports = router;