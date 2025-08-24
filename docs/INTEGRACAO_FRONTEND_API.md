# Integração Frontend → API

## Setup Rápido

```bash
npm install              # Instalar dependências
npm run db:setup         # Configurar banco
npm run dev              # Iniciar ambos os serviços
```

## URLs

- Frontend: http://localhost:5173
- Backend: http://localhost:3003
- API: http://localhost:3003/api/\*

## Estrutura

```
packages/
├── frontend/src/services/    # Serviços HTTP
├── frontend/src/config/      # Configuração API
├── backend/src/routes/       # Endpoints REST
└── shared/src/validators/    # Validações comuns
```

## Funcionalidades

- **Assistidas**: CRUD completo + consultas
- **Medicamentos**: Gestão de estoque
- **Doações**: PF/PJ + estatísticas
- **Despesas**: Controle financeiro

## Endpoints

```
GET/POST/PUT/DELETE /api/assistidas
GET/POST/PUT/DELETE /api/medicamentos
GET/POST/PUT/DELETE /api/doacoes
GET /api/doacoes/estatisticas
```

## Teste

```bash
# Listar doações
curl http://localhost:3003/api/doacoes

# Criar doação
curl -X POST http://localhost:3003/api/doacoes \
  -H "Content-Type: application/json" \
  -d '{"tipoDoador": "PF", "nomeDoador": "Test", "valor": 100}'
```
