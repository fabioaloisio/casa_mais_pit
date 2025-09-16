const express = require('express');
const tipoDespesaController = require('../controllers/tipoDespesaController');

const router = express.Router();

router.get('/', tipoDespesaController.getAll);
router.get('/:id', tipoDespesaController.getById);
router.post('/', tipoDespesaController.create);
router.put('/:id', tipoDespesaController.update);
router.delete('/:id', tipoDespesaController.delete);

module.exports = router;