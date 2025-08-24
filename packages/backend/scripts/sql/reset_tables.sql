-- Script para reset completo - remove todas as tabelas
-- Remove tudo sem recriar (evita violação DRY)

-- Usar o banco de dados
USE casamais_db;

-- RESET - Remover tabelas existentes (ordem importa por causa das FKs)
SET FOREIGN_KEY_CHECKS = 0;

-- Drop tabelas com FK primeiro
DROP TABLE IF EXISTS medicamentos_utilizados;
DROP TABLE IF EXISTS internacoes;
DROP TABLE IF EXISTS consultas;
DROP TABLE IF EXISTS medicamentos;
DROP TABLE IF EXISTS doacoes;
DROP TABLE IF EXISTS despesas;

-- Drop tabelas base
DROP TABLE IF EXISTS assistidas;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS doadores;
DROP TABLE IF EXISTS tipos_despesas;
DROP TABLE IF EXISTS unidades_medida;

SET FOREIGN_KEY_CHECKS = 1;

-- Verificar que tabelas foram removidas
SELECT 'Reset completo realizado - todas as tabelas removidas!' as status;
