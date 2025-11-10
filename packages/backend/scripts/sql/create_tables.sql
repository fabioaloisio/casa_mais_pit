-- ========================================
-- Script unificado para criar todas as tabelas do Sistema Casa+
-- Última atualização: 11/09/2025
-- ========================================

-- Criar database se não existir
CREATE DATABASE IF NOT EXISTS casamais_db;
USE casamais_db;

-- ========================================
-- SEÇÃO 1: TABELAS BASE (sem FK)
-- ========================================

-- 1. Tabela tipos_despesas (base para FK)
CREATE TABLE IF NOT EXISTS tipos_despesas (
  id int NOT NULL AUTO_INCREMENT,
  nome varchar(100) NOT NULL,
  descricao varchar(500) DEFAULT NULL,
  ativo tinyint(1) NOT NULL DEFAULT 1,
  data_cadastro timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY nome (nome),
  KEY ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 2. Tabela doadores (base para FK)
CREATE TABLE IF NOT EXISTS doadores (
  id int NOT NULL AUTO_INCREMENT,
  tipo_doador enum('PF','PJ') NOT NULL,
  nome varchar(255) NOT NULL,
  documento varchar(20) NOT NULL,
  email varchar(255) DEFAULT NULL,
  telefone varchar(20) NOT NULL,
  endereco varchar(255) DEFAULT NULL,
  cidade varchar(100) DEFAULT NULL,
  estado varchar(2) DEFAULT NULL,
  cep varchar(10) DEFAULT NULL,
  ativo tinyint(1) NOT NULL DEFAULT 1,
  data_cadastro timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY documento (documento),
  KEY tipo_doador (tipo_doador),
  KEY cidade (cidade),
  KEY estado (estado),
  KEY ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 3. Tabela unidades_medida (base para FK)
CREATE TABLE IF NOT EXISTS unidades_medida (
  id int NOT NULL AUTO_INCREMENT,
  nome varchar(50) NOT NULL,
  sigla varchar(10) NOT NULL,
  createdAt timestamp DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY nome (nome),
  UNIQUE KEY sigla (sigla)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 4. Tabela usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id int NOT NULL AUTO_INCREMENT,
  nome varchar(255) NOT NULL,
  email varchar(255) NOT NULL,
  senha varchar(255) DEFAULT NULL,
  tipo enum('Administrador','Financeiro','Colaborador') NOT NULL DEFAULT 'Colaborador',
  status enum('pendente','aprovado','ativo','rejeitado','bloqueado','suspenso','inativo') NOT NULL DEFAULT 'pendente',
  token_ativacao varchar(255) DEFAULT NULL,
  ativo tinyint(1) NOT NULL DEFAULT 1,
  data_cadastro timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  data_aprovacao timestamp NULL DEFAULT NULL,
  aprovado_por int DEFAULT NULL,
  data_ativacao timestamp NULL DEFAULT NULL,
  data_ultimo_acesso timestamp NULL DEFAULT NULL,
  data_bloqueio timestamp NULL DEFAULT NULL,
  motivo_bloqueio varchar(500) DEFAULT NULL,
  bloqueado_por int DEFAULT NULL,
  data_suspensao timestamp NULL DEFAULT NULL,
  data_fim_suspensao timestamp NULL DEFAULT NULL,
  suspenso_por int DEFAULT NULL,
  motivo_suspensao varchar(500) DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY email (email),
  UNIQUE KEY token_ativacao (token_ativacao),
  KEY tipo (tipo),
  KEY status (status),
  KEY ativo (ativo),
  KEY aprovado_por (aprovado_por),
  KEY bloqueado_por (bloqueado_por),
  KEY suspenso_por (suspenso_por),
  KEY idx_data_ultimo_acesso (data_ultimo_acesso),
  KEY idx_data_fim_suspensao (data_fim_suspensao),
  CONSTRAINT fk_usuarios_aprovado_por FOREIGN KEY (aprovado_por) REFERENCES usuarios (id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_usuarios_bloqueado_por FOREIGN KEY (bloqueado_por) REFERENCES usuarios (id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_usuarios_suspenso_por FOREIGN KEY (suspenso_por) REFERENCES usuarios (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 5. Tabela assistidas
CREATE TABLE IF NOT EXISTS assistidas (
  id int NOT NULL AUTO_INCREMENT,
  nome varchar(255) NOT NULL COMMENT 'Nome completo da assistida',
  cpf varchar(20) COMMENT 'CPF da assistida',
  rg varchar(20) COMMENT 'RG da assistida',
  idade int COMMENT 'Idade da assistida',
  data_nascimento date COMMENT 'Data de nascimento',
  nacionalidade varchar(100) COMMENT 'Nacionalidade',
  estado_civil varchar(100) COMMENT 'Estado civil',
  profissao varchar(100) COMMENT 'Profissão atual ou anterior',
  escolaridade varchar(100) COMMENT 'Nível de escolaridade',
  status varchar(50) COMMENT 'Status atual (ex: Ativa, Em Tratamento)',
  logradouro varchar(255) COMMENT 'Rua/Avenida',
  bairro varchar(255) COMMENT 'Bairro de residência',
  numero varchar(20) COMMENT 'Número da residência',
  cep varchar(20) COMMENT 'CEP',
  estado varchar(2) COMMENT 'UF (ex: SP, MG)',
  cidade varchar(100) COMMENT 'Cidade',
  telefone varchar(20) COMMENT 'Telefone principal',
  telefone_contato varchar(20) COMMENT 'Telefone de contato alternativo',
  createdAt timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT 'Data de criação do registro',
  updatedAt timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL COMMENT 'Última atualização do registro',
  PRIMARY KEY (id),
  UNIQUE KEY cpf (cpf),
  KEY nome (nome),
  KEY status (status),
  KEY cidade (cidade),
  KEY estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 6. Tabela substancias
CREATE TABLE IF NOT EXISTS substancias (
  id INT NOT NULL AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL COMMENT 'Nome da substância psicoativa',
  categoria VARCHAR(100) COMMENT 'Categoria: depressor, estimulante, perturbador, etc.',
  descricao TEXT COMMENT 'Observações adicionais sobre a substância',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_nome_substancia (nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ========================================
-- SEÇÃO 2: TABELAS COM FK SIMPLES
-- ========================================

-- 7. Tabela despesas (com FK para tipos_despesas)
CREATE TABLE IF NOT EXISTS despesas (
  id int NOT NULL AUTO_INCREMENT,
  tipo_despesa_id int NOT NULL,
  descricao varchar(255) NOT NULL,
  categoria varchar(100) NOT NULL,
  valor decimal(10,2) NOT NULL,
  data_despesa date NOT NULL,
  forma_pagamento varchar(50) NOT NULL,
  fornecedor varchar(255) DEFAULT NULL,
  observacoes text DEFAULT NULL,
  status enum('pendente','paga','cancelada') NOT NULL DEFAULT 'pendente',
  data_cadastro timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_despesas_tipo_despesa_id (tipo_despesa_id),
  KEY categoria (categoria),
  KEY data_despesa (data_despesa),
  KEY forma_pagamento (forma_pagamento),
  KEY status (status),
  CONSTRAINT fk_despesas_tipo_despesa FOREIGN KEY (tipo_despesa_id) REFERENCES tipos_despesas (id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 8. Tabela doacoes (com FK para doadores)
CREATE TABLE IF NOT EXISTS doacoes (
  id int NOT NULL AUTO_INCREMENT,
  doador_id int NOT NULL,
  valor decimal(10,2) NOT NULL,
  data_doacao date NOT NULL,
  observacoes text DEFAULT NULL,
  data_cadastro datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao datetime DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_doacoes_doador_id (doador_id),
  KEY data_doacao (data_doacao),
  CONSTRAINT fk_doacoes_doador FOREIGN KEY (doador_id) REFERENCES doadores (id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 9. Tabela medicamentos (com FK para unidades_medida)
CREATE TABLE IF NOT EXISTS medicamentos (
  id int NOT NULL AUTO_INCREMENT,
  nome varchar(100) NOT NULL,
  forma_farmaceutica varchar(45) NOT NULL,
  descricao varchar(250) DEFAULT NULL,
  unidade_medida_id int NOT NULL,
  createdAt timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY (id),
  KEY idx_medicamentos_unidade_medida_id (unidade_medida_id),
  KEY nome (nome),
  KEY forma_farmaceutica (forma_farmaceutica),
  CONSTRAINT fk_medicamentos_unidade_medida FOREIGN KEY (unidade_medida_id) REFERENCES unidades_medida (id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 10. Tabela drogas_utilizadas (com FK para assistidas e substancias)
CREATE TABLE IF NOT EXISTS drogas_utilizadas (
  id INT NOT NULL AUTO_INCREMENT,
  assistida_id INT NOT NULL COMMENT 'Referência à assistida',
  substancia_id INT NOT NULL COMMENT 'Referência à substância',
  idade_inicio INT COMMENT 'Idade aproximada de início do uso',
  frequencia VARCHAR(100) COMMENT 'Ex.: diária, semanal, esporádica',
  tempo_uso VARCHAR(100) COMMENT 'Ex.: 2 anos, 6 meses',
  observacoes TEXT COMMENT 'Observações adicionais sobre o uso',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY (id),
  KEY idx_drogas_assistida (assistida_id),
  KEY idx_drogas_substancia (substancia_id),
  CONSTRAINT fk_drogas_assistida FOREIGN KEY (assistida_id) REFERENCES assistidas (id) ON DELETE CASCADE,
  CONSTRAINT fk_drogas_substancia FOREIGN KEY (substancia_id) REFERENCES substancias (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 11. Tabela medicamentos_utilizados (com FK para assistidas)
CREATE TABLE IF NOT EXISTS medicamentos_utilizados (
  id int NOT NULL AUTO_INCREMENT,
  assistida_id int NOT NULL COMMENT 'Referência à assistida (foreign key)',
  nome varchar(100) COMMENT 'Nome do medicamento',
  dosagem varchar(50) COMMENT 'Dosagem do medicamento',
  frequencia varchar(100) COMMENT 'Frequência de uso',
  createdAt timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT 'Data de criação',
  updatedAt timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL COMMENT 'Última atualização',
  PRIMARY KEY (id),
  KEY idx_medicamentos_utilizados_assistida_id (assistida_id),
  KEY nome (nome),
  CONSTRAINT fk_medicamentos_utilizados_assistida FOREIGN KEY (assistida_id) REFERENCES assistidas (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ========================================
-- SEÇÃO 3: TABELAS DE GESTÃO OPERACIONAL
-- ========================================

-- 12. TABELA: internacoes (RF_F1, RF_F2) - Versão completa
CREATE TABLE IF NOT EXISTS internacoes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  assistida_id INT NOT NULL,
  data_entrada DATETIME NOT NULL,
  data_saida DATETIME DEFAULT NULL,
  motivo TEXT,
  observacoes TEXT,
  observacoes_saida TEXT,
  status ENUM('ativa', 'finalizada') DEFAULT 'ativa',
  usuario_entrada_id INT,
  usuario_saida_id INT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (assistida_id) REFERENCES assistidas(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_entrada_id) REFERENCES usuarios(id),
  FOREIGN KEY (usuario_saida_id) REFERENCES usuarios(id),

  INDEX idx_assistida (assistida_id),
  INDEX idx_status (status),
  INDEX idx_data_entrada (data_entrada)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. TABELA: caixa_movimentacoes (RF_F4, RF_F5)
CREATE TABLE IF NOT EXISTS caixa_movimentacoes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tipo ENUM('entrada', 'saida', 'ajuste') NOT NULL,
  categoria VARCHAR(100),
  valor DECIMAL(10,2) NOT NULL,
  descricao TEXT,
  forma_pagamento VARCHAR(50),
  numero_recibo VARCHAR(100),
  data_movimentacao DATETIME NOT NULL,
  doacao_id INT DEFAULT NULL,
  despesa_id INT DEFAULT NULL,
  doador_id INT DEFAULT NULL,
  usuario_id INT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (doacao_id) REFERENCES doacoes(id),
  FOREIGN KEY (despesa_id) REFERENCES despesas(id),
  FOREIGN KEY (doador_id) REFERENCES doadores(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),

  INDEX idx_tipo (tipo),
  INDEX idx_data (data_movimentacao),
  INDEX idx_categoria (categoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. TABELA: caixa_fechamentos (Para controle de fechamento diário)
CREATE TABLE IF NOT EXISTS caixa_fechamentos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  data_fechamento DATE NOT NULL,
  saldo_inicial DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_entradas DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_saidas DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_ajustes DECIMAL(10,2) NOT NULL DEFAULT 0,
  saldo_final DECIMAL(10,2) NOT NULL DEFAULT 0,
  observacoes TEXT,
  usuario_id INT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),

  UNIQUE KEY uk_data (data_fechamento),
  INDEX idx_data_fechamento (data_fechamento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. TABELA: consultas (RF_F6, RF_F7, RF_F8, RF_F9) - Versão completa
CREATE TABLE IF NOT EXISTS consultas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  assistida_id INT NOT NULL,
  data_consulta DATETIME NOT NULL,
  profissional VARCHAR(200) NOT NULL,
  tipo_consulta VARCHAR(100) DEFAULT 'Geral',
  observacoes TEXT,

  -- RF_F7 - Prescrição
  prescricao TEXT,
  medicamentos JSON,
  data_prescricao DATETIME,
  usuario_prescricao_id INT,

  -- RF_F8 - História Patológica
  historia_patologica JSON,
  data_historia DATETIME,
  usuario_historia_id INT,

  -- RF_F9 - Pós-consulta
  evolucao TEXT,
  encaminhamentos TEXT,
  retorno_agendado DATE,
  observacoes_pos_consulta TEXT,
  data_realizacao DATETIME,
  usuario_pos_consulta_id INT,

  -- Controle geral
  status ENUM('agendada', 'realizada', 'cancelada') DEFAULT 'agendada',
  motivo_cancelamento TEXT,
  data_cancelamento DATETIME,
  usuario_cancelamento_id INT,
  usuario_criacao_id INT,

  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (assistida_id) REFERENCES assistidas(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_prescricao_id) REFERENCES usuarios(id),
  FOREIGN KEY (usuario_historia_id) REFERENCES usuarios(id),
  FOREIGN KEY (usuario_pos_consulta_id) REFERENCES usuarios(id),
  FOREIGN KEY (usuario_cancelamento_id) REFERENCES usuarios(id),
  FOREIGN KEY (usuario_criacao_id) REFERENCES usuarios(id),

  INDEX idx_assistida_consulta (assistida_id),
  INDEX idx_data_consulta (data_consulta),
  INDEX idx_status_consulta (status),
  INDEX idx_profissional (profissional)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- SEÇÃO 4: TABELAS DE CONTROLE E AUDITORIA
-- ========================================

-- 16. Tabela password_reset_tokens (para recuperação de senha)
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id int NOT NULL AUTO_INCREMENT,
  usuario_id int NOT NULL,
  token varchar(255) NOT NULL UNIQUE,
  expires_at timestamp NOT NULL,
  used tinyint(1) NOT NULL DEFAULT 0,
  created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY usuario_id (usuario_id),
  KEY expires_at (expires_at),
  CONSTRAINT fk_password_reset_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 17. Tabela usuarios_aprovacoes_log (para auditoria de aprovações)
CREATE TABLE IF NOT EXISTS usuarios_aprovacoes_log (
  id int NOT NULL AUTO_INCREMENT,
  usuario_id int NOT NULL,
  acao enum('aprovado','rejeitado','ativado') NOT NULL,
  executado_por int NOT NULL,
  observacoes text DEFAULT NULL,
  data_acao timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY usuario_id (usuario_id),
  KEY executado_por (executado_por),
  KEY acao (acao),
  KEY data_acao (data_acao),
  CONSTRAINT fk_log_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_log_executado_por FOREIGN KEY (executado_por) REFERENCES usuarios (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 17. Tabela usuarios_status_historico (histórico de mudanças de status)
CREATE TABLE IF NOT EXISTS usuarios_status_historico (
  id int NOT NULL AUTO_INCREMENT,
  usuario_id int NOT NULL,
  status_anterior varchar(50) DEFAULT NULL,
  status_novo varchar(50) NOT NULL,
  motivo varchar(500) DEFAULT NULL,
  detalhes JSON DEFAULT NULL,
  alterado_por int DEFAULT NULL,
  ip_address varchar(45) DEFAULT NULL,
  user_agent varchar(500) DEFAULT NULL,
  data_alteracao timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_usuario_id (usuario_id),
  KEY idx_data_alteracao (data_alteracao),
  KEY idx_status_novo (status_novo),
  CONSTRAINT fk_historico_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_historico_alterado_por FOREIGN KEY (alterado_por) REFERENCES usuarios (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ========================================
-- SEÇÃO 5: VIEWS AUXILIARES
-- ========================================

-- View para facilitar relatórios de internações
CREATE OR REPLACE VIEW vw_internacoes_ativas AS
SELECT
  i.*,
  a.nome as assistida_nome,
  a.cpf as assistida_cpf,
  TIMESTAMPDIFF(DAY, i.data_entrada, NOW()) as dias_internada
FROM internacoes i
JOIN assistidas a ON i.assistida_id = a.id
WHERE i.status = 'ativa';

-- View para saldo do caixa
CREATE OR REPLACE VIEW vw_saldo_caixa AS
SELECT
  SUM(CASE
    WHEN tipo = 'entrada' THEN valor
    WHEN tipo = 'saida' THEN -valor
    WHEN tipo = 'ajuste' THEN valor
    ELSE 0
  END) as saldo_atual,
  SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE 0 END) as total_entradas,
  SUM(CASE WHEN tipo = 'saida' THEN valor ELSE 0 END) as total_saidas,
  SUM(CASE WHEN tipo = 'ajuste' THEN valor ELSE 0 END) as total_ajustes
FROM caixa_movimentacoes;

-- View para consultas do dia
CREATE OR REPLACE VIEW vw_consultas_hoje AS
SELECT
  c.*,
  a.nome as assistida_nome,
  a.cpf as assistida_cpf
FROM consultas c
JOIN assistidas a ON c.assistida_id = a.id
WHERE DATE(c.data_consulta) = CURDATE()
  AND c.status = 'agendada'
ORDER BY c.data_consulta;

-- ========================================
-- Script para criar tabelas do módulo Produção & Vendas
-- Sistema Casa+
-- ========================================

-- ========================================
-- SEÇÃO 1: TABELAS BASE
-- ========================================

-- 1. Tabela materias_primas (base para FK)
CREATE TABLE IF NOT EXISTS materias_primas (
  id int NOT NULL AUTO_INCREMENT,
  nome varchar(255) NOT NULL,
  unidade_medida varchar(20) NOT NULL COMMENT 'kg, L, g, etc.',
  preco_por_unidade decimal(10,2) NOT NULL DEFAULT 0.00,
  descricao text DEFAULT NULL,
  ativo tinyint(1) NOT NULL DEFAULT 1,
  data_cadastro timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_nome (nome),
  KEY idx_ativo (ativo),
  KEY idx_unidade_medida (unidade_medida)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 2. Tabela receitas
CREATE TABLE IF NOT EXISTS receitas (
  id int NOT NULL AUTO_INCREMENT,
  nome varchar(255) NOT NULL,
  descricao text DEFAULT NULL,
  rendimento int NOT NULL DEFAULT 1 COMMENT 'Quantidade de unidades que a receita produz',
  custo_estimado decimal(10,2) DEFAULT 0.00 COMMENT 'Calculado automaticamente',
  ativo tinyint(1) NOT NULL DEFAULT 1,
  data_cadastro timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_nome (nome),
  KEY idx_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 3. Tabela receitas_materias_primas (tabela intermediária N:N)
CREATE TABLE IF NOT EXISTS receitas_materias_primas (
  id int NOT NULL AUTO_INCREMENT,
  receita_id int NOT NULL,
  materia_prima_id int NOT NULL,
  quantidade decimal(10,3) NOT NULL COMMENT 'Quantidade utilizada',
  custo_parcial decimal(10,2) DEFAULT 0.00 COMMENT 'quantidade * preco_por_unidade',
  data_cadastro timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_receita_materia_prima (receita_id, materia_prima_id),
  KEY idx_receita_id (receita_id),
  KEY idx_materia_prima_id (materia_prima_id),
  CONSTRAINT fk_receitas_materias_primas_receita FOREIGN KEY (receita_id) REFERENCES receitas (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_receitas_materias_primas_materia_prima FOREIGN KEY (materia_prima_id) REFERENCES materias_primas (id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 4. Tabela produtos
CREATE TABLE IF NOT EXISTS produtos (
  id int NOT NULL AUTO_INCREMENT,
  nome varchar(255) NOT NULL,
  descricao text DEFAULT NULL,
  preco_venda decimal(10,2) NOT NULL DEFAULT 0.00,
  receita_id int DEFAULT NULL COMMENT 'Receita associada ao produto',
  custo_estimado decimal(10,2) DEFAULT 0.00 COMMENT 'Custo por unidade (calculado da receita)',
  margem_bruta decimal(10,2) DEFAULT 0.00 COMMENT 'preco_venda - custo_estimado',
  margem_percentual decimal(5,2) DEFAULT 0.00 COMMENT 'Percentual de margem',
  ativo tinyint(1) NOT NULL DEFAULT 1,
  data_cadastro timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_nome (nome),
  KEY idx_ativo (ativo),
  KEY idx_receita_id (receita_id),
  CONSTRAINT fk_produtos_receita FOREIGN KEY (receita_id) REFERENCES receitas (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 5. Tabela vendas
CREATE TABLE IF NOT EXISTS vendas (
  id int NOT NULL AUTO_INCREMENT,
  produto_id int NOT NULL,
  quantidade int NOT NULL DEFAULT 1,
  valor_bruto decimal(10,2) NOT NULL COMMENT 'Quantidade * Preço de venda',
  desconto decimal(10,2) DEFAULT 0.00,
  valor_final decimal(10,2) NOT NULL COMMENT 'valor_bruto - desconto',
  forma_pagamento enum('Pix','Dinheiro','Débito','Crédito') NOT NULL DEFAULT 'Dinheiro',
  custo_estimado_total decimal(10,2) DEFAULT 0.00 COMMENT 'Quantidade * custo_estimado do produto',
  lucro_estimado decimal(10,2) DEFAULT 0.00 COMMENT 'valor_final - custo_estimado_total',
  observacoes text DEFAULT NULL,
  data_venda date NOT NULL,
  usuario_id int DEFAULT NULL,
  data_cadastro timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_produto_id (produto_id),
  KEY idx_data_venda (data_venda),
  KEY idx_forma_pagamento (forma_pagamento),
  KEY idx_usuario_id (usuario_id),
  CONSTRAINT fk_vendas_produto FOREIGN KEY (produto_id) REFERENCES produtos (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_vendas_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ========================================
-- SEÇÃO 2: VIEWS AUXILIARES
-- ========================================

-- View para receitas com custo total
CREATE OR REPLACE VIEW vw_receitas_detalhadas AS
SELECT
  r.*,
  COUNT(DISTINCT rmp.materia_prima_id) as total_materias_primas
FROM receitas r
LEFT JOIN receitas_materias_primas rmp ON r.id = rmp.receita_id
GROUP BY r.id, r.nome, r.descricao, r.rendimento, r.custo_estimado, r.ativo, r.data_cadastro, r.data_atualizacao;

-- View para produtos com informações da receita
CREATE OR REPLACE VIEW vw_produtos_detalhados AS
SELECT
  p.*,
  r.nome as receita_nome,
  r.rendimento as receita_rendimento
FROM produtos p
LEFT JOIN receitas r ON p.receita_id = r.id;

-- View para vendas com informações do produto
CREATE OR REPLACE VIEW vw_vendas_detalhadas AS
SELECT
  v.*,
  p.nome as produto_nome,
  p.preco_venda as produto_preco_venda,
  u.nome as usuario_nome
FROM vendas v
LEFT JOIN produtos p ON v.produto_id = p.id
LEFT JOIN usuarios u ON v.usuario_id = u.id;

-- View para relatório de vendas por período
CREATE OR REPLACE VIEW vw_relatorio_vendas_periodo AS
SELECT
  DATE(v.data_venda) as data,
  COUNT(v.id) as total_vendas,
  SUM(v.quantidade) as total_quantidade,
  SUM(v.valor_bruto) as total_valor_bruto,
  SUM(v.desconto) as total_desconto,
  SUM(v.valor_final) as total_valor_final,
  SUM(v.custo_estimado_total) as total_custo_estimado,
  SUM(v.lucro_estimado) as total_lucro_estimado
FROM vendas v
GROUP BY DATE(v.data_venda);

-- ========================================
-- CONCLUSÃO
-- ========================================

SELECT 'Tabelas do módulo Produção & Vendas criadas com sucesso!' as status;
SELECT 'Todas as tabelas e views foram criadas com sucesso!' as status;
