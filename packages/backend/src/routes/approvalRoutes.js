const express = require('express');
const approvalController = require('../controllers/approvalController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Rotas de aprovação (apenas administradores)
router.get('/pending', verifyToken, requireAdmin, approvalController.listPending);
router.post('/:id/approve', verifyToken, requireAdmin, approvalController.approve);
router.post('/:id/reject', verifyToken, requireAdmin, approvalController.reject);
router.post('/:id/resend-activation', verifyToken, requireAdmin, approvalController.resendActivationEmail);

// Rotas de ativação (públicas - para usuários aprovados)
router.get('/activate/:token', approvalController.validateActivationToken);
router.post('/activate', approvalController.activateAccount);

module.exports = router;