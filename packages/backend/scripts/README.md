# Scripts do Casa Mais

Scripts para gerenciamento completo do banco de dados seguindo princípios DRY.

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

## 📁 Arquivos de Script

### JavaScript (Executores)

- **`db-create.js`** - Executa `create_tables.sql`
- **`db-populate.js`** - Executa `populate_data.sql`
- **`db-reset.js`** - Executa `reset_tables.sql`

### SQL (Fonte da Verdade)

- **`sql/create_tables.sql`** - Estrutura completa das tabelas do sistema
- **`sql/populate_data.sql`** - Dados de exemplo para desenvolvimento
- **`sql/reset_tables.sql`** - Remove todas as tabelas

### Utilitários

- **`utils/sql-executor.js`** - Classe para executar arquivos SQL

## 📋 Estrutura Criada

### Sistema de 11 Tabelas:

#### **Tabelas Base (sem FK)**

- `tipos_despesas` - Categorias de despesas
- `doadores` - Doadores PF/PJ
- `unidades_medida` - Unidades para medicamentos
- `assistidas` - Pessoas assistidas
- `usuarios` - Usuários do sistema

#### **Tabelas com FK**

- `despesas` → `tipos_despesas`
- `doacoes` → `doadores`
- `medicamentos` → `unidades_medida`
- `consultas` → `assistidas`
- `internacoes` → `assistidas`
- `medicamentos_utilizados` → `assistidas`, `medicamentos`

## 📊 Dados Incluídos

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

## ⚡ Características Técnicas

- **Engine**: InnoDB com charset utf8mb4
- **Foreign Keys**: `ON DELETE RESTRICT ON UPDATE CASCADE`
- **Índices**: Automáticos nas FKs e campos principais
- **Validação**: Documentos únicos, campos obrigatórios
- **Performance**: Estrutura otimizada para consultas
- **DRY**: Schema definido uma única vez nos SQLs

## 📋 Scripts NPM Disponíveis

```bash
# Servidor
npm start                    # Inicia servidor de produção
npm run dev                  # Inicia servidor de desenvolvimento

# Banco de Dados
npm run db:create            # Cria estrutura do banco
npm run db:populate          # Popula dados de exemplo
npm run db:setup             # Setup completo (criar + popular)
npm run db:reset             # Remove todas as tabelas
npm run db:full-reset        # Reset + setup completo

```

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

## ✅ Benefícios

- ✅ **Setup instantâneo** - comandos organizados e rápidos
- ✅ **Estrutura completa** - 11 tabelas com relacionamentos
- ✅ **Integridade garantida** - constraints e FKs automáticas
- ✅ **Dados prontos** - exemplos para testar imediatamente
- ✅ **DRY compliant** - sem duplicação de estruturas
- ✅ **Flexível** - comandos para diferentes cenários
- ✅ **Manutenível** - mudanças apenas nos arquivos SQL
