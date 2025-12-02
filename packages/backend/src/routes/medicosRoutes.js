const express = require('express');
const router = express.Router();
const medicosController = require('../controllers/medicosController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, medicosController.listMedicos);

router.get('/:id', verifyToken, medicosController.getMedicoById);

router.post('/', verifyToken, medicosController.createMedico);

router.put('/:id', verifyToken, medicosController.updateMedico);

router.delete('/:id', verifyToken, medicosController.deleteMedico);

module.exports = router;
