const express = require('express');
const hprController = require('../controllers/hprController');

const router = express.Router();

// Rotas CRUD para HPR
router.get('/', hprController.getAll);             // Listar todos os HPRs
router.get('/:id', hprController.getById);
router.post('/', hprController.create);           // Criar HPR
router.put('/:id', hprController.update);         // Atualizar HPR
router.delete('/:id', hprController.delete);      // Deletar HPR

module.exports = router;
