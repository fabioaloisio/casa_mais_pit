const express = require('express');
const router = express.Router();
const doacaoController = require('../controllers/doacaoController');

// Rotas principais
router.post('/', doacaoController.criar);
router.get('/', doacaoController.listar);
router.get('/estatisticas', doacaoController.estatisticas);
router.get('/:id', doacaoController.buscarPorId);
router.get('/doador/:doadorId', doacaoController.buscarPorDoador);
router.put('/:id', doacaoController.atualizar);
router.delete('/:id', doacaoController.excluir); // Retorna erro 403 - Doações não podem ser excluídas

module.exports = router;