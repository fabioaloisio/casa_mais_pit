# 🏠 Casa Mais - Backend API

API Node.js/Express para sistema de gestão da Casa Mais.

---

## 📋 Pré-requisitos

- Node.js (v14 ou superior)
- MySQL (em execução)
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

- **Backend**: Node.js + Express
- **Banco de Dados**: MySQL + mysql2
- **Arquitetura**: MVC + Repository Pattern
- **Autenticação**: JWT Tokens
- **Estrutura**: 11 tabelas com Foreign Keys

---

## 📊 Scripts de Desenvolvimento

### Scripts Principais
- `npm run dev` - Servidor desenvolvimento (com hot-reload)
- `npm run start` - Servidor produção
- `npm run test` - Executar testes

### Scripts do Banco de Dados
- `npm run db:setup` - Setup completo do banco com dados do dashboard
- `npm run db:reset` - Reset banco
- `npm run db:check` - Verificar status do banco
- `npm run db:reset-data` - Resetar apenas dados (mantém estrutura)
- `npm run db:populate` - Popular dados incluindo dashboard
- `npm run db:test-dashboard` - Testar e verificar dados do dashboard
- `npm run db:fix-data` - Corrigir datas e status dos dados existentes
- `npm run db:full-reset` - Reset completo e repopulação

### Scripts Auxiliares
- `npm run logs` - Logs do backend

---

## 🛠 API Endpoints

```
GET/POST/PUT/DELETE /api/assistidas
GET/POST/PUT/DELETE /api/medicamentos
GET/POST/PUT/DELETE /api/doacoes
GET/POST/PUT/DELETE /api/doadores
GET/POST/PUT/DELETE /api/despesas
GET/POST/PUT/DELETE /api/tipos-despesas
GET/POST/PUT/DELETE /api/unidades-medida

# Relatórios
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

# Autenticação
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me
```

---

## ⚙️ Configuração

Configure `.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=casamais_db
PORT=3003
JWT_SECRET=seu_jwt_secret_aqui
```

---

## 📊 Estrutura de Permissões

| Tipo              | Acesso                                               |
| ----------------- | ---------------------------------------------------- |
| **Administrador** | Total - Gerencia usuários, relatórios, configurações |
| **Financeiro**    | Caixa, doações, despesas, relatórios financeiros     |
| **Colaborador**   | Assistidas, internações, consultas (operacional)     |

---

## ❓ Troubleshooting

### Dashboard mostrando valores zerados
- **Problema**: Dashboard em `/relatorios` exibindo todos os valores como zero
- **Soluções**:
  1. Testar dados do dashboard:
     ```bash
     npm run db:test-dashboard
     ```
  2. Corrigir dados existentes (ajustar datas e status):
     ```bash
     npm run db:fix-data
     ```
  3. Recriar banco com dados completos:
     ```bash
     npm run db:full-reset
     ```
- **Verificação**: Após correção, o dashboard deve mostrar:
  - Total de assistidas ativas
  - Internações em andamento
  - Consultas do mês atual
  - Despesas do mês
  - Doações recebidas

### Erro: "Token de acesso requerido"
- Faça login novamente
- Verifique se o token não expirou

### Erro: "Apenas administradores podem..."
- Você está logado como colaborador
- Crie um admin conforme instruções acima

### Erro ao conectar com banco
- Verifique se MySQL está rodando
- Confirme credenciais em .env

### Porta já em uso
```bash
# Matar processo na porta 3003 (backend)
lsof -ti:3003 | xargs kill

# Matar processo na porta 5173 (frontend)
lsof -ti:5173 | xargs kill
```

---

## 🔐 Segurança

⚠️ **AVISOS IMPORTANTES**:

1. **TROQUE AS SENHAS** dos usuários de teste imediatamente
2. **NÃO USE** os colaboradores de teste em produção
3. **CRIE UM ADMIN FORTE** com senha segura
4. **DESATIVE** usuários de teste após setup
5. **CONFIGURE .env** com variáveis seguras para produção

---

## 📝 Resumo do Setup

**✅ O que você tem agora:**

1. **Sistema completo** configurado e rodando
2. **Seu admin** criado com acesso total
3. **Dados de teste** realísticos para desenvolvimento
4. **3 colaboradores** de teste para simular diferentes perfis
5. **Zero fricção** para começar a desenvolver

**🚀 Como começar a desenvolver:**

1. Acesse http://localhost:5173
2. Faça login com suas credenciais de admin
3. Explore todas as funcionalidades
4. Use colaboradores de teste para simular diferentes cenários
5. Desenvolva novas features com dados realísticos

---

**Dúvidas?** Consulte a documentação completa em `/docs`

**Última atualização**: Janeiro 2025
