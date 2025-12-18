# Casa Mais

> **Status: ✅ Production Ready**

Sistema de gestão para organizações de assistência social - beneficiários, medicamentos, doações, despesas, caixa, campanhas e produção/vendas.

## Estrutura

```
├── packages/
│   ├── backend/          # API Node.js/Express + MySQL
│   │   ├── src/
│   │   │   ├── controllers/  # 25+ controllers (CRUD + lógica de negócio)
│   │   │   ├── models/       # Modelos de dados (MVC)
│   │   │   ├── routes/       # Rotas da API
│   │   │   ├── repository/   # Camada de acesso a dados
│   │   │   ├── services/     # Serviços (email, campanhas, etc)
│   │   │   ├── middleware/   # Autenticação e validações
│   │   │   └── config/       # Configuração do banco (Singleton)
│   │   └── scripts/      # Scripts de banco de dados
│   ├── frontend/         # App React/Vite + Bootstrap
│   │   └── src/
│   │       ├── components/   # Componentes reutilizáveis
│   │       ├── pages/        # 40+ páginas da aplicação
│   │       ├── services/     # Serviços HTTP/API
│   │       ├── contexts/     # Context API
│   │       ├── styles/       # Estilos globais
│   │       └── utils/        # Utilitários e máscaras
│   └── shared/           # Código compartilhado
│       ├── constants/    # Constantes globais
│       ├── validators/   # Validações
│       ├── utils/        # Formatadores e máscaras
│       └── helpers/      # Helpers financeiros
└── docs/                 # Documentação técnica
```

## Setup

```bash
npm install
npm run db:setup
npm run dev
```

## Comandos

```bash
npm run dev              # Backend + Frontend
npm run dev:backend      # Backend (porta 3003)
npm run dev:frontend     # Frontend (porta 5173)

npm run db:setup         # Criar e popular banco
npm run db:full-reset    # Reset completo do banco
npm run db:create        # Apenas criar estrutura
npm run db:populate      # Apenas popular dados
npm run db:reset         # Remover todas as tabelas

npm run build            # Build do frontend
npm run lint             # Linter
```

## Configuração

Copie `.env.example` para `.env` e configure:

```env
# Banco de Dados
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=casamais_db

# Servidor
PORT=3003

# Autenticação
JWT_SECRET=seu_jwt_secret_seguro

# Email (opcional - para reset de senha e notificações)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_app
```

## URLs

- Frontend: http://localhost:5173
- Backend API: http://localhost:3003
- API Docs: http://localhost:3003/api

## Stack Tecnológico

### Backend

- **Runtime**: Node.js 16+
- **Framework**: Express 5.1
- **Database**: MySQL 8+ via mysql2
- **Auth**: JWT (jsonwebtoken)
- **Email**: Nodemailer
- **Export**: PDFKit + XLSX
- **Security**: bcrypt para senhas
- **Arquitetura**: MVC + Singleton Pattern

### Frontend

- **Framework**: React 19.1
- **Build**: Vite 6.3
- **Routing**: React Router 7.6
- **UI**: Bootstrap 5.3 + React Bootstrap
- **Notificações**: React Toastify
- **Máscaras**: React IMask + React Input Mask

### Shared

- **Validações**: CPF, CNPJ, Email, Telefone
- **Formatadores**: Datas, Moeda, Documentos
- **Helpers**: Cálculos financeiros
- **Constantes**: Status, mensagens, roles

## Módulos Principais

### 💰 Sistema Financeiro

- **Doações e Doadores**: Gestão PF/PJ com validação de documentos
- **Despesas**: Controle por categorias
- **Caixa**: Movimentações e fechamentos de caixa
- **Campanhas**: Sistema de campanhas de arrecadação

### 👥 Gestão de Assistidas

- **Cadastro**: Perfil completo com documentos
- **HPR (História Pregressa)**: Fluxo completo com linha do tempo
- **Consultas Médicas**: Agendamento e histórico
- **Prescrições**: Sistema integrado às consultas com histórico acumulativo
- **Internações**: Controle de internações
- **Substâncias**: Registro de substâncias psicoativas utilizadas
- **Medicamentos**: Controle de medicamentos utilizados

### 💊 Controle de Medicamentos

- **Estoque**: Entradas e saídas
- **Unidades de Medida**: Gestão de unidades
- **Medicamentos**: CRUD completo com autocomplete
- **Prescrições**: Seletor de medicamentos integrado

### 🏭 Módulo de Produção e Vendas

- **Matérias-Primas**: Cadastro e controle de insumos
- **Receitas**: Composição de produtos com matérias-primas
- **Produtos**: Gestão de produtos finais com custo calculado
- **Vendas**: Registro de vendas com análise de lucro
- **Triggers**: Cálculo automático de custos via triggers no banco

### 👤 Administração

- **Gestão de Usuários**: CRUD com aprovação
- **Aprovação de Cadastros**: Sistema de workflow de aprovação
- **Ativação de Contas**: Ativação via email
- **Reset de Senha**: Sistema de tokens temporários
- **Exclusão e Reativação**: Sistema completo de exclusão e reativação de usuários
- **Controle de Acesso**: 3 níveis de permissão
- **Histórico**: Auditoria de mudanças de status

### 🩺 Gestão de Profissionais de Saúde

- **Médicos**: Cadastro completo de profissionais
- **Especialidades**: Gestão de especialidades médicas
- **Vinculação**: Associação médico-consulta

### 📊 Relatórios

- **Dashboards**: Visão geral do sistema
- **Relatórios Gerenciais**: Múltiplas categorias
- **Relatório de Caixa**: Completo com totalizadores
- **Exportação**: PDF (estilo dashboard) e Excel
- **Mobile**: Interface responsiva otimizada

## Banco de Dados

Sistema com **22+ tabelas** organizadas:

### Tabelas Base (sem FK)

- `tipos_despesas` - Categorias de despesas
- `doadores` - Doadores PF/PJ
- `unidades_medida` - Unidades para medicamentos
- `usuarios` - Usuários do sistema
- `assistidas` - Pessoas assistidas
- `substancias` - Substâncias psicoativas
- `medicos` - Profissionais de saúde
- `especialidades` - Especialidades médicas

### Tabelas com Relacionamentos

- `despesas` → tipos_despesas
- `doacoes` → doadores
- `medicamentos` → unidades_medida
- `drogas_utilizadas` → assistidas, substancias
- `medicamentos_utilizados` → assistidas, medicamentos
- `consultas` → assistidas, medicos
- `prescricoes` → consultas, medicamentos
- `internacoes` → assistidas

### Módulo Financeiro

- `caixa_movimentacoes` - Movimentações de caixa
- `caixa_fechamentos` - Fechamentos periódicos

### Módulo de Produção e Vendas

- `materias_primas` - Matérias-primas para produção
- `receitas` - Receitas/composições de produtos
- `receita_materias` - Relação receita-matéria prima
- `produtos` - Produtos finais
- `vendas` - Registro de vendas

### Módulo de Autenticação/Gestão

- `password_reset_tokens` - Tokens de reset de senha
- `usuarios_aprovacoes_log` - Log de aprovações
- `usuarios_status_historico` - Histórico de mudanças

## API Endpoints

### Autenticação

```
POST /api/auth/login           # Login
POST /api/auth/logout          # Logout
GET  /api/auth/me              # Dados do usuário logado
POST /api/auth/reset-password  # Reset de senha
POST /api/auth/activate        # Ativar conta
```

### Gestão de Usuários

```
GET/POST/PUT/DELETE /api/usuarios
POST /api/usuarios/approval    # Aprovar/rejeitar usuário
POST /api/usuarios/reactivate  # Reativar usuário excluído
```

### Assistidas e Saúde

```
GET/POST/PUT/DELETE /api/assistidas
GET/POST/PUT/DELETE /api/consultas
GET/POST/PUT/DELETE /api/prescricoes
GET/POST/PUT/DELETE /api/internacoes
GET/POST/PUT/DELETE /api/substancias
GET/POST/PUT/DELETE /api/medicos
GET/POST/PUT/DELETE /api/especialidades
```

### Medicamentos

```
GET/POST/PUT/DELETE /api/medicamentos
GET/POST/PUT/DELETE /api/unidades-medida
```

### Financeiro

```
GET/POST/PUT/DELETE /api/doacoes
GET/POST/PUT/DELETE /api/doadores
GET/POST/PUT/DELETE /api/despesas
GET/POST/PUT/DELETE /api/tipos-despesas
GET/POST           /api/caixa
GET/POST           /api/campanhas
```

### Produção e Vendas

```
GET/POST/PUT/DELETE /api/materias-primas
GET/POST/PUT/DELETE /api/receitas
GET/POST/PUT/DELETE /api/produtos
GET/POST/PUT/DELETE /api/vendas
```

### Relatórios

```
GET /api/relatorios/assistidas
GET /api/relatorios/despesas
GET /api/relatorios/consultas
GET /api/relatorios/doacoes
GET /api/relatorios/medicamentos
GET /api/relatorios/internacoes
GET /api/relatorios/doadores
GET /api/relatorios/caixa
GET /api/relatorios/vendas

# Exportação
POST /api/relatorios/{tipo}/pdf
POST /api/relatorios/{tipo}/excel
```

## Níveis de Acesso

Sistema com 3 níveis de permissão conforme especificação ERS:

### 🔴 Administrador

- Acesso total ao sistema
- Gerencia usuários e aprovações
- Exclusão e reativação de usuários
- Acesso a todos os relatórios
- Configurações do sistema

### 🟡 Financeiro

- Gerencia doações, doadores e despesas
- Controle de caixa e campanhas
- Módulo de produção e vendas
- Relatórios financeiros
- Tipos de despesas

### 🟢 Colaborador

- Gerencia assistidas e cadastros
- Consultas, prescrições e internações
- Medicamentos e estoque
- Substâncias psicoativas
- HPR e linha do tempo

Permissões implementadas em todas as rotas da API com validação por requisito funcional (RF_B1, RF_F3, etc.)

## Funcionalidades Principais

### ✅ Implementado

- ✅ Gestão completa de assistidas
- ✅ HPR e linha do tempo da assistida
- ✅ Controle de consultas médicas
- ✅ Sistema de prescrições médicas
- ✅ Gestão de médicos e especialidades
- ✅ Gestão de internações
- ✅ Controle de medicamentos e estoque
- ✅ Sistema de doações PF/PJ
- ✅ Controle de despesas por categoria
- ✅ Sistema de caixa com movimentações
- ✅ Relatório de caixa completo
- ✅ Campanhas de arrecadação
- ✅ Módulo de produção e vendas completo
- ✅ Gestão de usuários com aprovação
- ✅ Exclusão e reativação de usuários
- ✅ Ativação de contas por email
- ✅ Reset de senha com tokens
- ✅ Controle de substâncias psicoativas
- ✅ Relatórios gerenciais completos
- ✅ Exportação PDF e Excel
- ✅ Dashboard com estatísticas
- ✅ Sistema de permissões por role
- ✅ Auditoria de mudanças
- ✅ Interface responsiva mobile

## Requisitos

- Node.js >= 16.0.0
- npm >= 8.0.0
- MySQL 8.0+

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Setup do banco (primeira vez)
npm run db:setup

# Desenvolvimento
npm run dev

# Build de produção
npm run build
```

## Documentação Adicional

- [Backend README](packages/backend/README.md) - Detalhes da API
- [Frontend README](packages/frontend/README.md) - Detalhes do frontend
- [Shared README](packages/shared/README.md) - Código compartilhado
- [Scripts README](packages/backend/scripts/README.md) - Scripts de banco
- [Documentação MVC + Singleton](docs/documentacao_mvc_singleton.md) - Arquitetura

## Suporte

Para dúvidas ou problemas:

1. Consulte a documentação em `/docs`
2. Verifique os troubleshooting nos READMEs específicos
3. Entre em contato com a equipe de desenvolvimento

---

**Última atualização**: Dezembro 2025
