# 🏠 Casa Mais - Backend API

API Node.js/Express para sistema completo de gestão da Casa Mais - assistidas, medicamentos, doações, despesas, caixa e campanhas.

---

## 📋 Pré-requisitos

- Node.js (v16 ou superior)
- MySQL 8.0+ (em execução)
- NPM ou Yarn

---

## 🚀 Setup Completo do Sistema

### 1️⃣ Instalação de Dependências

```bash
# Na raiz do projeto monorepo
npm install

# Ou instale em cada pacote
cd packages/backend && npm install
cd packages/frontend && npm install
```

### 2️⃣ Configuração Interativa do Banco de Dados

#### Setup Completo com Admin Personalizado:

```bash
cd packages/backend

# Setup completo - limpa, cria estrutura e popula dados
npm run db:setup
```

**🎯 FLUXO INTERATIVO**:
O comando `db:setup` irá:

1. **Limpar** o banco (remove todas as tabelas)
2. **Criar** todas as tabelas do sistema
3. **Popular** dados de teste (assistidas, substâncias, etc.)
4. **Popular** 3 colaboradores de teste
5. **Solicitar** seus dados para criar o administrador

**Durante a execução você será perguntado:**

```
👤 CONFIGURAÇÃO DO ADMINISTRADOR
Para começar a desenvolver, vamos criar seu usuário administrador:

📧 Digite seu email: seuemail@exemplo.com
👤 Digite seu nome completo: Seu Nome
🔐 Digite uma senha segura: ******
🔐 Confirme a senha: ******
```

**Resultado:**

- ✅ **Administrador criado** com seus dados reais
- ✅ **3 colaboradores de teste** disponíveis
- ✅ **Dados de exemplo** completos
- ✅ **Pronto para desenvolver** imediatamente

### 3️⃣ Credenciais dos Colaboradores de Teste

Após executar o setup, você pode fazer login com:

| Email                          | Senha    | Tipo        | Permissões        |
| ------------------------------ | -------- | ----------- | ----------------- |
| joao.colaborador@casamais.org  | senha123 | Colaborador | Operações básicas |
| maria.colaborador@casamais.org | senha123 | Colaborador | Operações básicas |
| pedro.colaborador@casamais.org | senha123 | Colaborador | Operações básicas |

⚠️ **ATENÇÃO**: Estes são usuários de TESTE apenas!

### 4️⃣ Iniciar os Servidores

```bash
# Terminal 1 - Backend
cd packages/backend
npm start
# Servidor rodando em http://localhost:3003

# Terminal 2 - Frontend
cd packages/frontend
npm run dev
# Aplicação disponível em http://localhost:5173
```

---

## 🔧 Stack Tecnológico

- **Runtime**: Node.js 16+
- **Framework**: Express 5.1
- **Banco de Dados**: MySQL 8+ + mysql2
- **Arquitetura**: MVC + Repository Pattern
- **Autenticação**: JWT Tokens (jsonwebtoken)
- **Hashing**: bcrypt para senhas
- **Email**: Nodemailer (Gmail, SMTP)
- **Export**: PDFKit (PDF) + XLSX (Excel)
- **Utilitários**: uuid, dotenv

---

## 📁 Estrutura do Backend

```
src/
├── controllers/        # 20 controllers (lógica de negócio)
│   ├── authController.js
│   ├── activationController.js
│   ├── approvalController.js
│   ├── passwordController.js
│   ├── usuarioController.js
│   ├── assistidaController.js
│   ├── consultaController.js
│   ├── internacaoController.js
│   ├── substanciaController.js
│   ├── medicamentoController.js
│   ├── medicosController.js
│   ├── especialidadesController.js
│   ├── unidadeMedidaController.js
│   ├── doacaoController.js
│   ├── doadorController.js
│   ├── despesaController.js
│   ├── tipoDespesaController.js
│   ├── caixaController.js
│   ├── campanhaController.js
│   └── relatorioController.js
├── models/             # Modelos de dados
├── repository/         # Camada de acesso ao banco
├── routes/             # Rotas da API
├── services/           # Serviços (email, campanhas)
├── middleware/         # Auth e validações
└── config/             # Configuração do banco
```

---

## 📊 Banco de Dados - 17+ Tabelas

### Tabelas Base (sem FK)

- `tipos_despesas` - Categorias de despesas
- `doadores` - Doadores PF/PJ
- `unidades_medida` - Unidades para medicamentos
- `usuarios` - Usuários do sistema
- `assistidas` - Pessoas assistidas
- `substancias` - Substâncias psicoativas

### Tabelas com Relacionamentos

- `despesas` → tipos_despesas
- `doacoes` → doadores
- `medicamentos` → unidades_medida
- `drogas_utilizadas` → assistidas, substancias
- `medicamentos_utilizados` → assistidas, medicamentos
- `consultas` → assistidas
- `internacoes` → assistidas

### Módulo Financeiro

- `caixa_movimentacoes` - Movimentações de caixa
- `caixa_fechamentos` - Fechamentos periódicos
- `campanhas` - Campanhas de arrecadação

### Módulo de Autenticação/Gestão

- `password_reset_tokens` - Tokens de reset de senha
- `usuarios_aprovacoes_log` - Log de aprovações
- `usuarios_status_historico` - Histórico de mudanças

---

## 📊 Scripts de Desenvolvimento

### Scripts Principais

- `npm run dev` - Servidor desenvolvimento (com hot-reload via nodemon)
- `npm run start` - Servidor produção
- `npm run test` - Executar testes

### Scripts do Banco de Dados

- `npm run db:setup` - Setup completo do banco com dados
- `npm run db:create` - Criar apenas estrutura
- `npm run db:populate` - Popular apenas dados
- `npm run db:reset` - Remover todas as tabelas
- `npm run db:full-reset` - Reset completo + repopulação
- `npm run db:test-dashboard` - Testar e verificar dados do dashboard

---

## 🛠 API Endpoints

### Autenticação

```
POST /api/auth/login           # Login
POST /api/auth/logout          # Logout
GET  /api/auth/me              # Dados do usuário logado
POST /api/auth/reset-password  # Solicitar reset de senha
POST /api/auth/activate        # Ativar conta via token
```

### Gestão de Usuários

```
GET    /api/usuarios              # Listar usuários
POST   /api/usuarios              # Criar usuário
PUT    /api/usuarios/:id          # Atualizar usuário
DELETE /api/usuarios/:id          # Excluir usuário
POST   /api/usuarios/approval     # Aprovar/rejeitar usuário
GET    /api/usuarios/:id/history  # Histórico de status
```

### Assistidas e Saúde

```
GET/POST/PUT/DELETE /api/assistidas
GET/POST/PUT/DELETE /api/consultas
GET/POST/PUT/DELETE /api/internacoes
GET/POST/PUT/DELETE /api/substancias
GET/POST           /api/medicos
GET/POST           /api/especialidades
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
GET/POST/PUT/DELETE /api/campanhas
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

# Exportação (PDF/Excel)
POST /api/relatorios/{tipo}/pdf
POST /api/relatorios/{tipo}/excel
```

---

## ⚙️ Configuração

Configure `.env`:

```env
# Banco de Dados
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=casamais_db

# Servidor
PORT=3003

# Autenticação
JWT_SECRET=seu_jwt_secret_muito_seguro_aqui
JWT_EXPIRES_IN=24h

# Email (para reset de senha e notificações)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_de_app_gmail
EMAIL_FROM="Casa Mais <noreply@casamais.org>"

# Frontend URL (para links em emails)
FRONTEND_URL=http://localhost:5173
```

---

## 📊 Estrutura de Permissões

| Tipo              | Acesso                                                         |
| ----------------- | -------------------------------------------------------------- |
| **Administrador** | Total - Gerencia usuários, relatórios, configurações           |
| **Financeiro**    | Caixa, doações, despesas, relatórios financeiros, campanhas    |
| **Colaborador**   | Assistidas, internações, consultas, medicamentos (operacional) |

---

## 🔐 Sistema de Autenticação

### Fluxo de Cadastro

1. Usuário se cadastra (`POST /api/usuarios`)
2. Status inicial: `pendente`
3. Email de ativação enviado
4. Usuário clica no link de ativação
5. Admin aprova ou rejeita o usuário
6. Status muda para `ativo` ou `rejeitado`

### Reset de Senha

1. Usuário solicita reset (`POST /api/auth/reset-password`)
2. Token gerado e salvo em `password_reset_tokens`
3. Email enviado com link contendo token
4. Token válido por 1 hora
5. Usuário define nova senha via link

### JWT Tokens

- Tokens gerados no login
- Expiração configurável (padrão: 24h)
- Validados em todas as rotas protegidas
- Contém: `id`, `email`, `tipo` do usuário

---

## ❓ Troubleshooting

### Dashboard mostrando valores zerados

- **Problema**: Dashboard em `/relatorios` exibindo todos os valores como zero
- **Solução**: Testar dados do dashboard:
  ```bash
  npm run db:test-dashboard
  ```
- **Alternativa**: Recriar banco com dados completos:
  ```bash
  npm run db:full-reset
  ```

### Erro: "Token de acesso requerido"

- Faça login novamente
- Verifique se o token não expirou
- Confirme que o header `Authorization: Bearer <token>` está presente

### Erro: "Apenas administradores podem..."

- Você está logado como colaborador
- Use uma conta de administrador ou ajuste as permissões

### Erro ao conectar com banco

- Verifique se MySQL está rodando: `mysql -u root -p`
- Confirme credenciais em `.env`
- Teste conexão: `mysql -u root -p casamais_db`

### Porta já em uso

```bash
# Matar processo na porta 3003 (backend)
lsof -ti:3003 | xargs kill

# Ou encontrar o processo
lsof -i :3003
```

### Emails não estão sendo enviados

- Verifique configurações de EMAIL\_\* no `.env`
- Para Gmail, use "Senha de App" (não a senha normal)
- Ative "Acesso a apps menos seguros" ou use OAuth2
- Consulte `/docs/GMAIL_CONFIG.md` para detalhes

---

## 🔐 Segurança

⚠️ **AVISOS IMPORTANTES**:

1. **TROQUE AS SENHAS** dos usuários de teste imediatamente
2. **NÃO USE** os colaboradores de teste em produção
3. **CRIE UM JWT_SECRET FORTE** (min 64 caracteres aleatórios)
4. **DESATIVE** usuários de teste após setup inicial
5. **CONFIGURE .env** com variáveis seguras para produção
6. **NUNCA commite** o arquivo `.env` no git
7. **Use HTTPS** em produção
8. **Implemente rate limiting** para APIs públicas

### Gerando JWT_SECRET Seguro

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 📝 Dependências Principais

```json
{
  "express": "^5.1.0", // Framework web
  "mysql2": "^3.14.3", // Driver MySQL
  "jsonwebtoken": "^9.0.2", // JWT tokens
  "bcrypt": "^6.0.0", // Hash de senhas
  "nodemailer": "^7.0.5", // Envio de emails
  "pdfkit": "^0.17.2", // Geração de PDFs
  "xlsx": "^0.18.5", // Exportação Excel
  "uuid": "^11.1.0", // Geração de UUIDs
  "cors": "^2.8.5", // CORS
  "dotenv": "^16.5.0" // Variáveis de ambiente
}
```

---

## 📝 Resumo do Setup

**✅ O que você tem agora:**

1. **Sistema completo** configurado e rodando
2. **Seu admin** criado com acesso total
3. **Dados de teste** realísticos para desenvolvimento
4. **3 colaboradores** de teste para simular diferentes perfis
5. **17+ tabelas** com relacionamentos completos
6. **20 controllers** implementados
7. **API REST** completa
8. **Sistema de autenticação** com JWT
9. **Envio de emails** configurado
10. **Exportação** PDF e Excel funcionando

**🚀 Como começar a desenvolver:**

1. Acesse http://localhost:5173
2. Faça login com suas credenciais de admin
3. Explore todas as funcionalidades
4. Use colaboradores de teste para simular diferentes cenários
5. Desenvolva novas features com dados realísticos

---

## 📚 Módulos Implementados

### ✅ Autenticação e Usuários

- Login/Logout com JWT
- Cadastro de usuários
- Aprovação de cadastros
- Ativação por email
- Reset de senha com tokens
- Histórico de mudanças de status
- 3 níveis de permissão

### ✅ Assistidas

- CRUD completo
- Perfil detalhado
- Validação de CPF/RG
- Status (ativo/inativo)

### ✅ Saúde

- Consultas médicas
- Internações
- Substâncias psicoativas
- Medicamentos utilizados
- Médicos e especialidades

### ✅ Medicamentos

- CRUD de medicamentos
- Controle de estoque
- Unidades de medida
- Entradas e saídas

### ✅ Financeiro

- Doações PF/PJ
- Doadores
- Despesas por categoria
- Tipos de despesas
- Caixa (movimentações e fechamentos)
- Campanhas de arrecadação

### ✅ Relatórios

- Dashboard com estatísticas
- Relatórios por categoria
- Exportação PDF
- Exportação Excel
- Filtros por período

---

**Dúvidas?** Consulte a documentação completa em `/docs`

**Última atualização**: Outubro 2025
