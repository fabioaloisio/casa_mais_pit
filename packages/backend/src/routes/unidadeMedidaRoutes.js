const express = require('express');
const unidadeMedidaController = require('../controllers/unidadeMedidaController');

const router = express.Router();

router.get('/', unidadeMedidaController.getAll);
router.get('/:id', unidadeMedidaController.getById);
router.post('/', unidadeMedidaController.create);
router.put('/:id', unidadeMedidaController.update);
router.delete('/:id', unidadeMedidaController.delete);

module.exports = router;