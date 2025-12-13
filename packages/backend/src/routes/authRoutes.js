const express = require('express');
const authController = require('../controllers/authController');
const passwordController = require('../controllers/passwordController');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Rota de login
router.post('/login', authController.login);

// Rota de cadastro
router.post('/register', authController.register);

// Rota para verificar dados do usuário logado
router.get('/me', verifyToken, authController.me);

// Rotas de recuperação de senha (públicas)
router.post('/forgot-password', passwordController.forgotPassword);
router.post('/reset-password', passwordController.resetPassword);
router.get('/validate-reset-token/:token', passwordController.validateResetToken);

// Rota de alteração de senha (protegida)
router.put('/change-password', verifyToken, passwordController.changePassword);

module.exports = router;
