const express = require('express');
const router = express.Router();
const doadorController = require('../controllers/doadorController');

router.post('/', doadorController.create);

router.get('/', doadorController.findAll);

router.get('/:id', doadorController.findById);

router.put('/:id', doadorController.update);

router.delete('/:id', doadorController.delete);

router.get('/:id/doacoes', doadorController.findDoacoes);

module.exports = router;