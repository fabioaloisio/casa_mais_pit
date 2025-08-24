const express = require('express')
const assistidaController = require('../controllers/assistidaController')

const router = express.Router()

// rotas crud
router.get('/', assistidaController.getAll)
router.get('/estatisticas', assistidaController.estatisticas);
router.get('/:id', assistidaController.getById)
router.post('/', assistidaController.create);
router.put('/:id', assistidaController.update);
router.delete('/:id', assistidaController.detete);

module.exports = router