const express = require('express');
const router = express.Router();
const relatorioController = require('../controllers/relatorioController');
const { verifyToken, requirePermission } = require('../middleware/authMiddleware');

// RF_S1 - Relatório de Assistidas (Administrador e Colaborador)
router.get('/assistidas', verifyToken, requirePermission('RF_S1'), relatorioController.relatorioAssistidas);

// RF_S2 - Relatório de Despesas (Apenas Administrador)
router.get('/despesas', verifyToken, requirePermission('RF_S2'), relatorioController.relatorioDespesas);

// RF_S3 - Relatório de Consultas (Administrador e Colaborador)
router.get('/consultas', verifyToken, requirePermission('RF_S3'), relatorioController.relatorioConsultas);

// RF_S4 - Relatório de Doações (Apenas Administrador)
router.get('/doacoes', verifyToken, requirePermission('RF_S4'), relatorioController.relatorioDoacoes);

// RF_S5 - Relatório de Medicamentos (Administrador e Colaborador)
router.get('/medicamentos', verifyToken, requirePermission('RF_S5'), relatorioController.relatorioMedicamentos);

// RF_S6 - Relatório de Internações (Administrador e Colaborador)
router.get('/internacoes', verifyToken, requirePermission('RF_S6'), relatorioController.relatorioInternacoes);

// RF_S7 - Relatório de Doadores (Apenas Administrador)
router.get('/doadores', verifyToken, requirePermission('RF_S7'), relatorioController.relatorioDoadores);

// Relatório de Vendas (Administrador e Financeiro)
router.get('/vendas', verifyToken, requirePermission('RF_B4'), relatorioController.relatorioVendas);

// Relatórios adicionais (úteis para gestão)
// Dashboard geral - mesmo acesso que RF_S1
router.get('/dashboard', verifyToken, requirePermission('RF_S1'), relatorioController.dashboard);

// Relatório gerencial consolidado - apenas Admin (mesmo acesso que RF_S2)
router.get('/gerencial', verifyToken, requirePermission('RF_S2'), relatorioController.relatorioGerencial);

// Exportação PDF - Relatórios
router.post('/assistidas/pdf', verifyToken, requirePermission('RF_S1'), relatorioController.exportarAssistidasPDF);
router.post('/despesas/pdf', verifyToken, requirePermission('RF_S2'), relatorioController.exportarDespesasPDF);
router.post('/consultas/pdf', verifyToken, requirePermission('RF_S3'), relatorioController.exportarConsultasPDF);
router.post('/doacoes/pdf', verifyToken, requirePermission('RF_S4'), relatorioController.exportarDoacoesPDF);
router.post('/medicamentos/pdf', verifyToken, requirePermission('RF_S5'), relatorioController.exportarMedicamentosPDF);
router.post('/internacoes/pdf', verifyToken, requirePermission('RF_S6'), relatorioController.exportarInternacoesPDF);
router.post('/doadores/pdf', verifyToken, requirePermission('RF_S7'), relatorioController.exportarDoadoresPDF);
router.post('/caixa/pdf', verifyToken, requirePermission('RF_S1'), relatorioController.exportarCaixaPDF);

// Exportação Excel - Relatórios
router.post('/assistidas/excel', verifyToken, requirePermission('RF_S1'), relatorioController.exportarAssistidasExcel);
router.post('/despesas/excel', verifyToken, requirePermission('RF_S2'), relatorioController.exportarDespesasExcel);
router.post('/consultas/excel', verifyToken, requirePermission('RF_S3'), relatorioController.exportarConsultasExcel);
router.post('/doacoes/excel', verifyToken, requirePermission('RF_S4'), relatorioController.exportarDoacoesExcel);
router.post('/medicamentos/excel', verifyToken, requirePermission('RF_S5'), relatorioController.exportarMedicamentosExcel);
router.post('/internacoes/excel', verifyToken, requirePermission('RF_S6'), relatorioController.exportarInternacoesExcel);
router.post('/doadores/excel', verifyToken, requirePermission('RF_S7'), relatorioController.exportarDoadoresExcel);
router.post('/caixa/excel', verifyToken, requirePermission('RF_S1'), relatorioController.exportarCaixaExcel);

// Endpoints para gráficos
router.get('/graficos/assistidas', verifyToken, requirePermission('RF_S1'), relatorioController.graficosAssistidas);
router.get('/graficos/medicamentos', verifyToken, requirePermission('RF_S5'), relatorioController.graficosMedicamentos);
router.get('/graficos/doacoes', verifyToken, requirePermission('RF_S4'), relatorioController.graficosDoacoes);
router.get('/graficos/despesas', verifyToken, requirePermission('RF_S2'), relatorioController.graficosDespesas);
router.get('/graficos/internacoes', verifyToken, requirePermission('RF_S6'), relatorioController.graficosInternacoes);
router.get('/graficos/consultas', verifyToken, requirePermission('RF_S3'), relatorioController.graficosConsultas);
router.get('/graficos/caixa', verifyToken, requirePermission('RF_S1'), relatorioController.graficosCaixa);


module.exports = router;