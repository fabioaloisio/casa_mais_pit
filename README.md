# Casa Mais

Sistema de gestão para organizações de assistência social - beneficiários, medicamentos, doações e despesas.

## Estrutura

```
├── packages/
│   ├── backend/          # API Node.js/Express + MySQL
│   │   ├── src/          # Controllers, models, routes, repository
│   │   ├── scripts/      # Scripts de banco de dados
│   │   └── config/       # Configuração do banco
│   ├── frontend/         # App React/Vite + Bootstrap
│   │   ├── src/          # Componentes, páginas, services
│   │   ├── components/   # Componentes reutilizáveis
│   │   └── pages/        # Páginas da aplicação
│   └── shared/           # Código compartilhado
│       ├── constants/    # Constantes globais
│       ├── validators/   # Validações
│       └── utils/        # Utilitários
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

npm run build            # Build do frontend
npm run lint             # Linter
```

## Configuração

Copie `.env.example` para `.env` e configure:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=casamais_db
PORT=3003
```

## URLs

- Frontend: http://localhost:5173
- Backend: http://localhost:3003

## Stack

- **Backend**: Node.js + Express + MySQL
- **Frontend**: React + Vite + Bootstrap
- **Shared**: Validações, formatadores, constantes

## Funcionalidades

- Gestão de beneficiários e consultas
- Controle de medicamentos e estoque
- Doações (PF/PJ) e despesas
- Relatórios financeiros
