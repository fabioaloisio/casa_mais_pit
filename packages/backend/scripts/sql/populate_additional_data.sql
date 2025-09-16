-- ===========================================
-- SCRIPT DE POPULAÇÃO DE DADOS ADICIONAIS
-- Casa Mais - Sistema de Gestão
-- ===========================================

USE casamais_db;

-- ========================================
-- 1. USUÁRIOS JÁ CRIADOS VIA populate_users_all_profiles.sql
-- ========================================
-- ⚠️ USUÁRIOS REMOVIDOS DESTA SEÇÃO PARA EVITAR DUPLICAÇÃO
-- ✅ Use o script populate_users_all_profiles.sql para criar usuários
-- 🔐 Este script apenas cria dados complementares (internações, consultas, etc.)
-- ========================================

-- ========================================
-- 2. POPULAR TABELA INTERNACOES
-- ========================================
INSERT INTO internacoes (assistida_id, data_entrada, data_saida, motivo, observacoes, status, usuario_entrada_id) VALUES
(1, '2025-01-05 14:00:00', NULL, 'Tratamento inicial - dependência química', 'Paciente cooperativa, bom estado geral', 'ativa', 1),
(2, '2024-12-20 10:00:00', '2025-01-20 09:00:00', 'Reabilitação completa', 'Alta com sucesso após 30 dias de tratamento intensivo', 'finalizada', 1),
(3, '2025-01-10 16:30:00', NULL, 'Desintoxicação alcoólica', 'Acompanhamento médico diário necessário, sinais vitais estáveis', 'ativa', 2),
(4, '2024-11-15 09:00:00', '2024-12-15 10:00:00', 'Tratamento psicológico intensivo', 'Evolução positiva, alta com acompanhamento ambulatorial', 'finalizada', 2),
(5, '2025-01-15 11:00:00', NULL, 'Reabilitação social e profissional', 'Participando ativamente das atividades terapêuticas', 'ativa', 3),
(6, '2025-01-18 08:30:00', NULL, 'Tratamento voluntário - dependência múltipla', 'Histórico de recaídas, necessita acompanhamento intensivo', 'ativa', 3),
(7, '2024-10-01 10:00:00', '2024-11-30 14:00:00', 'Desintoxicação e reabilitação', 'Completou tratamento com sucesso', 'finalizada', 1);

-- ========================================
-- 3. POPULAR TABELA CONSULTAS
-- ========================================
INSERT INTO consultas (assistida_id, data_consulta, profissional, tipo_consulta, observacoes, prescricao, status) VALUES
(1, '2025-01-06 10:00:00', 'Dr. Carlos Médico', 'Clínica Geral', 'Avaliação inicial completa, sinais vitais normais, exames solicitados', 'Paracetamol 750mg 8/8h se dor | Omeprazol 20mg 1x ao dia', 'realizada'),
(1, '2025-01-13 14:00:00', 'Dra. Ana Psiquiatra', 'Psiquiatria', 'Ansiedade moderada, iniciando tratamento medicamentoso', 'Clonazepam 0,5mg 1x ao dia à noite | Sertralina 50mg 1x manhã', 'realizada'),
(2, '2025-01-07 09:00:00', 'Dr. João Psicólogo', 'Psicologia', 'Primeira sessão terapêutica, boa receptividade ao tratamento', NULL, 'realizada'),
(3, '2025-01-11 15:00:00', 'Dr. Carlos Médico', 'Emergência', 'Crise de abstinência controlada com medicação', 'Diazepam 10mg IM aplicado | Manter observação 24h', 'realizada'),
(3, '2025-01-12 10:00:00', 'Dr. Carlos Médico', 'Retorno', 'Melhora do quadro após medicação de emergência', 'Diazepam 5mg VO 12/12h por 3 dias', 'realizada'),
(4, '2024-11-16 14:30:00', 'Dra. Ana Psiquiatra', 'Psiquiatria', 'Avaliação inicial, depressão moderada', 'Fluoxetina 20mg 1x ao dia', 'realizada'),
(5, '2025-01-16 10:30:00', 'Dra. Maria Nutricionista', 'Nutrição', 'Avaliação nutricional completa, IMC adequado', 'Dieta balanceada 2000kcal/dia, suplementação vitamínica', 'realizada'),
(6, '2025-01-19 09:00:00', 'Dr. Carlos Médico', 'Clínica Geral', 'Check-up inicial, hipertensão leve detectada', 'Losartana 50mg 1x ao dia | Dieta hipossódica', 'realizada'),
(7, '2024-10-02 11:00:00', 'Dr. João Psicólogo', 'Psicologia', 'Sessão inicial de acolhimento', NULL, 'realizada'),
-- Consultas futuras (agendadas)
(1, '2025-01-27 14:00:00', 'Dr. Carlos Médico', 'Retorno', 'Acompanhamento semanal programado', NULL, 'agendada'),
(3, '2025-01-25 10:00:00', 'Dra. Ana Psiquiatra', 'Psiquiatria', 'Reavaliação psiquiátrica', NULL, 'agendada'),
(5, '2025-01-30 15:00:00', 'Dr. João Psicólogo', 'Psicologia', 'Sessão terapêutica semanal', NULL, 'agendada');

-- ========================================
-- 4. POPULAR TABELA DROGAS_UTILIZADAS
-- ========================================
INSERT INTO drogas_utilizadas (assistida_id, substancia_id, idade_inicio, frequencia, tempo_uso, observacoes) VALUES
(1, 1, 18, 'Diária', '10 anos', 'Uso social que evoluiu para dependência após problemas familiares'),
(1, 3, 25, 'Esporádica', '3 anos', 'Uso recreativo em festas, período de maior consumo entre 2020-2023'),
(2, 1, 16, 'Semanal', '15 anos', 'Histórico familiar de alcoolismo, pai e avô com mesma condição'),
(2, 2, 20, 'Diária', '8 anos', 'Iniciou como automedicação para ansiedade, desenvolveu tolerância'),
(3, 1, 14, 'Diária', '12 anos', 'Início muito precoce, ambiente familiar problemático'),
(3, 3, 22, 'Semanal', '2 anos', 'Uso durante período de depressão profunda após perda familiar'),
(4, 12, 30, 'Diária', '5 anos', 'Tabagismo pesado, consumo de 2 maços por dia'),
(4, 1, 25, 'Social', '10 anos', 'Consumo aumentou após divórcio'),
(5, 1, 20, 'Social', '10 anos', 'Uso controlado até perda de emprego em 2024'),
(5, 13, 28, 'Diária', '2 anos', 'Prescrição médica inicial para ansiedade, desenvolveu dependência'),
(6, 3, 19, 'Diária', '8 anos', 'Uso pesado com múltiplas tentativas de parar'),
(6, 1, 17, 'Diária', '10 anos', 'Poliuso com álcool como droga principal'),
(7, 2, 18, 'Ocasional', '5 anos', 'Uso recreativo que se intensificou nos últimos 2 anos');

-- ========================================
-- 5. POPULAR TABELA MEDICAMENTOS_UTILIZADOS
-- ========================================
INSERT INTO medicamentos_utilizados (assistida_id, nome, dosagem, frequencia) VALUES
(1, 'Dipirona 500mg', '1 comprimido', '6/6 horas se dor'),
(1, 'Omeprazol 20mg', '1 cápsula', '1x ao dia em jejum'),
(1, 'Clonazepam 0,5mg', '1 comprimido', '1x ao dia à noite'),
(2, 'Sertralina 50mg', '1 comprimido', '1x ao dia pela manhã'),
(2, 'Vitamina C 500mg', '1 comprimido', '1x ao dia'),
(3, 'Diazepam 10mg', '1 comprimido', '12/12 horas'),
(3, 'Complexo B', '1 comprimido', '1x ao dia após almoço'),
(3, 'Tiamina 300mg', '1 comprimido', '1x ao dia'),
(4, 'Fluoxetina 20mg', '1 cápsula', '1x ao dia manhã'),
(4, 'Metformina 850mg', '1 comprimido', '2x ao dia após refeições'),
(5, 'Losartana 50mg', '1 comprimido', '1x ao dia'),
(5, 'AAS 100mg', '1 comprimido', '1x ao dia após almoço'),
(6, 'Diazepam 5mg', '1 comprimido', '8/8 horas'),
(6, 'Losartana 50mg', '1 comprimido', '1x ao dia manhã'),
(7, 'Vitaminas do Complexo B', '1 comprimido', '1x ao dia');

-- ========================================
-- 6. POPULAR TABELA CAIXA_MOVIMENTACOES
-- ========================================
INSERT INTO caixa_movimentacoes (tipo, categoria, valor, descricao, forma_pagamento, data_movimentacao, doacao_id, despesa_id, usuario_id) VALUES
-- Entradas (doações)
('entrada', 'Doação', 150.00, 'Doação mensal - Maria Silva', 'pix', '2025-01-05 10:00:00', 1, NULL, 2),
('entrada', 'Doação', 200.00, 'Doação - João Pedro', 'transferencia', '2025-01-04 14:00:00', 3, NULL, 2),
('entrada', 'Doação', 300.00, 'Doação especial - Carlos Eduardo', 'pix', '2025-01-02 11:30:00', 4, NULL, 2),
('entrada', 'Doação', 1000.00, 'Doação corporativa mensal - Supermercado', 'transferencia', '2025-01-05 16:00:00', 8, NULL, 2),
('entrada', 'Doação', 750.00, 'Parceria solidária - Farmácia', 'transferencia', '2025-01-04 09:00:00', 10, NULL, 2),
-- Saídas (despesas)
('saida', 'Medicamentos', 450.75, 'Compra de medicamentos básicos', 'pix', '2025-01-05 11:00:00', NULL, 1, 2),
('saida', 'Utilidades', 235.50, 'Conta de energia elétrica - janeiro', 'boleto', '2025-01-10 09:00:00', NULL, 2, 2),
('saida', 'Alimentação', 890.30, 'Compra mensal de alimentos', 'cartao_debito', '2025-01-12 15:00:00', NULL, 3, 2),
('saida', 'Manutenção', 180.00, 'Manutenção ar condicionado', 'dinheiro', '2025-01-15 14:00:00', NULL, 4, 3),
('saida', 'Limpeza', 125.90, 'Material de limpeza e higiene', 'pix', '2025-01-18 10:30:00', NULL, 5, 3),
('saida', 'Transporte', 150.00, 'Combustível veículo institucional', 'cartao_credito', '2025-01-20 16:00:00', NULL, 6, 3),
-- Ajustes
('ajuste', 'Correção', 10.00, 'Ajuste de troco - caixa pequeno', 'dinheiro', '2025-01-15 17:00:00', NULL, NULL, 2),
('ajuste', 'Correção', -5.50, 'Correção lançamento duplicado', 'dinheiro', '2025-01-18 18:00:00', NULL, NULL, 2);

-- ========================================
-- 7. POPULAR TABELA CAIXA_FECHAMENTOS
-- ========================================
INSERT INTO caixa_fechamentos (data_fechamento, saldo_inicial, total_entradas, total_saidas, saldo_final, usuario_id, observacoes) VALUES
('2025-01-31', 5000.00, 2400.00, 2032.45, 5367.55, 2, 'Fechamento mensal de janeiro/2025'),
('2024-12-31', 3500.00, 3200.00, 1700.00, 5000.00, 2, 'Fechamento mensal de dezembro/2024');

-- ========================================
-- VERIFICAÇÃO DOS DADOS INSERIDOS
-- ========================================
SELECT 'DADOS ADICIONAIS INSERIDOS COM SUCESSO!' as status;
SELECT '=== RESUMO DAS INSERÇÕES ===' as info;
SELECT 'Usuários:', COUNT(*) as total FROM usuarios;
SELECT 'Internações:', COUNT(*) as total FROM internacoes;
SELECT 'Consultas:', COUNT(*) as total FROM consultas;
SELECT 'Drogas Utilizadas:', COUNT(*) as total FROM drogas_utilizadas;
SELECT 'Medicamentos Utilizados:', COUNT(*) as total FROM medicamentos_utilizados;
SELECT 'Movimentações de Caixa:', COUNT(*) as total FROM caixa_movimentacoes;
SELECT 'Fechamentos de Caixa:', COUNT(*) as total FROM caixa_fechamentos;

-- Estatísticas úteis
SELECT '=== ESTATÍSTICAS ===' as info;
SELECT 'Internações Ativas:', COUNT(*) as total FROM internacoes WHERE status = 'ativa';
SELECT 'Consultas Agendadas:', COUNT(*) as total FROM consultas WHERE status = 'agendada';
SELECT 'Total em Caixa:',
  (SELECT COALESCE(SUM(CASE WHEN tipo = 'entrada' THEN valor WHEN tipo = 'saida' THEN -valor ELSE valor END), 0)
   FROM caixa_movimentacoes) as saldo_atual;
