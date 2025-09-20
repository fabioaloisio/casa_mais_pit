const express = require('express');
const despesaController = require('../controllers/despesaController');

const router = express.Router();

// Rotas básicas CRUD
router.get('/', despesaController.getAll);
router.get('/:id', despesaController.getById);
router.post('/', despesaController.create);
router.put('/:id', despesaController.update);
router.delete('/:id', despesaController.delete);

// Rotas especiais
router.get('/estatisticas', despesaController.getEstatisticas);
router.get('/categoria/:categoria', despesaController.getByCategoria);
router.get('/periodo/:dataInicio/:dataFim', despesaController.getByPeriodo);
router.get('/status/:status', despesaController.getByStatus);

module.exports = router;