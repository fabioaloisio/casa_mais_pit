const express = require('express');
const router = express.Router();
const consultaController = require('../controllers/consultaController');
const { verifyToken, requirePermission } = require('../middleware/authMiddleware');

// Estatísticas de consultas (DEVE VIR ANTES das rotas parametrizadas)
router.get('/estatisticas', verifyToken, requirePermission('RF_F6'), consultaController.estatisticas);

// RF_F6 - Gerenciar Consultas (Administrador e Colaborador)
router.post('/', verifyToken, requirePermission('RF_F6'), consultaController.criar);
router.get('/', verifyToken, requirePermission('RF_F6'), consultaController.listar);
router.get('/:id', verifyToken, requirePermission('RF_F6'), consultaController.buscarPorId);
router.put('/:id', verifyToken, requirePermission('RF_F6'), consultaController.atualizar);
router.delete('/:id/cancelar', verifyToken, requirePermission('RF_F6'), consultaController.cancelar);

// RF_F7 - Lançar Prescrição (Administrador e Colaborador)
router.post('/:id/prescricao', verifyToken, requirePermission('RF_F7'), consultaController.lancarPrescricao);

// RF_F8 - Lançar História Patológica Pregressa (Administrador e Colaborador)
router.post('/:id/historia-patologica', verifyToken, requirePermission('RF_F8'), consultaController.lancarHistoriaPatologica);

// RF_F9 - Registrar Dados Pós-Consulta (Administrador e Colaborador)
router.post('/:id/pos-consulta', verifyToken, requirePermission('RF_F9'), consultaController.registrarPosConsulta);

module.exports = router;