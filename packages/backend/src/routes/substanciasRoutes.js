const express = require('express');
const substanciasController = require('../controllers/substanciaController');
// const { verifyToken, requirePermission } = require('../middleware/authMiddleware');

const router = express.Router();

// RF_B2 - Gerenciar Tipos de Substâncias Psicoativas (Administrador e Colaborador)
router.get('/', substanciasController.getAll);          // Listar todas as substâncias
router.get('/:id', substanciasController.getById);      // Buscar substância por ID
router.post('/', substanciasController.create);        // Criar nova substância
router.put('/:id', substanciasController.update);      // Atualizar substância existente
router.delete('/:id', substanciasController.delete);   // Excluir substância

module.exports = router;
