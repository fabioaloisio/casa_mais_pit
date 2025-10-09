# Scripts do Casa Mais

Scripts para gerenciamento completo do banco de dados seguindo princípios DRY.

---

## 🚀 Setup Rápido

### Opção 1: Setup Completo (Recomendado)

```bash
# Setup completo: cria estrutura + popula dados
npm run db:setup
```

### Opção 2: Reset + Setup

```bash
# Remove tudo + cria + popula (banco limpo)
npm run db:full-reset
```

### Opção 3: Comandos Individuais

```bash
# Criar apenas estrutura
npm run db:create

# Popular apenas dados
npm run db:populate

# Reset apenas (remove tabelas)
npm run db:reset
```

### Opção 4: SQL Direto

**⚠️ Não recomendado** - Comando `ps` pode capturar senha do banco de dados

```bash
# Criar estrutura
mysql -u root -p casamais_db < scripts/sql/create_tables.sql

# Popular dados
mysql -u root -p casamais_db < scripts/sql/populate_data.sql

# Reset (remover tabelas)
mysql -u root -p casamais_db < scripts/sql/reset_tables.sql
```

---

## 📁 Arquivos de Script

### JavaScript (Executores)

- **`db-create.js`** - Executa `create_tables.sql`
- **`db-populate.js`** - Executa `populate_data.sql`
- **`db-reset.js`** - Executa `reset_tables.sql`

### SQL (Fonte da Verdade)

- **`sql/create_tables.sql`** - Estrutura completa das tabelas do sistema
- **`sql/populate_data.sql`** - Dados de exemplo para desenvolvimento
- **`sql/reset_tables.sql`** - Remove todas as tabelas
- **`sql/create_campanhas_tables.sql`** - Tabelas de campanhas
- **`sql/populate_additional_data.sql`** - Dados adicionais
- **`sql/populate_users_all_profiles.sql`** - Usuários de teste com todos os perfis

### Utilitários

- **`utils/sql-executor.js`** - Classe para executar arquivos SQL

### Scripts de Usuários

- **`verify-users.js`** - Verifica e lista todos os usuários do sistema com seus status
- **`create-admin-user.js`** - Cria um usuário administrador
- **`create-test-user.js`** - Cria usuário de teste para desenvolvimento
- **`create-users-direct.js`** - Cria múltiplos usuários diretamente no banco
- **`add-blocked-user.js`** - Adiciona um usuário bloqueado (para testes de status)
- **`generate-hash.js`** - Gera hash bcrypt para senhas

### Scripts Auxiliares (na raiz do backend)

- **`../check-users.js`** - Verifica usuários e cria admin se necessário
- **`../reset-admin-password.js`** - Reseta senha do administrador para 123456
- **`../check-maria-history.js`** - Verifica histórico de status de usuário específico

---

## 📋 Estrutura Criada

### Sistema de 17+ Tabelas:

#### **Tabelas Base (sem FK)**

- `tipos_despesas` - Categorias de despesas
- `doadores` - Doadores PF/PJ
- `unidades_medida` - Unidades para medicamentos
- `assistidas` - Pessoas assistidas
- `usuarios` - Usuários do sistema
- `substancias` - Substâncias psicoativas

#### **Tabelas com FK**

- `despesas` → `tipos_despesas`
- `doacoes` → `doadores`
- `medicamentos` → `unidades_medida`
- `consultas` → `assistidas`
- `internacoes` → `assistidas`
- `medicamentos_utilizados` → `assistidas`, `medicamentos`
- `drogas_utilizadas` → `assistidas`, `substancias`

#### **Módulo Financeiro**

- `caixa_movimentacoes` - Movimentações de caixa
- `caixa_fechamentos` - Fechamentos periódicos de caixa
- `campanhas` - Campanhas de arrecadação

#### **Módulo de Autenticação/Gestão**

- `password_reset_tokens` - Tokens de reset de senha
- `usuarios_aprovacoes_log` - Log de aprovações de usuários
- `usuarios_status_historico` - Histórico de mudanças de status

---

## 📊 Dados Incluídos

### Dados Operacionais

- **10 tipos de despesas** (Alimentação, Medicamentos, etc.)
- **20 doadores** (12 PF + 8 PJ com dados realistas)
  - 8 doadores ativos com doações (IDs 1-8)
  - 4 doadores inativos sem doações (IDs 9-12)
  - 8 doadores sem doações que podem ser excluídos (IDs 13-20)
- **10 despesas** de exemplo com diferentes categorias
- **10 doações** de exemplo vinculadas aos doadores ativos
- **6 unidades de medida** para medicamentos
- **20 medicamentos** comuns na área de saúde
- **7 assistidas** com perfis variados e diferentes status
- **10 substâncias** psicoativas comuns

### Dados de Usuários

- **6 usuários** com diferentes tipos e status:
  - 1 Administrador ativo (Fábio Aloisio)
  - 1 Financeiro ativo
  - 1 Colaborador pendente
  - 1 Aprovado aguardando ativação
  - 1 Rejeitado
  - 1 Bloqueado

### Dados de Saúde

- **Consultas médicas** de exemplo
- **Internações** com diferentes status
- **Médicos** e **Especialidades** cadastrados

### Dados Financeiros

- **Movimentações de caixa** (entradas e saídas)
- **Fechamentos de caixa** periódicos
- **Campanhas** de arrecadação ativas e encerradas

---

## ⚡ Características Técnicas

- **Engine**: InnoDB com charset utf8mb4
- **Foreign Keys**: `ON DELETE RESTRICT ON UPDATE CASCADE`
- **Índices**: Automáticos nas FKs e campos principais
- **Validação**: Documentos únicos, campos obrigatórios
- **Performance**: Estrutura otimizada para consultas
- **DRY**: Schema definido uma única vez nos SQLs
- **Segurança**: Senhas hasheadas com bcrypt
- **Auditoria**: Timestamps automáticos em todas as tabelas

---

## 📋 Scripts NPM Disponíveis

```bash
# Servidor
npm start                    # Inicia servidor de produção
npm run dev                  # Inicia servidor de desenvolvimento

# Banco de Dados - Scripts Principais
npm run db:create            # Cria estrutura do banco
npm run db:populate          # Popula dados de exemplo
npm run db:setup             # Setup completo (criar + popular)
npm run db:reset             # Remove todas as tabelas
npm run db:full-reset        # Reset + setup completo

# Banco de Dados - Scripts de Teste
npm run db:test-dashboard    # Testa dados do dashboard

# Gestão de Usuários
node scripts/verify-users.js          # Lista todos os usuários
node scripts/create-admin-user.js     # Cria administrador
node scripts/create-test-user.js      # Cria usuário teste
node scripts/generate-hash.js [senha] # Gera hash de senha
node check-users.js                   # Verifica/cria admin
node reset-admin-password.js          # Reseta senha admin
```

---

## 🎯 Fluxos de Uso

### Novo desenvolvedor:

```bash
npm run db:setup
```

### Desenvolvimento/testes:

```bash
npm run db:full-reset
```

### Apenas estrutura:

```bash
npm run db:create
```

### Apenas dados:

```bash
npm run db:populate
```

---

## 🔐 Gestão de Usuários

### Criar Administrador

```bash
node scripts/create-admin-user.js
```

Será solicitado:

- Email
- Nome completo
- Senha (mínimo 6 caracteres)
- Confirmação de senha

### Verificar Usuários

```bash
node scripts/verify-users.js
```

Lista todos os usuários com:

- ID
- Nome
- Email
- Tipo (Administrador/Financeiro/Colaborador)
- Status (ativo/pendente/bloqueado/rejeitado)

### Gerar Hash de Senha

```bash
node scripts/generate-hash.js minha_senha_123
```

Gera hash bcrypt para uso direto no banco.

---

## 📊 Estrutura das Tabelas SQL

### create_tables.sql

Contém definição completa de **17+ tabelas**:

1. Tabelas base (6)
2. Tabelas com relacionamentos (7)
3. Módulo financeiro (3)
4. Módulo de autenticação (3+)

Cada tabela inclui:

- Primary keys auto-increment
- Foreign keys com constraints
- Índices para performance
- Timestamps (created_at, updated_at)
- Validações (UNIQUE, NOT NULL)
- Defaults apropriados

### populate_data.sql

Popula dados realistas para desenvolvimento:

- Dados consistentes entre tabelas
- Relacionamentos válidos
- Diferentes cenários de teste
- Dados históricos para relatórios

### reset_tables.sql

Remove tabelas na ordem correta:

- Respeita constraints de FK
- Remove tabelas dependentes primeiro
- Usa `IF EXISTS` para segurança

---

## ✅ Benefícios

- ✅ **Setup instantâneo** - comandos organizados e rápidos
- ✅ **Estrutura completa** - 17+ tabelas com relacionamentos
- ✅ **Integridade garantida** - constraints e FKs automáticas
- ✅ **Dados prontos** - exemplos para testar imediatamente
- ✅ **DRY compliant** - sem duplicação de estruturas
- ✅ **Flexível** - comandos para diferentes cenários
- ✅ **Manutenível** - mudanças apenas nos arquivos SQL
- ✅ **Seguro** - senhas hasheadas, validações
- ✅ **Auditável** - histórico de mudanças

---

## 🔧 Troubleshooting

### Erro: "Access denied for user"

- Verifique credenciais no `.env`
- Teste conexão: `mysql -u root -p`
- Confirme que usuário tem permissões

### Erro: "Database does not exist"

- O script cria o banco automaticamente
- Se persistir, crie manualmente: `CREATE DATABASE casamais_db;`

### Erro: "Foreign key constraint fails"

- Execute na ordem: reset → create → populate
- Não execute scripts SQL parcialmente
- Use `npm run db:full-reset` para garantir

### Dados não aparecem no dashboard

```bash
npm run db:test-dashboard
```

### Preciso recriar tudo

```bash
npm run db:full-reset
```

---

## 📝 Boas Práticas

### Ao Modificar o Schema

1. **Edite apenas** os arquivos SQL em `/sql`
2. **Teste** com `npm run db:full-reset`
3. **Verifique** relacionamentos e constraints
4. **Documente** mudanças significativas
5. **Atualize** este README se necessário

### Ao Adicionar Dados de Teste

1. **Mantenha consistência** com dados existentes
2. **Respeite FKs** - dados relacionados devem existir
3. **Use IDs explícitos** quando necessário para testes
4. **Adicione comentários** explicando dados especiais

### Segurança

- **NUNCA** commite senhas reais
- **Use** dados fictícios em populate
- **Troque** senhas de teste em produção
- **Desative** usuários de teste em produção

---

## 📚 Estrutura de Arquivos SQL

```
scripts/
├── sql/
│   ├── create_tables.sql              # 17+ tabelas
│   ├── populate_data.sql              # Dados principais
│   ├── populate_additional_data.sql   # Dados extras
│   ├── populate_users_all_profiles.sql # Usuários teste
│   ├── create_campanhas_tables.sql    # Tabelas campanhas
│   └── reset_tables.sql               # Limpeza
├── utils/
│   └── sql-executor.js                # Executor SQL
├── db-create.js                       # Script criar
├── db-populate.js                     # Script popular
└── db-reset.js                        # Script resetar
```

---

## 🎓 Referência Rápida

```bash
# Setup inicial
npm run db:setup

# Resetar tudo
npm run db:full-reset

# Criar admin
node scripts/create-admin-user.js

# Listar usuários
node scripts/verify-users.js

# Testar dashboard
npm run db:test-dashboard
```

---

**Última atualização**: Outubro 2025
