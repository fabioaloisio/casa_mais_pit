-- ============================================
-- SCRIPT PARA CRIAR TODOS OS PERFIS DE USUÁRIO
-- Sistema Casa+ - Gestão de Instituição
-- ============================================
--
-- 🎯 OBJETIVO: Popular tabela de usuários com todos os perfis
-- ✅ Inclui: Administrador, Financeiro e Colaboradores
--
-- 🔐 CREDENCIAIS DE ACESSO E STATUS:
-- ┌────────────────────────────────────────────────────────────────────────────────────┐
-- │ Perfil        │ Email                          │ Senha    │ Status    │ Login? │
-- ├────────────────────────────────────────────────────────────────────────────────────┤
-- │ Administrador │ fabioaloisio@gmail.com         │ 123456   │ ativo     │ ✅     │
-- │ Financeiro    │ financeiro@casamais.org        │ senha123 │ ativo     │ ✅     │
-- │ Colaborador   │ joao.pendente@casamais.org     │ N/A      │ pendente  │ ❌     │
-- │ Colaborador   │ maria.aprovada@casamais.org    │ N/A      │ aprovado  │ ❌     │
-- │ Colaborador   │ pedro.rejeitado@casamais.org   │ N/A      │ rejeitado │ ❌     │
-- │ Colaborador   │ ana.bloqueada@casamais.org     │ N/A      │ bloqueado │ ❌     │
-- └────────────────────────────────────────────────────────────────────────────────────┘
--
-- 📝 DEMONSTRAÇÃO DO SISTEMA DE STATUS:
-- • Usuários ATIVOS: Podem fazer login e usar o sistema
-- • Usuários PENDENTES: Aguardando aprovação do administrador
-- • Usuários APROVADOS: Podem ativar conta definindo senha via token
-- • Usuários REJEITADOS: Não podem mais acessar o sistema
-- • Usuários BLOQUEADOS: Bloqueados indefinidamente por motivos disciplinares
--
-- ⚠️ ATENÇÃO: Este script REMOVE usuários existentes antes de inserir
-- ============================================

USE casamais_db;

-- ========================================
-- 1. LIMPAR USUÁRIOS EXISTENTES (OPCIONAL)
-- ========================================
-- Descomente a linha abaixo se quiser remover todos os usuários antes de inserir
-- DELETE FROM usuarios WHERE email IN ('fabioaloisio@gmail.com', 'financeiro@casamais.org', 'joao.pendente@casamais.org', 'maria.aprovada@casamais.org', 'pedro.rejeitado@casamais.org', 'ana.bloqueada@casamais.org');

-- ========================================
-- 2. INSERIR TODOS OS PERFIS
-- ========================================
INSERT INTO usuarios (nome, email, senha, tipo, status, ativo, data_cadastro, data_aprovacao, token_ativacao, aprovado_por, data_bloqueio, motivo_bloqueio, bloqueado_por) VALUES
-- 👨‍💼 ADMINISTRADOR - ATIVO (senha: 123456)
-- Hash gerado com bcrypt.hash('123456', 10)
('Fábio Aloisio', 'fabioaloisio@gmail.com', '$2b$10$GsjI4cfCC4u1B2IFxISK6.mnGEc/hJ65BmiOIB5QCmCicXwh2dxey', 'Administrador', 'ativo', 1, NOW(), NOW(), NULL, NULL, NULL, NULL, NULL),

-- 💰 FINANCEIRO - ATIVO (senha: senha123)
-- Hash gerado com bcrypt.hash('senha123', 10)
('Usuário Financeiro', 'financeiro@casamais.org', '$2b$10$7toN9KYo2miv3yRV4OqrDebG1G5SjMMjxhFXgycgo86XfcxOkhXtC', 'Financeiro', 'ativo', 1, NOW(), NOW(), NULL, 1, NULL, NULL, NULL),

-- ⏳ COLABORADOR PENDENTE - Aguardando aprovação
('João Silva Pendente', 'joao.pendente@casamais.org', NULL, 'Colaborador', 'pendente', 0, DATE_SUB(NOW(), INTERVAL 2 DAY), NULL, NULL, NULL, NULL, NULL, NULL),

-- ✅ COLABORADOR APROVADO - Pode ativar conta com token
('Maria Santos Aprovada', 'maria.aprovada@casamais.org', NULL, 'Colaborador', 'aprovado', 0, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), 'tok_maria_activate_12345', 1, NULL, NULL, NULL),

-- ❌ COLABORADOR REJEITADO - Não pode acessar
('Pedro Costa Rejeitado', 'pedro.rejeitado@casamais.org', NULL, 'Colaborador', 'rejeitado', 0, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY), NULL, 1, NULL, NULL, NULL),

-- 🚫 COLABORADOR BLOQUEADO - Bloqueado por violação de políticas
('Ana Silva Bloqueada', 'ana.bloqueada@casamais.org', NULL, 'Colaborador', 'bloqueado', 0, DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), NULL, 1, DATE_SUB(NOW(), INTERVAL 2 DAY), 'Violação das políticas internas da instituição - conduta inadequada com assistidas', 1)

ON DUPLICATE KEY UPDATE
  nome = VALUES(nome),
  senha = VALUES(senha),
  tipo = VALUES(tipo),
  status = VALUES(status),
  ativo = VALUES(ativo),
  data_cadastro = VALUES(data_cadastro),
  data_aprovacao = VALUES(data_aprovacao),
  token_ativacao = VALUES(token_ativacao),
  aprovado_por = VALUES(aprovado_por),
  data_bloqueio = VALUES(data_bloqueio),
  motivo_bloqueio = VALUES(motivo_bloqueio),
  bloqueado_por = VALUES(bloqueado_por);

-- ========================================
-- 3. VERIFICAR INSERÇÃO
-- ========================================
SELECT
  '✅ USUÁRIOS CRIADOS/ATUALIZADOS COM SUCESSO!' as mensagem;

SELECT
  tipo as 'Perfil',
  nome as 'Nome',
  email as 'E-mail',
  status as 'Status',
  CASE ativo
    WHEN 1 THEN '✅ Pode Logar'
    ELSE '❌ Não Pode Logar'
  END as 'Acesso',
  CASE
    WHEN token_ativacao IS NOT NULL THEN '🔗 Token Disponível'
    WHEN status = 'rejeitado' THEN '📝 Rejeitado'
    ELSE '⚪ N/A'
  END as 'Detalhes'
FROM usuarios
WHERE email IN (
  'fabioaloisio@gmail.com',
  'financeiro@casamais.org',
  'joao.pendente@casamais.org',
  'maria.aprovada@casamais.org',
  'pedro.rejeitado@casamais.org',
  'ana.bloqueada@casamais.org'
)
ORDER BY
  FIELD(tipo, 'Administrador', 'Financeiro', 'Colaborador'),
  nome;

-- ========================================
-- 4. RESUMO DE PERFIS
-- ========================================
SELECT
  '📊 RESUMO DOS PERFIS CADASTRADOS:' as info;

SELECT
  tipo as 'Tipo de Perfil',
  COUNT(*) as 'Quantidade',
  GROUP_CONCAT(nome SEPARATOR ', ') as 'Usuários'
FROM usuarios
WHERE email IN (
  'fabioaloisio@gmail.com',
  'financeiro@casamais.org',
  'joao.pendente@casamais.org',
  'maria.aprovada@casamais.org',
  'pedro.rejeitado@casamais.org',
  'ana.bloqueada@casamais.org'
)
GROUP BY tipo
ORDER BY FIELD(tipo, 'Administrador', 'Financeiro', 'Colaborador');

-- ========================================
-- 5. POPULAR HISTÓRICO DE STATUS (DEMONSTRAÇÃO)
-- ========================================
-- 📝 Criando histórico de mudanças de status para demonstrar auditoria

INSERT INTO usuarios_status_historico (usuario_id, status_anterior, status_novo, alterado_por, motivo, data_alteracao)
SELECT
  u.id,
  'pendente',
  u.status,
  CASE
    WHEN u.status = 'ativo' THEN 1
    WHEN u.status IN ('aprovado', 'rejeitado', 'bloqueado') THEN 1
    ELSE NULL
  END,
  CASE u.status
    WHEN 'ativo' THEN 'Usuário ativado automaticamente durante população inicial'
    WHEN 'aprovado' THEN 'Aprovado pelo administrador - aguardando ativação'
    WHEN 'rejeitado' THEN 'Rejeitado por documentação incompleta'
    WHEN 'bloqueado' THEN 'Usuário bloqueado por violação das políticas internas'
    ELSE 'Cadastro inicial pendente'
  END,
  CASE u.status
    WHEN 'ativo' THEN u.data_aprovacao
    WHEN 'aprovado' THEN u.data_aprovacao
    WHEN 'rejeitado' THEN u.data_aprovacao
    WHEN 'bloqueado' THEN u.data_bloqueio
    ELSE u.data_cadastro
  END
FROM usuarios u
WHERE u.email IN (
  'fabioaloisio@gmail.com',
  'financeiro@casamais.org',
  'joao.pendente@casamais.org',
  'maria.aprovada@casamais.org',
  'pedro.rejeitado@casamais.org'
)
AND u.status != 'pendente'; -- Não criar histórico para usuários ainda pendentes

-- ========================================
-- 6. VERIFICAR HISTÓRICO CRIADO
-- ========================================
SELECT '📊 HISTÓRICO DE STATUS CRIADO!' as status;

SELECT
  '=== AUDITORIA DE STATUS ===' as info;

SELECT
  u.nome as 'Usuário',
  h.status_anterior as 'Status Anterior',
  h.status_novo as 'Status Atual',
  h.motivo as 'Motivo da Mudança',
  DATE_FORMAT(h.data_alteracao, '%d/%m/%Y %H:%i') as 'Data/Hora'
FROM usuarios_status_historico h
JOIN usuarios u ON h.usuario_id = u.id
WHERE u.email IN (
  'fabioaloisio@gmail.com',
  'financeiro@casamais.org',
  'joao.pendente@casamais.org',
  'maria.aprovada@casamais.org',
  'pedro.rejeitado@casamais.org'
)
ORDER BY h.data_alteracao DESC;

-- ========================================
-- FIM DO SCRIPT
-- ========================================
