-- Script unificado para criar todas as tabelas

-- Criar database se não existir
CREATE DATABASE IF NOT EXISTS casamais_db;
USE casamais_db;

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

-- 3. Tabela despesas (com FK para tipos_despesas)
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

-- 4. Tabela doacoes (com FK para doadores)
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


-- 5. Tabela unidades_medida (base para FK)
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

-- 6. Tabela medicamentos (com FK para unidades_medida)
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

-- 7. Tabela assistidas
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


-- 10. Tabela usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id int NOT NULL AUTO_INCREMENT,
  nome varchar(255) NOT NULL,
  email varchar(255) NOT NULL,
  senha varchar(255) NOT NULL,
  tipo enum('admin','usuario') NOT NULL DEFAULT 'usuario',
  ativo tinyint(1) NOT NULL DEFAULT 1,
  data_cadastro timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY email (email),
  KEY tipo (tipo),
  KEY ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS hpr (
  id INT NOT NULL AUTO_INCREMENT,
  assistida_id INT NOT NULL COMMENT 'Referência à assistida (foreign key)',
  data_atendimento DATE COMMENT 'Data do primeiro atendimento',
  hora TIME COMMENT 'Hora do primeiro atendimento',
  historia_patologica TEXT COMMENT 'História clínica da assistida',
  tempo_sem_uso VARCHAR(100) COMMENT 'Tempo desde o último uso de substâncias',
  motivacao_internacoes TEXT COMMENT 'Motivo(s) das internações anteriores',
  fatos_marcantes TEXT COMMENT 'Fatos marcantes na vida da assistida',
  infancia TEXT COMMENT 'Relato sobre a infância',
  adolescencia TEXT COMMENT 'Relato sobre a adolescência',

  -- Novas colunas de controle
  created_by INT NULL COMMENT 'Usuário que criou o registro',
  updated_by INT NULL COMMENT 'Usuário que atualizou o registro',
  deleted_flag BOOLEAN DEFAULT FALSE COMMENT 'Indica se o registro foi marcado como deletado',
  deleted_at DATETIME NULL COMMENT 'Data e hora da exclusão lógica',

  -- Controle de criação/atualização
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data de criação do registro',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Data da última atualização',

  PRIMARY KEY (id),
  FOREIGN KEY (assistida_id) REFERENCES assistidas(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL
);


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


CREATE TABLE IF NOT EXISTS drogas_utilizadas (
  id INT NOT NULL AUTO_INCREMENT,
  hpr_id INT NOT NULL COMMENT 'Referência à HPR',
  tipo VARCHAR(100) COMMENT 'Tipo de substância',
  idade_inicio INT COMMENT 'Idade aproximada de início do uso',
  tempo_uso VARCHAR(100) COMMENT 'Ex.: 2 anos, 6 meses',
  intensidade VARCHAR(100) COMMENT 'Ex.: diária, semanal, esporádica',
  observacoes TEXT COMMENT 'Observações adicionais sobre o uso',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY (id),
  KEY idx_drogas_hpr (hpr_id),
  CONSTRAINT fk_drogas_hpr FOREIGN KEY (hpr_id) REFERENCES hpr (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 2. Tabela internacoes (agora ligada a HPR)
CREATE TABLE IF NOT EXISTS internacoes (
  id INT NOT NULL AUTO_INCREMENT,
  hpr_id INT NOT NULL COMMENT 'Referência à HPR (foreign key)',
  local VARCHAR(255) COMMENT 'Local da internação',
  duracao VARCHAR(100) COMMENT 'Duração da internação',
  data DATE COMMENT 'Data da internação',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT 'Data de criação',
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL COMMENT 'Última atualização',
  PRIMARY KEY (id),
  KEY idx_internacoes_hpr_id (hpr_id),
  KEY data (data),
  CONSTRAINT fk_internacoes_hpr FOREIGN KEY (hpr_id) REFERENCES hpr (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 3. Tabela medicamentos_utilizados (agora ligada a HPR)
CREATE TABLE IF NOT EXISTS medicamentos_utilizados (
  id INT NOT NULL AUTO_INCREMENT,
  hpr_id INT NOT NULL COMMENT 'Referência à HPR (foreign key)',
  nome VARCHAR(100) COMMENT 'Nome do medicamento',
  dosagem VARCHAR(50) COMMENT 'Dosagem do medicamento',
  frequencia VARCHAR(100) COMMENT 'Frequência de uso',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT 'Data de criação',
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL COMMENT 'Última atualização',
  PRIMARY KEY (id),
  KEY idx_medicamentos_hpr_id (hpr_id),
  KEY nome (nome),
  CONSTRAINT fk_medicamentos_hpr FOREIGN KEY (hpr_id) REFERENCES hpr (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- 11. Tabela consultas (com FK para assistidas)
CREATE TABLE IF NOT EXISTS consultas (
  id int NOT NULL AUTO_INCREMENT,
  assistida_id int DEFAULT NULL,
  data_consulta date NOT NULL,
  hora_consulta time NOT NULL,
  medico varchar(255) NOT NULL,
  especialidade varchar(100) DEFAULT NULL,
  observacoes text DEFAULT NULL,
  status enum('agendada','realizada','cancelada') NOT NULL DEFAULT 'agendada',
  data_cadastro timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_consultas_assistida_id (assistida_id),
  KEY data_consulta (data_consulta),
  KEY status (status),
  CONSTRAINT fk_consultas_assistida FOREIGN KEY (assistida_id) REFERENCES assistidas (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 12. Tabela password_reset_tokens (para recuperação de senha)
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

-- 13. Verificar estruturas criadas
SELECT 'Tabelas criadas com sucesso!' as status;
