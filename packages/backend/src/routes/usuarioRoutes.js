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

module.exports = router;