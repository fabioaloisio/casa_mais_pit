USE casamais_db;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- REMOVER TABELAS EM ORDEM (FK → BASE)
-- ============================================

-- Tabelas dependentes (FK primeiro)
DROP TABLE IF EXISTS doadores_campanhas;
DROP TABLE IF EXISTS campanhas;

DROP TABLE IF EXISTS caixa_fechamentos;
DROP TABLE IF EXISTS caixa_movimentacoes;

DROP TABLE IF EXISTS drogas_utilizadas;
DROP TABLE IF EXISTS medicamentos_utilizados;

DROP TABLE IF EXISTS internacoes;
DROP TABLE IF EXISTS internacoes_anteriores;

DROP TABLE IF EXISTS consultas;
DROP TABLE IF EXISTS medicamentos;
DROP TABLE IF EXISTS substancias;

DROP TABLE IF EXISTS saidas;
DROP TABLE IF EXISTS hpr;

DROP TABLE IF EXISTS doacoes;
DROP TABLE IF EXISTS despesas;

DROP TABLE IF EXISTS password_reset_tokens;
DROP TABLE IF EXISTS usuarios_aprovacoes_log;
DROP TABLE IF EXISTS usuarios_status_historico;

-- Tabelas base (sem dependências)
DROP TABLE IF EXISTS assistidas;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS doadores;
DROP TABLE IF EXISTS tipos_despesas;
DROP TABLE IF EXISTS unidades_medida;

-- ============================================
-- REMOVER VIEWS
-- ============================================
DROP VIEW IF EXISTS vw_campanhas_arrecadacao;
DROP VIEW IF EXISTS vw_ranking_doadores_campanha;
DROP VIEW IF EXISTS vw_doadores_historico_campanhas;
DROP VIEW IF EXISTS vw_internacoes_ativas;
DROP VIEW IF EXISTS vw_saldo_caixa;
DROP VIEW IF EXISTS vw_consultas_hoje;

SET FOREIGN_KEY_CHECKS = 1;

SELECT 'Reset completo realizado - todas as tabelas e views foram removidas!' AS status;
