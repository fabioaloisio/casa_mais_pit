# Frontend

Interface React do sistema Casa Mais.

## Setup

```bash
# No monorepo
npm run dev:frontend

# Ou localmente
npm run dev
```

## Stack

- React 19 + Vite
- Bootstrap + React Bootstrap
- React Router
- React Icons

## Scripts

- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build produção
- `npm run lint` - ESLint

## Estrutura

```
src/
├── components/           # Componentes por módulo
├── pages/               # Páginas principais
├── services/            # Serviços HTTP 
├── utils/              # Utilitários (máscaras, validações)
└── config/             # Configuração API
```

## Funcionalidades

- Gestão de assistidas (CRUD + perfil)
- Medicamentos (estoque + unidades)
- Doações e doadores (PF/PJ + validações)
- Despesas (tipos + controle)
- Dashboard com estatísticas

## Config

Configure `.env` com:
```
VITE_API_URL=http://localhost:3000
```
