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
INSERT INTO consultas (assistida_id, data_consulta, medico_id, tipo_consulta, observacoes, prescricao, status) VALUES
(1, '2025-01-06 10:00:00', 1, 'Clínica Geral', 'Avaliação inicial completa, sinais vitais normais, exames solicitados', 'Paracetamol 750mg 8/8h se dor | Omeprazol 20mg 1x ao dia', 'realizada'),
(1, '2025-01-13 14:00:00', 2, 'Psiquiatria', 'Ansiedade moderada, iniciando tratamento medicamentoso', 'Clonazepam 0,5mg 1x ao dia à noite | Sertralina 50mg 1x manhã', 'realizada'),
(2, '2025-01-07 09:00:00', 3, 'Psicologia', 'Primeira sessão terapêutica, boa receptividade ao tratamento', NULL, 'realizada'),
(3, '2025-01-11 15:00:00', 1, 'Emergência', 'Crise de abstinência controlada com medicação', 'Diazepam 10mg IM aplicado | Manter observação 24h', 'realizada'),
(3, '2025-01-12 10:00:00', 1, 'Retorno', 'Melhora do quadro após medicação de emergência', 'Diazepam 5mg VO 12/12h por 3 dias', 'realizada'),
(4, '2024-11-16 14:30:00', 2, 'Psiquiatria', 'Avaliação inicial, depressão moderada', 'Fluoxetina 20mg 1x ao dia', 'realizada'),
(5, '2025-01-16 10:30:00', 4, 'Nutrição', 'Avaliação nutricional completa, IMC adequado', 'Dieta balanceada 2000kcal/dia, suplementação vitamínica', 'realizada'),
(6, '2025-01-19 09:00:00', 1, 'Clínica Geral', 'Check-up inicial, hipertensão leve detectada', 'Losartana 50mg 1x ao dia | Dieta hipossódica', 'realizada'),
(7, '2024-10-02 11:00:00', 3, 'Psicologia', 'Sessão inicial de acolhimento', NULL, 'realizada'),
-- Consultas futuras (agendadas)
(1, '2025-01-27 14:00:00', 1, 'Retorno', 'Acompanhamento semanal programado', NULL, 'agendada'),
(3, '2025-01-25 10:00:00', 2, 'Psiquiatria', 'Reavaliação psiquiátrica', NULL, 'agendada'),
(5, '2025-01-30 15:00:00', 3, 'Psicologia', 'Sessão terapêutica semanal', NULL, 'agendada');

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
-- 8. POPULAR TABELA CAMPANHAS
-- ========================================
INSERT INTO campanhas (nome, descricao, meta_valor, data_inicio, data_fim, status, tipo, criado_por) VALUES
-- Campanhas ativas
('Campanha de Natal 2024', 'Arrecadação de fundos para cestas básicas e presentes de Natal para as assistidas e suas famílias. Vamos levar esperança e alegria neste Natal!', 15000.00, '2024-11-15', '2024-12-25', 'encerrada', 'sazonal', 2),
('Reforma do Telhado', 'Campanha emergencial para reforma completa do telhado da casa de acolhimento. Situação crítica com infiltrações que prejudicam o bem-estar das assistidas.', 25000.00, '2024-10-01', '2025-02-28', 'ativa', 'emergencia', 3),
('Projeto Horta Comunitária', 'Criação de uma horta orgânica para as assistidas cultivarem alimentos saudáveis, promovendo terapia ocupacional e sustentabilidade.', 8000.00, '2025-01-01', '2025-03-31', 'ativa', 'projeto', 2),
('Fundo de Emergência Médica', 'Manutenção de um fundo permanente para cobrir despesas médicas emergenciais e medicamentos não disponíveis no SUS.', 20000.00, '2025-01-01', NULL, 'ativa', 'continua', 3),
('Campanha de Páscoa 2025', 'Arrecadação para realizar uma celebração especial de Páscoa, com atividades, almoço festivo e distribuição de ovos de chocolate.', 5000.00, '2025-03-01', '2025-04-20', 'planejada', 'sazonal', 2),
-- Campanhas passadas
('Mutirão de Inverno 2024', 'Arrecadação de agasalhos, cobertores e roupas de frio para as assistidas enfrentarem o inverno com dignidade.', 10000.00, '2024-05-01', '2024-07-31', 'encerrada', 'sazonal', 3),
('Dia das Mães Especial', 'Celebração do Dia das Mães com atividades terapêuticas e presentes personalizados para fortalecer a autoestima.', 3000.00, '2024-04-15', '2024-05-12', 'encerrada', 'sazonal', 2);

-- ========================================
-- 9. POPULAR TABELA DOADORES_CAMPANHAS (N:N)
-- ========================================
INSERT INTO doadores_campanhas (doador_id, campanha_id, valor_doado, data_contribuicao, forma_pagamento, recibo_numero, anonimo, mensagem, status, usuario_registro_id) VALUES
-- Doações para Campanha de Natal 2024 (encerrada com sucesso)
(1, 1, 2000.00, '2024-11-20 10:00:00', 'PIX', 'RC2024001', FALSE, 'Feliz em poder ajudar neste Natal!', 'confirmada', 2),
(2, 1, 1500.00, '2024-11-25 14:30:00', 'Transferência', 'RC2024002', FALSE, NULL, 'confirmada', 2),
(3, 1, 500.00, '2024-12-01 09:15:00', 'Dinheiro', 'RC2024003', FALSE, 'Que todas tenham um Natal abençoado', 'confirmada', 3),
(4, 1, 3000.00, '2024-12-05 16:45:00', 'Cartão', 'RC2024004', FALSE, NULL, 'confirmada', 2),
(5, 1, 1000.00, '2024-12-10 11:00:00', 'PIX', 'RC2024005', TRUE, NULL, 'confirmada', 3),
(6, 1, 2500.00, '2024-12-15 13:20:00', 'Boleto', 'RC2024006', FALSE, 'Parabéns pelo trabalho maravilhoso!', 'confirmada', 2),
(7, 1, 4000.00, '2024-12-20 10:30:00', 'PIX', 'RC2024007', FALSE, NULL, 'confirmada', 3),
(8, 1, 1800.00, '2024-12-22 15:00:00', 'Transferência', 'RC2024008', FALSE, 'Espero que ajude!', 'confirmada', 2),

-- Doações para Reforma do Telhado (em andamento)
(1, 2, 3000.00, '2024-10-15 08:30:00', 'PIX', 'RC2024010', FALSE, 'Para a reforma urgente do telhado', 'confirmada', 3),
(3, 2, 5000.00, '2024-10-20 14:00:00', 'Transferência', 'RC2024011', FALSE, NULL, 'confirmada', 3),
(4, 2, 2000.00, '2024-11-10 10:45:00', 'Cartão', 'RC2024012', FALSE, 'Sucesso na reforma!', 'confirmada', 2),
(5, 2, 1500.00, '2024-12-05 09:30:00', 'PIX', 'RC2024013', TRUE, NULL, 'confirmada', 3),
(9, 2, 4000.00, '2025-01-10 11:15:00', 'Boleto', 'RC2025001', FALSE, 'Contribuindo para um ambiente seguro', 'confirmada', 2),
(10, 2, 3500.00, '2025-01-15 16:00:00', 'PIX', 'RC2025002', FALSE, NULL, 'confirmada', 3),

-- Doações para Projeto Horta Comunitária
(2, 3, 1000.00, '2025-01-05 10:00:00', 'PIX', 'RC2025003', FALSE, 'Apoiando a sustentabilidade!', 'confirmada', 2),
(6, 3, 800.00, '2025-01-08 14:30:00', 'Dinheiro', 'RC2025004', FALSE, NULL, 'confirmada', 3),
(7, 3, 1500.00, '2025-01-12 09:45:00', 'Transferência', 'RC2025005', FALSE, 'Projeto incrível!', 'confirmada', 2),
(11, 3, 600.00, '2025-01-18 11:00:00', 'PIX', 'RC2025006', FALSE, NULL, 'confirmada', 3),

-- Doações para Fundo de Emergência Médica
(1, 4, 1000.00, '2025-01-02 08:00:00', 'PIX', 'RC2025007', FALSE, 'Saúde em primeiro lugar', 'confirmada', 2),
(3, 4, 2000.00, '2025-01-10 15:30:00', 'Cartão', 'RC2025008', FALSE, NULL, 'confirmada', 3),
(8, 4, 1500.00, '2025-01-15 10:15:00', 'Transferência', 'RC2025009', FALSE, 'Para emergências médicas', 'confirmada', 2),
(12, 4, 500.00, '2025-01-20 13:45:00', 'Dinheiro', 'RC2025010', TRUE, NULL, 'confirmada', 3),

-- Doações para campanhas passadas (para histórico)
(2, 6, 800.00, '2024-05-10 10:00:00', 'PIX', 'RC2024020', FALSE, 'Agasalhos para todas!', 'confirmada', 3),
(4, 6, 1200.00, '2024-06-01 14:00:00', 'Boleto', 'RC2024021', FALSE, NULL, 'confirmada', 2),
(5, 6, 600.00, '2024-06-15 09:30:00', 'Dinheiro', 'RC2024022', TRUE, NULL, 'confirmada', 3),
(7, 7, 500.00, '2024-04-20 11:00:00', 'PIX', 'RC2024030', FALSE, 'Feliz Dia das Mães!', 'confirmada', 2),
(9, 7, 750.00, '2024-05-01 15:00:00', 'Cartão', 'RC2024031', FALSE, NULL, 'confirmada', 3),

-- Múltiplas doações do mesmo doador para diferentes campanhas (demonstrando N:N)
(1, 3, 500.00, '2025-01-19 10:30:00', 'PIX', 'RC2025011', FALSE, 'Segunda contribuição para a horta', 'confirmada', 2),
(3, 3, 400.00, '2025-01-20 14:15:00', 'Dinheiro', 'RC2025012', FALSE, NULL, 'confirmada', 3),
(3, 4, 800.00, '2025-01-21 09:00:00', 'PIX', 'RC2025013', FALSE, 'Contribuindo também para o fundo médico', 'confirmada', 2);

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
SELECT 'Campanhas:', COUNT(*) as total FROM campanhas;
SELECT 'Doadores em Campanhas:', COUNT(*) as total FROM doadores_campanhas;

-- Estatísticas úteis
SELECT '=== ESTATÍSTICAS ===' as info;
SELECT 'Internações Ativas:', COUNT(*) as total FROM internacoes WHERE status = 'ativa';
SELECT 'Consultas Agendadas:', COUNT(*) as total FROM consultas WHERE status = 'agendada';
SELECT 'Campanhas Ativas:', COUNT(*) as total FROM campanhas WHERE status = 'ativa';
SELECT 'Total Arrecadado em Campanhas:', COALESCE(SUM(valor_doado), 0) as total FROM doadores_campanhas WHERE status = 'confirmada';
SELECT 'Total em Caixa:',
  (SELECT COALESCE(SUM(CASE WHEN tipo = 'entrada' THEN valor WHEN tipo = 'saida' THEN -valor ELSE valor END), 0)
   FROM caixa_movimentacoes) as saldo_atual;
