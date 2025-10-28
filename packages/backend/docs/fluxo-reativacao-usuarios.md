# Fluxo de Reativação de Usuários - Casa Mais

## Visão Geral

O sistema permite reativar usuários que foram previamente desativados (status `inativo`), preservando todo o histórico e relacionamentos existentes. Quando um administrador tenta cadastrar um usuário com email de alguém inativo, o sistema detecta automaticamente e oferece a opção de reativação.

---

## Quando Usar

- Admin tenta criar novo usuário com email que já existe mas está inativo
- Necessidade de reativar conta de ex-colaborador/funcionário
- Reaproveitamento de email mantendo histórico de ações anteriores

---

## Fluxo Completo

### 1. Detecção Automática

Quando admin preenche formulário de criação com email inativo:

```
Admin → Preenche formulário → Clica "Cadastrar"
     ↓
Sistema verifica email
     ↓
Email existe? → Ativo? → Prossegue normalmente
             ↓
             Inativo? → Retorna HTTP 409
                      ↓
                      Frontend mostra diálogo de reativação
```

### 2. Diálogo de Confirmação

O sistema apresenta:

- **Dados atuais (inativo)**: Nome, email, tipo do usuário desativado
- **Novos dados**: Nome e tipo que serão aplicados
- **Informações**: O que acontecerá ao confirmar
- **Ações**: Botões "Cancelar" ou "Reativar Usuário"

### 3. Processo de Reativação

Ao confirmar reativação:

1. **Backend executa**:

   - Reativa usuário (status `inativo` → `ativo`)
   - Atualiza dados fornecidos (nome, tipo)
   - Define status como `aprovado` (aguardando ativação)
   - Gera novo token de ativação
   - Registra alteração no histórico
   - Envia email de ativação

2. **Usuário recebe email**:

   - Link de ativação único
   - Instruções para definir nova senha
   - Validade: 7 dias

3. **Usuário ativa conta**:
   - Acessa link do email
   - Define nova senha
   - Status muda: `aprovado` → `ativo`
   - Pode fazer login no sistema

---

## Componentes Técnicos

### Backend

#### Endpoints

**1. Validação de Email**

```http
POST /api/usuarios
Content-Type: application/json
Authorization: Bearer {token}

{
  "nome": "Maria Santos",
  "email": "maria@example.com",
  "tipo": "Colaborador"
}
```

**Resposta quando email inativo**:

```json
HTTP 409 Conflict
{
  "success": false,
  "message": "Email pertence a um usuário inativo",
  "errors": ["Este email está associado a um usuário inativo"],
  "data": {
    "canReactivate": true,
    "inactiveUserId": 123,
    "inactiveUserName": "Maria Santos",
    "inactiveUserEmail": "maria@example.com",
    "inactiveUserType": "Financeiro"
  }
}
```

**2. Reativação e Atualização**

```http
POST /api/usuarios/:id/reactivate-and-update
Content-Type: application/json
Authorization: Bearer {token}

{
  "nome": "Maria Santos Silva",
  "tipo": "Colaborador"
}
```

**Resposta de sucesso**:

```json
HTTP 200 OK
{
  "success": true,
  "message": "Usuário reativado com sucesso. Email de ativação enviado.",
  "data": {
    "id": 123,
    "nome": "Maria Santos Silva",
    "email": "maria@example.com",
    "tipo": "Colaborador",
    "status": "aprovado"
  }
}
```

#### Métodos do Repository

```javascript
// Verifica se email existe para usuários ativos
emailExistsActive(email): boolean

// Busca usuário inativo por email
findInactiveUserByEmail(email): Usuario | null
```

### Frontend

#### Componentes

1. **UsuarioModal**: Detecta erro 409 e aciona diálogo
2. **ReactivationConfirmDialog**: Mostra informações e confirma ação
3. **Usuarios (página)**: Coordena ações e atualiza lista

#### Service

```javascript
usuarioService.reactivateAndUpdate(userId, userData);
```

---

## Segurança e Integridade

### Dados Preservados

✅ **Mantém histórico completo**:

- Todos os registros em `usuarios_status_historico`
- Logs de aprovação em `usuarios_aprovacoes_log`
- Campanhas criadas (`campanhas.criado_por`)
- Doações registradas (`doadores_campanhas.usuario_registro_id`)
- Movimentações financeiras (`caixa_movimentacoes.usuario_id`)
- Consultas médicas (`consultas.*usuario_*`)

### Segurança

✅ **Mecanismos de proteção**:

- Senha antiga não pode ser reutilizada
- Usuário DEVE definir nova senha via email
- Token de ativação único (UUID v4)
- Token expira em 7 dias
- Admin que reativou fica registrado no histórico
- Email obrigatório notificando usuário

### Auditoria

Registro completo em `usuarios_status_historico`:

```sql
INSERT INTO usuarios_status_historico
(usuario_id, status_anterior, status_novo, alterado_por, motivo)
VALUES
(123, 'inativo', 'ativo', 456, 'Reativado por administrador com atualização de dados')
```

---

## Exemplo Prático

### Cenário

Ex-funcionária Maria Santos foi desativada há 3 meses. Agora retorna como colaboradora com novo tipo de acesso.

### Passo a Passo

1. **Admin acessa "Usuários" → "Novo Usuário"**
2. **Preenche formulário**:
   - Nome: Maria Santos Silva
   - Email: maria@example.com
   - Tipo: Colaborador
3. **Clica "Cadastrar"**
4. **Sistema detecta**: Email pertence a usuário inativo
5. **Diálogo aparece**:

   ```
   ⚠️ Usuário Inativo Encontrado

   Email maria@example.com pertence a um usuário desativado.

   📋 Dados Atuais (Inativo)     |  ✅ Novos Dados
   Nome: Maria Santos            |  Nome: Maria Santos Silva
   Email: maria@example.com      |  Email: maria@example.com
   Tipo: Financeiro              |  Tipo: Colaborador

   O que acontecerá:
   • Usuário será reativado no sistema
   • Dados serão atualizados
   • Email será enviado para definir nova senha
   • Histórico anterior será preservado
   ```

6. **Admin clica "Reativar Usuário"**
7. **Sistema executa**:
   - Reativa conta
   - Atualiza nome e tipo
   - Gera token
   - Envia email
8. **Maria recebe email**: "Configure Sua Conta - Casa Mais"
9. **Maria acessa link** e define nova senha
10. **Conta ativada**: Maria pode fazer login

### Resultado

- ✅ Conta de Maria reativada
- ✅ Dados atualizados conforme necessário
- ✅ Histórico preservado (campanhas, doações antigas)
- ✅ Nova senha definida por Maria
- ✅ Auditoria completa do processo

---

## Status do Usuário

### Transições

```
Fluxo de Reativação:
inativo → ativo (temporário) → aprovado → ativo (permanente)
   ↓           ↓                  ↓            ↓
Detectado  Reativado        Aguarda      Login
           por admin        senha        liberado
```

### Estados

- **inativo**: Usuário desativado/excluído (soft delete)
- **ativo** (temporário): Durante processo de reativação
- **aprovado**: Aguardando usuário definir senha via email
- **ativo** (permanente): Conta totalmente ativa, pode fazer login

---

## Validações

### Backend

✅ **Permissões**:

- Apenas administradores podem reativar usuários
- Verificado via `statusService.canPerformAction(user, 'reativar')`

✅ **Verificações**:

- Email deve pertencer a usuário com `status = 'inativo'`
- Usuário deve existir no banco
- Admin não pode estar bloqueado/suspenso

### Frontend

✅ **UX**:

- Diálogo claro com todas as informações
- Confirmação explícita do admin
- Loading state durante processo
- Toasts de feedback (sucesso/erro)

---

## Troubleshooting

### Email de ativação não chegou

**Solução**: Admin pode reenviar email manualmente

```http
POST /api/approval/:id/resend-activation
```

### Token expirado

**Solução**: Admin precisa reenviar novo email (gera novo token)

### Usuário não consegue ativar

**Causas possíveis**:

- Token inválido ou expirado
- Email incorreto no cadastro
- Problemas com servidor SMTP

**Solução**: Verificar logs e reenviar ativação

---

## Diferenças vs Criação Normal

| Aspecto             | Criação Normal      | Reativação                   |
| ------------------- | ------------------- | ---------------------------- |
| **Email**           | Deve ser único      | Pode reusar inativo          |
| **Histórico**       | Nenhum              | Preservado                   |
| **Senha**           | Define via email    | Define nova via email        |
| **Status inicial**  | `aprovado`          | `aprovado` (após reativação) |
| **Auditoria**       | Registro de criação | Registro de reativação       |
| **Relacionamentos** | Nenhum              | Mantém existentes            |

---

## Boas Práticas

✅ **Sempre confirmar com admin** antes de reativar
✅ **Verificar se dados estão corretos** antes de confirmar
✅ **Comunicar usuário** sobre reativação via email
✅ **Documentar motivo** da reativação (histórico)
✅ **Validar tipo de acesso** adequado ao retorno do usuário

---

## Referências de Código

### Backend

- **Repository**: `src/repository/usuarioRepository.js`
  - Métodos: `emailExistsActive()`, `findInactiveUserByEmail()`
- **Controller**: `src/controllers/usuarioController.js`
  - Método: `reactivateAndUpdate()`
- **Routes**: `src/routes/usuarioRoutes.js`
  - Rota: `POST /usuarios/:id/reactivate-and-update`

### Frontend

- **Service**: `src/services/usuarioService.js`
  - Método: `reactivateAndUpdate()`
- **Componentes**:
  - `src/components/usuarios/UsuarioModal.jsx`
  - `src/components/usuarios/ReactivationConfirmDialog.jsx`
- **Página**: `src/pages/Usuarios.jsx`
