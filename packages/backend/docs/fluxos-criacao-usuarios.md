# Fluxos de Criação de Usuários - Casa Mais

## Visão Geral

O sistema Casa Mais possui dois fluxos para criação e ativação de usuários:
1. **Criação pelo Admin** - Admin cria usuário que define sua própria senha
2. **Auto-registro** - Usuário se cadastra e aguarda aprovação do admin

---

## Fluxo 1: Admin cria usuário

**Quando usar:** Quando o admin precisa criar uma conta para um novo colaborador, funcionário ou administrador.

### Processo:

1. **Admin acessa painel de gestão de usuários**
2. **Preenche formulário com:**
   - Nome completo ✅
   - Email válido ✅
   - Tipo de usuário (Administrador, Financeiro, Colaborador) ✅
   - **SEM campos de senha ou confirmação de senha**
3. **Sistema:**
   - Cria usuário com status `aprovado`
   - Senha: `null`
   - Gera token de ativação
   - Envia email "Configure Sua Conta" com link de ativação
4. **Usuário:**
   - Recebe email
   - Clica no link de ativação
   - Define sua própria senha
5. **Conta ativada:**
   - Status: `ativo`
   - Usuário pode fazer login

### Interface Admin:

**Campos obrigatórios:**
- Nome completo
- Email válido
- Tipo de usuário

**Campos removidos:**
- ❌ Senha
- ❌ Confirmação de senha

### Endpoint:

```http
POST /api/usuarios
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "nome": "Maria Santos",
  "email": "maria@example.com",
  "tipo": "Financeiro"
}
```

### Resposta de Sucesso:

```json
{
  "success": true,
  "message": "Usuário cadastrado com sucesso. Um email foi enviado para que ele defina sua senha.",
  "data": {
    "id": 5,
    "nome": "Maria Santos",
    "email": "maria@example.com",
    "tipo": "Financeiro",
    "status": "aprovado"
  }
}
```

### Vantagens:

✅ **Mais seguro** - Usuário define própria senha
✅ **Sem senha em texto plano** - Nenhuma senha trafega por email
✅ **Profissional** - Email claro com instruções
✅ **Auditável** - Fica registrado quando usuário ativou conta

---

## Fluxo 2: Auto-registro de Usuário

**Quando usar:** Quando uma pessoa deseja se cadastrar no sistema (voluntário, interessado em ajudar).

### Processo:

1. **Usuário acessa a página de registro** (`/register`)
2. **Preenche:**
   - Nome
   - Email
   - Senha
3. **Sistema cria usuário:**
   - Status: `pendente` ⏳
   - Envia notificação para administradores
4. **Usuário aguarda aprovação do admin**
   - Não pode fazer login enquanto status for `pendente`
5. **Admin revisa e aprova/rejeita:**
   - **Se aprovar:** Status muda para `ativo` → Usuário recebe email de aprovação → Pode fazer login
   - **Se rejeitar:** Status muda para `rejeitado` → Usuário recebe email de rejeição
6. **Usuário aprovado pode fazer login:**
   - Status: `ativo`
   - Acessa sistema com email e senha cadastrados

### Endpoint:

```http
POST /api/auth/register
Content-Type: application/json

{
  "nome": "João Silva",
  "email": "joao@example.com",
  "senha": "senhaSegura123"
}
```

### Resposta de Sucesso:

```json
{
  "success": true,
  "message": "Cadastro realizado com sucesso. Aguarde aprovação do administrador."
}
```

### Fluxo de Aprovação (Admin):

```http
POST /api/approval/:id/approve
Authorization: Bearer {admin_token}
```

**Sistema ao aprovar:**
- Muda status: `pendente` → `ativo`
- Envia email de aprovação para o usuário
- Usuário pode fazer login imediatamente

---

## Comparação dos Fluxos

| Aspecto                  | Fluxo 1: Admin cria | Fluxo 2: Auto-registro |
| ------------------------ | ------------------- | ---------------------- |
| **Quem cria**            | Admin               | Próprio usuário        |
| **Aprovação admin**      | ⚠️ Automática       | ✅ Sim (obrigatória)   |
| **Usuário define senha** | ✅ Sim (via email)  | ✅ Sim (no cadastro)   |
| **Status inicial**       | `aprovado`          | `pendente`             |
| **Login imediato**       | ❌ Não (após email) | ❌ Não (após aprovação)|
| **Segurança**            | ⭐⭐⭐⭐⭐         | ⭐⭐⭐⭐⭐             |
| **Recomendado para**     | Novos colaboradores | Cadastros públicos     |

---

## Status de Usuário

### Estados possíveis:

- **pendente:** Aguardando aprovação do admin (auto-registro apenas)
- **aprovado:** Aprovado, aguardando definir senha (criação por admin apenas)
- **ativo:** Conta totalmente ativa, pode fazer login
- **rejeitado:** Cadastro rejeitado pelo admin
- **bloqueado:** Conta bloqueada pelo admin
- **suspenso:** Conta temporariamente suspensa
- **inativo:** Conta desativada

### Transições válidas:

```
Fluxo 1 (Admin cria):
aprovado → ativo              (usuário define senha via email)

Fluxo 2 (Auto-registro):
pendente → ativo              (admin aprova)
pendente → rejeitado          (admin rejeita)

Ações administrativas:
ativo → bloqueado/suspenso    (admin bloqueia)
```

---

## Emails Enviados

### Fluxo 1 (Admin cria):

1. **Email "Configure Sua Conta"**
   - **Trigger:** Admin cria usuário
   - **Para:** Usuário criado
   - **Assunto:** "✅ Configure Sua Conta - Casa Mais"
   - **Contém:** Link de ativação (válido por 7 dias)

2. **Email de Boas-Vindas**
   - **Trigger:** Usuário define senha
   - **Para:** Usuário
   - **Assunto:** "🎉 Bem-vindo ao Casa Mais!"

### Fluxo 2 (Auto-registro):

1. **Notificação para Admin**
   - **Trigger:** Usuário se auto-registra
   - **Para:** Todos os administradores
   - **Assunto:** "🔔 Novo Cadastro Pendente - Casa Mais"

2. **Email de Aprovação**
   - **Trigger:** Admin aprova cadastro
   - **Para:** Usuário aprovado
   - **Assunto:** "✅ Sua Conta Foi Aprovada - Casa Mais"

3. **Email de Rejeição**
   - **Trigger:** Admin rejeita cadastro
   - **Para:** Usuário rejeitado
   - **Assunto:** "Cadastro Não Aprovado - Casa Mais"

---

## Exemplos de Uso

### Cenário 1: Nova funcionária entrando na equipe

**Usar:** Fluxo 1 (Admin cria)

```bash
# Admin cria usuário
POST /api/usuarios
{
  "nome": "Ana Paula Silva",
  "email": "ana.paula@casamais.org",
  "tipo": "Colaborador"
}

# Ana recebe email e define sua própria senha
# Resultado: Conta segura, Ana tem controle sobre credenciais
```

### Cenário 2: Voluntário quer ajudar

**Usar:** Fluxo 2 (Auto-registro)

```bash
# Voluntário se cadastra
POST /api/auth/register
{
  "nome": "Carlos Mendes",
  "email": "carlos@email.com",
  "senha": "senhaSegura456"
}

# Admin revisa e aprova
POST /api/approval/{id}/approve

# Carlos recebe email de aprovação e pode fazer login
```

---

## Segurança

### Boas Práticas Implementadas:

✅ Senhas sempre hasheadas com bcrypt (10 rounds)
✅ Tokens de ativação únicos (UUID v4)
✅ Tokens expiram após 7 dias
✅ Nenhuma senha trafega em texto plano por email (Fluxo 1)
✅ Validação de força de senha (mínimo 6 caracteres)
✅ Email de notificação quando senha é alterada

### Validações:

- Email formato válido (regex)
- Email único no sistema
- Senha mínima 6 caracteres (Fluxo 2)
- Tipo de usuário válido (enum)
- Nome completo obrigatório

---

## Modo Desenvolvimento

Quando `NODE_ENV !== 'production'`:

**Ao criar usuário (Fluxo 1):**

```json
{
  "success": true,
  "message": "Usuário cadastrado. Email não enviado (modo dev).",
  "data": { "..." },
  "dev_activation_url": "http://localhost:5174/activate/abc-123-def"
}
```

Isso permite testar o fluxo sem configurar SMTP.

---

## Troubleshooting

### Problema: Email de ativação não chegou (Fluxo 1)

**Soluções:**

1. Verificar configuração SMTP (`.env`)
2. Verificar pasta de spam
3. Admin pode reenviar email:

```http
POST /api/approval/:id/resend-activation
```

### Problema: Token de ativação expirado (Fluxo 1)

**Solução:**
Admin precisa reenviar novo email de ativação (gera novo token).

### Problema: Usuário auto-registrado não foi aprovado (Fluxo 2)

**Solução:**
Admin precisa acessar painel de aprovações e aprovar o usuário pendente.

---

## Referências de Código

- **Controller:** `src/controllers/usuarioController.js` (método `criar`)
- **Email Service:** `src/services/emailService.js`
- **Auth Controller:** `src/controllers/authController.js` (auto-registro)
- **Approval Controller:** `src/controllers/approvalController.js` (aprovação/rejeição)
- **Activation Controller:** `src/controllers/activationController.js` (ativação de conta)
