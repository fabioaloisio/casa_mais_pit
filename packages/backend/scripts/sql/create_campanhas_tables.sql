-- ========================================
-- Script para criar tabelas de Campanhas de Arrecadação
-- Sistema Casa+ - Funcionalidade N:N
-- ========================================

USE casamais_db;

-- 1. Tabela principal de campanhas
CREATE TABLE IF NOT EXISTS campanhas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  meta_valor DECIMAL(10,2),
  data_inicio DATE NOT NULL,
  data_fim DATE,
  status ENUM('planejada', 'ativa', 'encerrada', 'cancelada') DEFAULT 'planejada',
  tipo VARCHAR(100) COMMENT 'Tipo: emergencia, sazonal, projeto, etc',
  imagem_url VARCHAR(500) COMMENT 'URL da imagem da campanha',
  criado_por INT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (criado_por) REFERENCES usuarios(id),

  INDEX idx_status (status),
  INDEX idx_data_inicio (data_inicio),
  INDEX idx_data_fim (data_fim)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabela associativa N:N (doadores <-> campanhas)
CREATE TABLE IF NOT EXISTS doadores_campanhas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  doador_id INT NOT NULL,
  campanha_id INT NOT NULL,
  valor_doado DECIMAL(10,2) NOT NULL,
  data_contribuicao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  forma_pagamento VARCHAR(50),
  recibo_numero VARCHAR(100),
  anonimo BOOLEAN DEFAULT FALSE,
  mensagem TEXT COMMENT 'Mensagem opcional do doador',
  status ENUM('pendente', 'confirmada', 'cancelada') DEFAULT 'confirmada',
  usuario_registro_id INT COMMENT 'Usuário que registrou a doação',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (doador_id) REFERENCES doadores(id) ON DELETE RESTRICT,
  FOREIGN KEY (campanha_id) REFERENCES campanhas(id) ON DELETE RESTRICT,
  FOREIGN KEY (usuario_registro_id) REFERENCES usuarios(id),

  INDEX idx_doador_campanha (doador_id, campanha_id),
  INDEX idx_campanha (campanha_id),
  INDEX idx_data_contribuicao (data_contribuicao),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. View para relatório de arrecadação das campanhas
CREATE OR REPLACE VIEW vw_campanhas_arrecadacao AS
SELECT
  c.id,
  c.nome as campanha_nome,
  c.meta_valor,
  c.status,
  c.data_inicio,
  c.data_fim,
  COUNT(DISTINCT dc.doador_id) as total_doadores,
  COUNT(dc.id) as total_doacoes,
  COALESCE(SUM(dc.valor_doado), 0) as total_arrecadado,
  CASE
    WHEN c.meta_valor > 0 THEN ROUND((COALESCE(SUM(dc.valor_doado), 0) / c.meta_valor * 100), 2)
    ELSE 0
  END as percentual_meta,
  CASE
    WHEN c.data_fim < CURDATE() THEN 'encerrada'
    WHEN c.data_inicio > CURDATE() THEN 'futura'
    ELSE 'em_andamento'
  END as situacao_temporal
FROM campanhas c
LEFT JOIN doadores_campanhas dc ON c.id = dc.campanha_id AND dc.status = 'confirmada'
GROUP BY c.id;

-- 4. View para ranking de doadores por campanha
CREATE OR REPLACE VIEW vw_ranking_doadores_campanha AS
SELECT
  dc.campanha_id,
  c.nome as campanha_nome,
  d.id as doador_id,
  CASE
    WHEN dc.anonimo = TRUE THEN 'Doador Anônimo'
    ELSE d.nome
  END as doador_nome,
  SUM(dc.valor_doado) as total_doado,
  COUNT(dc.id) as quantidade_doacoes,
  MAX(dc.data_contribuicao) as ultima_doacao
FROM doadores_campanhas dc
JOIN campanhas c ON dc.campanha_id = c.id
JOIN doadores d ON dc.doador_id = d.id
WHERE dc.status = 'confirmada'
GROUP BY dc.campanha_id, d.id, dc.anonimo
ORDER BY dc.campanha_id, total_doado DESC;

-- 5. View para histórico de participação de doadores em campanhas
CREATE OR REPLACE VIEW vw_doadores_historico_campanhas AS
SELECT
  d.id as doador_id,
  d.nome as doador_nome,
  COUNT(DISTINCT dc.campanha_id) as total_campanhas_participadas,
  SUM(dc.valor_doado) as total_doado_geral,
  MIN(dc.data_contribuicao) as primeira_contribuicao,
  MAX(dc.data_contribuicao) as ultima_contribuicao
FROM doadores d
JOIN doadores_campanhas dc ON d.id = dc.doador_id
WHERE dc.status = 'confirmada'
GROUP BY d.id;

-- 6. Inserir dados de exemplo (opcional - remover em produção)
-- INSERT INTO campanhas (nome, descricao, meta_valor, data_inicio, data_fim, status, tipo) VALUES
-- ('Campanha de Natal 2024', 'Arrecadação de fundos para cestas básicas de Natal', 10000.00, '2024-11-01', '2024-12-25', 'ativa', 'sazonal'),
-- ('Reforma do Telhado', 'Campanha emergencial para reforma do telhado da casa', 15000.00, '2024-10-01', '2024-11-30', 'ativa', 'emergencia'),
-- ('Projeto Horta Comunitária', 'Criação de uma horta para as assistidas', 5000.00, '2024-12-01', '2025-02-28', 'planejada', 'projeto');

SELECT 'Tabelas de Campanhas criadas com sucesso!' as status;
