const express = require('express');
const hprController = require('../controllers/hprController');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Rotas CRUD para HPR
router.get('/', hprController.getAll);             // Listar todos os HPRs

// Listar HPRs de uma assistida (também protegido)
router.get('/:id', verifyToken, hprController.getById);
// Criar uma nova HPR (somente usuários autenticados)
router.post('/', verifyToken, hprController.create);
router.put('/:id', hprController.update);         // Atualizar HPR
router.delete('/:id', hprController.delete);      // Deletar HPR


module.exports = router;
