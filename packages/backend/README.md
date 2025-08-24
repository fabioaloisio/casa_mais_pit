# Backend

API Node.js/Express para Casa Mais.

## Setup

```bash
# No monorepo
npm run dev:backend

# Ou localmente  
npm run dev
```

## Stack

- Node.js + Express
- MySQL + mysql2
- Arquitetura MVC + Repository

## Scripts

- `npm run dev` - Servidor desenvolvimento  
- `npm run start` - Servidor produção
- `npm run db:setup` - Setup completo do banco
- `npm run db:reset` - Reset banco

## Endpoints

```
GET/POST/PUT/DELETE /api/assistidas
GET/POST/PUT/DELETE /api/medicamentos
GET/POST/PUT/DELETE /api/doacoes  
GET/POST/PUT/DELETE /api/doadores
GET/POST/PUT/DELETE /api/despesas
GET/POST/PUT/DELETE /api/tipos-despesas
GET/POST/PUT/DELETE /api/unidades-medida
```

## Banco

- MySQL: casamais_db
- 11 tabelas com Foreign Keys
- Dados exemplo inclusos
- Scripts SQL organizados em scripts/sql/

## Config

Configure `.env`:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=casamais_db
PORT=3000
```
