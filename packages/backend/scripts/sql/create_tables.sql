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
  data_atendimento date COMMENT 'Data do primeiro atendimento',
  hora time COMMENT 'Hora do primeiro atendimento',
  historia_patologica text COMMENT 'História clínica da assistida',
  tempo_sem_uso varchar(100) COMMENT 'Tempo desde o último uso de substâncias',
  motivacao_internacoes text COMMENT 'Motivo(s) das internações anteriores',
  fatos_marcantes text COMMENT 'Fatos marcantes na vida da assistida',
  infancia text COMMENT 'Relato sobre a infância',
  adolescencia text COMMENT 'Relato sobre a adolescência',
  createdAt timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT 'Data de criação do registro',
  updatedAt timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL COMMENT 'Última atualização do registro',
  PRIMARY KEY (id),
  UNIQUE KEY cpf (cpf),
  KEY nome (nome),
  KEY status (status),
  KEY cidade (cidade),
  KEY estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 8. Tabela internacoes (com FK para assistidas)
CREATE TABLE IF NOT EXISTS internacoes (
  id int NOT NULL AUTO_INCREMENT,
  assistida_id int NOT NULL COMMENT 'Referência à assistida (foreign key)',
  local varchar(255) COMMENT 'Local da internação',
  duracao varchar(100) COMMENT 'Duração da internação',
  data date COMMENT 'Data da internação',
  createdAt timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT 'Data de criação',
  updatedAt timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL COMMENT 'Última atualização',
  PRIMARY KEY (id),
  KEY idx_internacoes_assistida_id (assistida_id),
  KEY data (data),
  CONSTRAINT fk_internacoes_assistida FOREIGN KEY (assistida_id) REFERENCES assistidas (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 9. Tabela medicamentos_utilizados (com FK para assistidas)
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

-- 12. Verificar estruturas criadas
SELECT 'Tabelas criadas com sucesso!' as status;
