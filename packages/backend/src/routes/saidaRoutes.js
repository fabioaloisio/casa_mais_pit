
const express = require('express');
const saidaController = require('../controllers/saidaController');

const router = express.Router();

// Rotas principais
router.get('/', saidaController.getAll);
router.get('/:id', saidaController.getById);
router.post('/', saidaController.create);
router.put('/:id', saidaController.update);
router.delete('/:id', saidaController.delete);

module.exports = router;

