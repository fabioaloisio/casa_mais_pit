-- Script para popular todas as tabelas com dados de exemplo

USE casamais_db;

-- 1. Popular tipos_despesas
INSERT INTO tipos_despesas
  (nome, descricao, ativo)
VALUES
  ('Alimentação', 'Gastos com alimentação, merenda e suprimentos alimentícios', 1),
  ('Medicamentos', 'Gastos com medicamentos e materiais médicos', 1),
  ('Limpeza e Higiene', 'Produtos de limpeza e higiene pessoal', 1),
  ('Manutenção', 'Reparos e manutenção da infraestrutura', 1),
  ('Utilidades', 'Água, luz, telefone e internet', 1),
  ('Transporte', 'Gastos com transporte e combustível', 1),
  ('Material de Escritório', 'Papelaria e materiais administrativos', 1),
  ('Recursos Humanos', 'Salários, benefícios e treinamentos', 1),
  ('Equipamentos', 'Compra e manutenção de equipamentos', 1),
  ('Outros', 'Despesas diversas não categorizadas', 1);

-- 2. Popular doadores
INSERT INTO doadores
  (tipo_doador, nome, documento, email, telefone, endereco, cidade, estado, cep, ativo)
VALUES
  -- DOADORES ATIVOS COM DOAÇÕES (IDs 1-8)
  ('PF', 'Maria Silva Santos', '97200167606', 'maria.silva@email.com', '11987654321', 'Rua das Flores, 123', 'São Paulo', 'SP', '01234567', 1),
  ('PF', 'João Pedro Oliveira', '57813901037', 'joao.pedro@email.com', '11976543210', 'Av. Paulista, 456', 'São Paulo', 'SP', '01311000', 1),
  ('PF', 'Carlos Eduardo Lima', '65773830655', 'carlos.lima@email.com', '11954321098', 'Rua Oscar Freire, 321', 'São Paulo', 'SP', '01426001', 1),
  ('PF', 'Roberto Alves Souza', '47303095020', 'roberto.souza@email.com', '11932109876', 'Rua Haddock Lobo, 987', 'São Paulo', 'SP', '01414001', 1),
  ('PF', 'Fernanda Rodrigues', '58525383880', 'fernanda.r@email.com', '11921098765', 'Av. Rebouças, 147', 'São Paulo', 'SP', '05401300', 1),
  ('PF', 'Mariana Gomes', '01650993560', 'mariana.gomes@email.com', '11909876543', 'Av. Consolação, 369', 'São Paulo', 'SP', '01301100', 1),
  ('PJ', 'Supermercado Bom Preço LTDA', '68569796000131', 'contato@bompreco.com.br', '1133334444', 'Av. do Comércio, 1000', 'São Paulo', 'SP', '03031000', 1),
  ('PJ', 'Farmácia Saúde & Vida ME', '20729550000153', 'contato@saudevida.com.br', '1144445555', 'Rua da Saúde, 200', 'São Paulo', 'SP', '04038001', 1),

  -- DOADORES INATIVOS SEM DOAÇÕES (IDs 9-12)
  ('PF', 'Ana Beatriz Costa', '02951994150', 'ana.costa@email.com', '11965432109', 'Rua Augusta, 789', 'São Paulo', 'SP', '01305100', 0),
  ('PF', 'Juliana Ferreira', '41682563677', 'juliana.f@email.com', '11943210987', 'Av. Faria Lima, 654', 'São Paulo', 'SP', '01452000', 0),
  ('PJ', 'Padaria Pão Quente EIRELI', '28097821000107', 'contato@paoquente.com.br', '1155556666', 'Av. São João, 300', 'São Paulo', 'SP', '01035000', 0),
  ('PJ', 'Auto Peças Central LTDA', '64040600000166', 'vendas@autopecas.com.br', '1166667777', 'Rua do Gasômetro, 400', 'São Paulo', 'SP', '04047020', 0),

  -- DOADORES ATIVOS SEM DOAÇÕES - PODEM SER EXCLUÍDOS (IDs 13-16)
  ('PF', 'Paulo Henrique Silva', '57352730869', 'paulo.silva@email.com', '11910987654', 'Rua Cardeal Arcoverde, 258', 'São Paulo', 'SP', '05407002', 1),
  ('PF', 'Ricardo Martins', '28937353989', 'ricardo.m@email.com', '11898765432', 'Rua da Consolação, 741', 'São Paulo', 'SP', '01302907', 1),
  ('PJ', 'Restaurante Sabor Caseiro ME', '67444698000105', 'contato@saborcaseiro.com.br', '1177778888', 'Av. Lins de Vasconcelos, 500', 'São Paulo', 'SP', '01538001', 1),
  ('PJ', 'Loja de Roupas Fashion LTDA', '12345678000195', 'contato@fashionloja.com.br', '1188889999', 'Rua 25 de Março, 600', 'São Paulo', 'SP', '01021200', 1),

  -- DOADORES INATIVOS SEM DOAÇÕES - PODEM SER EXCLUÍDOS (IDs 17-20)
  ('PF', 'Lucas Pereira Santos', '88776655443', 'lucas.santos@email.com', '11999887766', 'Av. Brigadeiro Faria Lima, 800', 'São Paulo', 'SP', '01451000', 0),
  ('PF', 'Camila Souza Lima', '77665544332', 'camila.lima@email.com', '11988776655', 'Rua Pamplona, 900', 'São Paulo', 'SP', '01405000', 0),
  ('PJ', 'Padaria do Bairro ME', '98765432000187', 'contato@padariadobairro.com.br', '1199998888', 'Rua do Comércio, 700', 'São Paulo', 'SP', '03040000', 0),
  ('PJ', 'Mercado Central EIRELI', '87654321000176', 'vendas@mercadocentral.com.br', '1177776666', 'Av. Celso Garcia, 800', 'São Paulo', 'SP', '03059000', 0);

-- 3. Popular despesas (usando tipo_despesa_id) - Com datas dinâmicas do mês atual
INSERT INTO despesas
  (tipo_despesa_id, descricao, categoria, valor, data_despesa, forma_pagamento, fornecedor, observacoes, status)
VALUES
  (2, 'Compra de medicamentos básicos', 'Medicamentos', 450.75, DATE_SUB(CURDATE(), INTERVAL 10 DAY), 'pix', 'Farmácia Popular', 'Medicamentos para estoque básico', 'paga'),
  (5, 'Conta de energia elétrica', 'Utilidades', 235.50, DATE_SUB(CURDATE(), INTERVAL 9 DAY), 'boleto', 'CPFL Energia', 'Conta do mês atual', 'paga'),
  (1, 'Compra de alimentos para cozinha', 'Alimentação', 890.30, DATE_SUB(CURDATE(), INTERVAL 8 DAY), 'cartao_debito', 'Supermercado Extra', 'Compras mensais', 'paga'),
  (4, 'Manutenção do ar condicionado', 'Manutenção', 180.00, DATE_SUB(CURDATE(), INTERVAL 7 DAY), 'dinheiro', 'Refrigeração Silva', 'Limpeza e manutenção preventiva', 'paga'),
  (3, 'Material de limpeza', 'Limpeza e Higiene', 125.90, DATE_SUB(CURDATE(), INTERVAL 6 DAY), 'pix', 'Distribuidora Limpeza Total', 'Produtos para higienização', 'paga'),
  (6, 'Combustível para veículo institucional', 'Transporte', 150.00, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'cartao_credito', 'Posto Ipiranga', 'Abastecimento van', 'paga'),
  (7, 'Papelaria e material de escritório', 'Material de Escritório', 89.75, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'pix', 'Papelaria Central', 'Canetas, papel, grampos', 'paga'),
  (4, 'Serviços de jardinagem', 'Manutenção', 200.00, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'transferencia', 'João Jardineiro', 'Manutenção do jardim', 'paga'),
  (2, 'Medicamentos especiais', 'Medicamentos', 680.40, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'boleto', 'Farmácia Hospitalar', 'Medicamentos controlados', 'paga'),
  (5, 'Internet banda larga', 'Utilidades', 99.90, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'cartao_credito', 'Vivo Fibra', 'Mensalidade internet', 'paga');

-- 4. Popular doacoes (usando doador_id) - Com datas dinâmicas
-- Apenas doadores ATIVOS (IDs 1-8) têm doações
INSERT INTO doacoes
  (doador_id, valor, data_doacao, observacoes)
VALUES
  -- DOAÇÕES DE DOADORES ATIVOS (IDs 1-8)
  (1, 150.00, DATE_SUB(CURDATE(), INTERVAL 10 DAY), 'Doação mensal - Maria Silva'),
  (1, 100.00, DATE_SUB(CURDATE(), INTERVAL 30 DAY), 'Doação anterior - Maria Silva'),
  (2, 200.00, DATE_SUB(CURDATE(), INTERVAL 9 DAY), 'Doação - João Pedro'),
  (3, 300.00, DATE_SUB(CURDATE(), INTERVAL 8 DAY), 'Doação especial - Carlos Eduardo'),
  (4, 500.00, DATE_SUB(CURDATE(), INTERVAL 7 DAY), 'Doação de fim de mês - Roberto Alves'),
  (5, 120.00, DATE_SUB(CURDATE(), INTERVAL 6 DAY), 'Doação recorrente - Fernanda'),
  (6, 180.00, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'Doação - Mariana Gomes'),
  (7, 1000.00, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'Doação corporativa mensal - Supermercado'),
  (7, 800.00, DATE_SUB(CURDATE(), INTERVAL 20 DAY), 'Doação anterior - Supermercado'),
  (8, 750.00, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'Parceria solidária - Farmácia');

-- Doadores com IDs 13-20 NÃO têm doações e PODEM ser excluídos

-- 5. Popular caixa_movimentacoes (doações monetárias para aparecerem no dashboard)
INSERT INTO caixa_movimentacoes
  (tipo, categoria, valor, data_movimentacao, descricao, doador_id)
VALUES
  ('entrada', 'doacao_monetaria', 500.00, DATE_SUB(CURDATE(), INTERVAL 10 DAY), 'Doação monetária - Maria Silva', 1),
  ('entrada', 'doacao_monetaria', 700.00, DATE_SUB(CURDATE(), INTERVAL 8 DAY), 'Doação monetária - João Pedro', 2),
  ('entrada', 'doacao_monetaria', 900.00, DATE_SUB(CURDATE(), INTERVAL 6 DAY), 'Doação monetária - Carlos Eduardo', 3),
  ('entrada', 'doacao_monetaria', 600.00, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'Doação monetária - Roberto Alves', 4),
  ('entrada', 'doacao_monetaria', 800.00, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'Doação monetária - Supermercado', 7);

INSERT INTO unidades_medida
  (nome, sigla)
VALUES
  ('Grama', 'g'),
  ('Miligrama', 'mg'),
  ('Litro', 'L'),
  ('Mililitro', 'mL'),
  ('Unidade', 'un'),
  ('Ampola', 'amp');


INSERT INTO medicamentos
  (nome, forma_farmaceutica, descricao, unidade_medida_id)
VALUES
  ('Paracetamol 750mg', 'Comprimido', 'Analgésico e antitérmico.', 2),
  ('Amoxicilina 500mg', 'Cápsula', 'Antibiótico de amplo espectro.', 2),
  ('Dipirona 500mg', 'Comprimido', 'Eficaz contra dores e febre.', 2),
  ('Ibuprofeno 600mg', 'Comprimido', 'Anti-inflamatório não esteroide.', 2),
  ('Omeprazol 20mg', 'Cápsula', 'Redução da produção de ácido gástrico.', 2),
  ('Loratadina 10mg', 'Comprimido', 'Antialérgico sem sedação.', 2),
  ('Metformina 850mg', 'Comprimido', 'Controle da glicemia em diabéticos.', 2),
  ('Losartana 50mg', 'Comprimido', 'Uso para pressão arterial.', 2),
  ('Salbutamol 100mcg', 'Spray', 'Broncodilatador para asma.', 5),
  ('Ranitidina 150mg', 'Comprimido', 'Tratamento de úlceras e refluxo.', 2),
  ('Azitromicina 500mg', 'Comprimido', 'Antibiótico para infecções bacterianas.', 2),
  ('Prednisona 20mg', 'Comprimido', 'Corticosteroide para inflamações.', 2),
  ('Dexametasona 4mg', 'Comprimido', 'Anti-inflamatório potente.', 2),
  ('Vitamina C 500mg', 'Comprimido', 'Reforço para imunidade.', 2),
  ('Complexo B', 'Comprimido', 'Suplemento vitamínico.', 2),
  ('Cetirizina 10mg', 'Comprimido', 'Antialérgico eficaz.', 2),
  ('Nimesulida 100mg', 'Comprimido', 'Anti-inflamatório potente.', 2),
  ('Dorflex', 'Comprimido', 'Relaxante muscular e analgésico.', 2),
  ('Buscopan 10mg', 'Comprimido', 'Alívio para cólicas e desconforto abdominal.', 2),
  ('Lactulose 667mg/ml', 'Xarope', 'Tratamento da constipação intestinal.', 4);


-- 7. Popular assistidas (com status 'ativo' padronizado)
INSERT INTO assistidas (
  nome, cpf, rg, idade, data_nascimento, nacionalidade, estado_civil, profissao, escolaridade, status,
  logradouro, bairro, numero, cep, estado, cidade, telefone, telefone_contato
) VALUES
('Maria das Dores', '12345678900', 'MG-12345678', 42, '1983-09-15', 'Brasileira', 'Solteira', 'Cozinheira', 'Fundamental Completo', 'ativo',
 'Rua das Flores', 'Centro', '120', '30100-000', 'MG', 'Belo Horizonte', '31999998888', '31988887777'),
('Ana Paula Lima', '98765432199', 'SP-98765432', 36, '1988-02-20', 'Brasileira', 'Casada', 'Auxiliar de Limpeza', 'Médio Incompleto', 'ativo',
 'Avenida Central', 'Jardim das Palmeiras', '500', '04000-200', 'SP', 'São Paulo', '11912345678', '11934567890'),
('Jéssica Andrade', '11223344556', 'RJ-33445566', 29, '1995-03-10', 'Brasileira', 'Solteira', 'Manicure', 'Médio Completo', 'ativo',
 'Rua das Acácias', 'Lapa', '88', '20220-330', 'RJ', 'Rio de Janeiro', '21999887766', '21988776655'),
('Carla Menezes', '22334455667', 'BA-44556677', 40, '1984-07-12', 'Brasileira', 'Divorciada', 'Doméstica', 'Fundamental Completo', 'ativo',
 'Rua do Sossego', 'São Caetano', '22', '40200-000', 'BA', 'Salvador', '71987654321', '71996543210'),
('Renata Oliveira', '33445566778', 'RS-55667788', 33, '1991-01-25', 'Brasileira', 'Casada', 'Atendente', 'Médio Completo', 'ativo',
 'Avenida Brasil', 'Centro', '305', '90010-000', 'RS', 'Porto Alegre', '51991234567', '51993456789'),
('Tatiane Soares', '44556677889', 'PE-66778899', 27, '1997-11-04', 'Brasileira', 'Solteira', 'Vendedora', 'Médio Incompleto', 'ativo',
 'Rua da Aurora', 'Boa Vista', '112', '50050-100', 'PE', 'Recife', '81999887766', '81988776655'),
('Eliane Costa', '55667788990', 'CE-77889900', 50, '1974-08-08', 'Brasileira', 'Viúva', 'Artesã', 'Fundamental Incompleto', 'ativo',
 'Travessa das Palmeiras', 'Mucuripe', '55', '60165-000', 'CE', 'Fortaleza', '85991234567', '85993456789');

-- 8. Popular consultas (com datas do mês atual)
INSERT INTO consultas (assistida_id, data_consulta, profissional, tipo_consulta, status, observacoes) VALUES
(1, DATE_SUB(CURDATE(), INTERVAL 10 DAY), 'Dr. Silva', 'Clínico Geral', 'realizada', 'Consulta de rotina'),
(2, DATE_SUB(CURDATE(), INTERVAL 9 DAY), 'Dr. Santos', 'Psiquiatria', 'realizada', 'Acompanhamento psiquiátrico'),
(3, DATE_SUB(CURDATE(), INTERVAL 8 DAY), 'Dr. Silva', 'Clínico Geral', 'realizada', 'Avaliação clínica'),
(4, DATE_SUB(CURDATE(), INTERVAL 7 DAY), 'Dr. Santos', 'Psiquiatria', 'realizada', 'Consulta inicial'),
(5, DATE_SUB(CURDATE(), INTERVAL 6 DAY), 'Dr. Silva', 'Clínico Geral', 'realizada', 'Retorno médico'),
(1, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'Dr. Santos', 'Psiquiatria', 'realizada', 'Acompanhamento'),
(2, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'Dr. Silva', 'Clínico Geral', 'realizada', 'Consulta de rotina'),
(3, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'Dr. Santos', 'Psiquiatria', 'realizada', 'Avaliação psicológica'),
(4, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'Dr. Silva', 'Clínico Geral', 'realizada', 'Check-up'),
(5, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'Dr. Santos', 'Psiquiatria', 'realizada', 'Consulta de acompanhamento');

-- 9. Popular internações (ativas no momento)
INSERT INTO internacoes (assistida_id, data_entrada, status, observacoes) VALUES
(1, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'ativa', 'Internação para tratamento'),
(2, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'ativa', 'Tratamento intensivo'),
(3, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'ativa', 'Reabilitação');

INSERT INTO substancias (nome, categoria, descricao) VALUES
('Álcool', 'Depressor', 'Bebida alcoólica que reduz a atividade do sistema nervoso central.'),
('Maconha', 'Perturbador', 'Substância psicoativa da planta Cannabis sativa.'),
('Cocaína', 'Estimulante', 'Droga estimulante derivada da planta de coca.'),
('Cafeína', 'Estimulante', 'Presente em café, chá e energéticos, aumenta alerta e atenção.'),
('LSD', 'Perturbador', 'Alucinógeno que altera percepção e cognição.'),
('Morfina', 'Depressor', 'Analgesico opióide usado no controle de dor intensa.'),
('Ecstasy', 'Estimulante', 'Droga sintética que provoca euforia e empatia.'),
('Heroína', 'Depressor', 'Opióide altamente viciante, derivado da morfina.'),
('Anfetamina', 'Estimulante', 'Estimulante do sistema nervoso central usado em alguns medicamentos.'),
('Kratom', 'Depressor', 'Planta com efeito sedativo em doses altas, estimulante em doses baixas.'),
('Psilocibina', 'Perturbador', 'Alucinógeno encontrado em cogumelos conhecidos como “cogumelos mágicos”.'),
('Tabaco', 'Estimulante', 'Fonte de nicotina, provoca dependência e efeitos estimulantes.'),
('Benzodiazepínicos', 'Depressor', 'Medicamentos ansiolíticos e sedativos.');

-- 8. Verificar dados inseridos
SELECT 'Dados inseridos com sucesso!' as status;
SELECT 'Tipos de despesas:', COUNT(*) as total FROM tipos_despesas;
SELECT 'Doadores:', COUNT(*) as total FROM doadores;
SELECT 'Despesas:', COUNT(*) as total FROM despesas;
SELECT 'Doações:', COUNT(*) as total FROM doacoes;
SELECT 'Unidades de medida:', COUNT(*) as total FROM unidades_medida;
SELECT 'Medicamentos:', COUNT(*) as total FROM medicamentos;
SELECT 'Assistidas:', COUNT(*) as total FROM assistidas;

-- 9. Verificar distribuição de doadores
SELECT
  'RESUMO DOADORES:' as info,
  COUNT(*) as total_doadores,
  SUM(CASE WHEN ativo = 1 THEN 1 ELSE 0 END) as ativos,
  SUM(CASE WHEN ativo = 0 THEN 1 ELSE 0 END) as inativos
FROM doadores;

SELECT
  'DOADORES COM DOAÇÕES (NÃO PODEM SER EXCLUÍDOS):' as info,
  COUNT(DISTINCT d.doador_id) as total
FROM doacoes d;

SELECT
  'DOADORES SEM DOAÇÕES (PODEM SER EXCLUÍDOS):' as info,
  COUNT(*) as total
FROM doadores d
WHERE d.id NOT IN (SELECT DISTINCT doador_id FROM doacoes);


-- ========================================
-- Módulo Produção & Vendas
-- ========================================

-- ========================================
-- 1. MATÉRIAS-PRIMAS (Exemplo do Bolo)
-- ========================================

INSERT INTO materias_primas (nome, unidade_medida, preco_por_unidade, descricao, ativo) VALUES
('Trigo', 'kg', 3.00, 'Farinha de trigo', 1),
('Óleo', 'L', 7.00, 'Óleo de soja', 1),
('Achocolatado', 'kg', 20.00, 'Achocolatado em pó', 1),
('Açúcar', 'kg', 3.00, 'Açúcar refinado', 1),
('Fermento', 'g', 0.035, 'Fermento biológico seco', 1),
('Ovos', 'un', 0.50, 'Ovos de galinha', 1),
('Leite', 'L', 5.00, 'Leite integral', 1),
('Manteiga', 'kg', 25.00, 'Manteiga sem sal', 1),
('Cacau em pó', 'kg', 30.00, 'Cacau em pó 100%', 1),
('Bicarbonato de sódio', 'g', 0.02, 'Bicarbonato de sódio', 1),
('Sal', 'kg', 2.00, 'Sal refinado', 1),
('Essência de baunilha', 'ml', 0.15, 'Essência de baunilha', 1);

-- ========================================
-- 2. RECEITAS
-- ========================================

-- Receita: Bolo de Chocolate (1 unidade)
INSERT INTO receitas (nome, descricao, rendimento, custo_estimado, ativo) VALUES
('Bolo de Chocolate', 'Bolo de chocolate caseiro', 1, 0.00, 1),
('Bolo de Cenoura', 'Bolo de cenoura com cobertura', 1, 0.00, 1),
('Pão Caseiro', 'Pão de forma caseiro', 1, 0.00, 1),
('Biscoito de Chocolate', 'Biscoitos de chocolate', 24, 0.00, 1);

-- ========================================
-- 3. RECEITAS_MATERIAS_PRIMAS
-- ========================================
-- IMPORTANTE: Não incluir custo_parcial no INSERT - será calculado pelo trigger

-- Receita 1: Bolo de Chocolate (1 unidade)
INSERT INTO receitas_materias_primas (receita_id, materia_prima_id, quantidade) VALUES
(1, 1, 0.300),  -- Trigo: 300g
(1, 2, 0.200),  -- Óleo: 200ml (0.2L)
(1, 3, 0.100),  -- Achocolatado: 100g (0.1kg)
(1, 4, 0.200),  -- Açúcar: 200g (0.2kg)
(1, 5, 10.000); -- Fermento: 10g

-- Receita 2: Bolo de Cenoura (1 unidade)
INSERT INTO receitas_materias_primas (receita_id, materia_prima_id, quantidade) VALUES
(2, 1, 0.250),  -- Trigo: 250g
(2, 2, 0.150),  -- Óleo: 150ml
(2, 4, 0.300),  -- Açúcar: 300g
(2, 6, 3.000),  -- Ovos: 3 unidades
(2, 5, 10.000), -- Fermento: 10g
(2, 11, 0.010); -- Sal: 10g (0.01kg)

-- Receita 3: Pão Caseiro (1 unidade)
INSERT INTO receitas_materias_primas (receita_id, materia_prima_id, quantidade) VALUES
(3, 1, 0.500),  -- Trigo: 500g
(3, 7, 0.300),  -- Leite: 300ml (0.3L)
(3, 8, 0.050),  -- Manteiga: 50g (0.05kg)
(3, 11, 0.010), -- Sal: 10g
(3, 5, 5.000);  -- Fermento: 5g

-- Receita 4: Biscoito de Chocolate (24 unidades)
INSERT INTO receitas_materias_primas (receita_id, materia_prima_id, quantidade) VALUES
(4, 1, 0.200),  -- Trigo: 200g
(4, 8, 0.100),  -- Manteiga: 100g
(4, 4, 0.150),  -- Açúcar: 150g
(4, 9, 0.050),  -- Cacau: 50g (0.05kg)
(4, 10, 5.000), -- Bicarbonato: 5g
(4, 6, 1.000),  -- Ovo: 1 unidade
(4, 12, 5.000); -- Essência: 5ml

-- ========================================
-- 4. PRODUTOS
-- ========================================
-- Nota: Os triggers calculam automaticamente custo_estimado, margem_bruta e margem_percentual

INSERT INTO produtos (nome, descricao, preco_venda, receita_id, ativo) VALUES
('Bolo de Chocolate', 'Bolo de chocolate caseiro delicioso', 13.00, 1, 1),
('Bolo de Cenoura', 'Bolo de cenoura com cobertura de chocolate', 12.00, 2, 1),
('Pão Caseiro', 'Pão de forma caseiro fresco', 8.00, 3, 1),
('Biscoito de Chocolate', 'Pacote com 24 biscoitos de chocolate', 10.00, 4, 1);

-- ========================================
-- 5. VENDAS (Dados fictícios dos últimos 30 dias)
-- ========================================
-- Nota: Os triggers calculam automaticamente todos os valores

INSERT INTO vendas (produto_id, quantidade, desconto, forma_pagamento, data_venda, observacoes) VALUES
(1, 10, 10.00, 'Pix', DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'Venda em lote'),
(1, 5, 0.00, 'Dinheiro', DATE_SUB(CURDATE(), INTERVAL 3 DAY), NULL),
(2, 8, 5.00, 'Crédito', DATE_SUB(CURDATE(), INTERVAL 7 DAY), NULL),
(2, 3, 0.00, 'Pix', DATE_SUB(CURDATE(), INTERVAL 2 DAY), NULL),
(3, 15, 0.00, 'Débito', DATE_SUB(CURDATE(), INTERVAL 4 DAY), NULL),
(3, 6, 3.00, 'Dinheiro', DATE_SUB(CURDATE(), INTERVAL 1 DAY), NULL),
(4, 5, 0.00, 'Pix', DATE_SUB(CURDATE(), INTERVAL 6 DAY), NULL),
(4, 10, 10.00, 'Crédito', DATE_SUB(CURDATE(), INTERVAL 8 DAY), NULL),
(1, 2, 0.00, 'Dinheiro', CURDATE(), NULL),
(2, 4, 2.00, 'Pix', CURDATE(), NULL),
(3, 8, 0.00, 'Débito', CURDATE(), NULL),
(4, 3, 0.00, 'Dinheiro', CURDATE(), NULL);

-- ========================================
-- VALIDAÇÃO DOS DADOS
-- ========================================

-- Verificar totais
SELECT
  'Total de Matérias-Primas' as item,
  COUNT(*) as quantidade
FROM materias_primas
WHERE ativo = 1
UNION ALL
SELECT
  'Total de Receitas' as item,
  COUNT(*) as quantidade
FROM receitas
WHERE ativo = 1
UNION ALL
SELECT
  'Total de Produtos' as item,
  COUNT(*) as quantidade
FROM produtos
WHERE ativo = 1
UNION ALL
SELECT
  'Total de Vendas' as item,
  COUNT(*) as quantidade
FROM vendas;

-- Verificar custos das receitas
SELECT
  r.id,
  r.nome,
  r.rendimento,
  ROUND(r.custo_estimado, 2) as custo_total,
  CASE
    WHEN r.rendimento > 0 THEN ROUND(r.custo_estimado / r.rendimento, 2)
    ELSE 0
  END as custo_por_unidade
FROM receitas r
ORDER BY r.id;

-- Verificar produtos e margens
SELECT
  p.id,
  p.nome,
  ROUND(p.preco_venda, 2) as preco_venda,
  ROUND(p.custo_estimado, 2) as custo_estimado,
  ROUND(p.margem_bruta, 2) as margem_bruta,
  ROUND(p.margem_percentual, 2) as margem_percentual,
  r.nome as receita
FROM produtos p
LEFT JOIN receitas r ON p.receita_id = r.id
ORDER BY p.id;

-- Verificar vendas e lucros
SELECT
  DATE(v.data_venda) as data,
  COUNT(*) as total_vendas,
  SUM(v.quantidade) as total_quantidade,
  ROUND(SUM(v.valor_final), 2) as total_vendas_valor,
  ROUND(SUM(v.custo_estimado_total), 2) as total_custo,
  ROUND(SUM(v.lucro_estimado), 2) as total_lucro
FROM vendas v
GROUP BY DATE(v.data_venda)
ORDER BY data DESC;

-- Verificar composição das receitas
SELECT
  r.nome as receita,
  mp.nome as materia_prima,
  rmp.quantidade,
  mp.unidade_medida,
  ROUND(rmp.custo_parcial, 2) as custo_parcial
FROM receitas_materias_primas rmp
JOIN receitas r ON rmp.receita_id = r.id
JOIN materias_primas mp ON rmp.materia_prima_id = mp.id
ORDER BY r.id, mp.nome;

SELECT 'Dados de produção e vendas populados com sucesso!' as status;
