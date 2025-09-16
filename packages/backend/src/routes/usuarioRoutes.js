const express = require('express');
const usuarioController = require('../controllers/usuarioController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Todas as rotas de usuários requerem autenticação
router.use(verifyToken);

// Rotas que requerem permissão de administrador
router.get('/', requireAdmin, usuarioController.listarTodos);
router.post('/', requireAdmin, usuarioController.criar);
router.get('/:id', requireAdmin, usuarioController.buscarPorId);
router.put('/:id', requireAdmin, usuarioController.atualizar);
router.delete('/:id', requireAdmin, usuarioController.excluir);
router.put('/:id/status', requireAdmin, usuarioController.alterarStatus);

// Novas rotas para gerenciamento de status
router.post('/:id/approve', requireAdmin, usuarioController.approveUser);
router.post('/:id/reject', requireAdmin, usuarioController.rejectUser);
router.post('/:id/block', requireAdmin, usuarioController.blockUser);
router.post('/:id/unblock', requireAdmin, usuarioController.unblockUser);
router.post('/:id/suspend', requireAdmin, usuarioController.suspendUser);
router.post('/:id/reactivate', requireAdmin, usuarioController.reactivateUser);
router.get('/:id/status-history', requireAdmin, usuarioController.getUserStatusHistory);
router.get('/status/statistics', requireAdmin, usuarioController.getStatusStatistics);

module.exports = router;