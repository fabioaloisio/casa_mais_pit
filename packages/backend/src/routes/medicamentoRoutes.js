const express = require('express');
const medicamentoController = require('../controllers/medicamentoController');

const router = express.Router();

router.get('/', medicamentoController.getAll);
router.get('/:id', medicamentoController.getById);
router.post('/', medicamentoController.create);
router.put('/:id', medicamentoController.update);
router.delete('/:id', medicamentoController.delete);


module.exports = router;