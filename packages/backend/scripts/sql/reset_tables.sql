-- Script para reset completo - remove todas as tabelas
-- Remove tudo sem recriar (evita violação DRY)

-- Usar o banco de dados
USE casamais_db;

-- RESET - Remover tabelas existentes (ordem importa por causa das FKs)
SET FOREIGN_KEY_CHECKS = 0;

-- Drop tabelas com FK primeiro

-- Módulo Produção & Vendas
DROP TABLE IF EXISTS vendas;
DROP TABLE IF EXISTS produtos;
DROP TABLE IF EXISTS receitas_materias_primas;
DROP TABLE IF EXISTS receitas;
DROP TABLE IF EXISTS materias_primas;

-- Módulo Campanhas
DROP TABLE IF EXISTS doadores_campanhas;
DROP TABLE IF EXISTS campanhas;

-- Módulo Caixa
DROP TABLE IF EXISTS caixa_fechamentos;
DROP TABLE IF EXISTS caixa_movimentacoes;

-- Módulo Saúde
DROP TABLE IF EXISTS drogas_utilizadas;
DROP TABLE IF EXISTS medicamentos_utilizados;
DROP TABLE IF EXISTS internacoes;
DROP TABLE IF EXISTS consultas;
DROP TABLE IF EXISTS medicamentos;

-- Módulo Financeiro
DROP TABLE IF EXISTS doacoes;
DROP TABLE IF EXISTS despesas;

-- Módulo Usuários
DROP TABLE IF EXISTS password_reset_tokens;
DROP TABLE IF EXISTS usuarios_aprovacoes_log;
DROP TABLE IF EXISTS usuarios_status_historico;

-- Drop tabelas base
DROP TABLE IF EXISTS substancias;
DROP TABLE IF EXISTS assistidas;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS doadores;
DROP TABLE IF EXISTS tipos_despesas;
DROP TABLE IF EXISTS unidades_medida;

-- Drop views também

-- Views Produção & Vendas
DROP VIEW IF EXISTS vw_relatorio_vendas_periodo;
DROP VIEW IF EXISTS vw_vendas_detalhadas;
DROP VIEW IF EXISTS vw_produtos_detalhados;
DROP VIEW IF EXISTS vw_receitas_detalhadas;

-- Views Campanhas
DROP VIEW IF EXISTS vw_campanhas_arrecadacao;
DROP VIEW IF EXISTS vw_ranking_doadores_campanha;
DROP VIEW IF EXISTS vw_doadores_historico_campanhas;

-- Views outras
DROP VIEW IF EXISTS vw_internacoes_ativas;
DROP VIEW IF EXISTS vw_saldo_caixa;
DROP VIEW IF EXISTS vw_consultas_hoje;

SET FOREIGN_KEY_CHECKS = 1;

-- Verificar que tabelas foram removidas
SELECT 'Reset completo realizado - todas as tabelas e views removidas!' as status;
