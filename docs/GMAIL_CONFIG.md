# Configuração do Gmail para Envio de E-mails

Este documento explica como configurar o Gmail para permitir que a aplicação Casa Mais envie e-mails através do SMTP do Google.

## Pré-requisitos

- Uma conta do Gmail
- Verificação em 2 etapas ativada na conta do Google

## Passo a Passo

### 1. Ativar Verificação em 2 Etapas

1. Acesse [myaccount.google.com](https://myaccount.google.com)
2. Clique em **Segurança** no menu lateral
3. Na seção "Como fazer login no Google", clique em **Verificação em duas etapas**
4. Siga as instruções para ativar a verificação em 2 etapas

### 2. Gerar Senha de Aplicativo

1. Ainda na página de Segurança, procure por **Senhas de app**
2. Clique em **Senhas de app** (pode aparecer apenas após ativar a verificação em 2 etapas)
3. Selecione o aplicativo: **E-mail**
4. Selecione o dispositivo: **Outro (nome personalizado)**
5. Digite um nome para identificar: `Casa Mais Sistema`
6. Clique em **Gerar**
7. **Copie a senha gerada** (16 caracteres) - você não conseguirá vê-la novamente

### 3. Configurar as Variáveis de Ambiente

Edite o arquivo `.env` na raiz do projeto e configure as seguintes variáveis:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=senha_de_aplicativo_de_16_caracteres
EMAIL_FROM=Casa Mais <noreply@casamais.org>
```

**Substitua:**

- `seu_email@gmail.com` pelo seu e-mail do Gmail
- `senha_de_aplicativo_de_16_caracteres` pela senha de aplicativo gerada no passo 2

### 4. Testar a Configuração

Para verificar se a configuração está funcionando:

1. Reinicie o servidor backend
2. Verifique os logs do servidor - deve aparecer uma mensagem de sucesso na configuração do e-mail
3. Teste alguma funcionalidade que envia e-mail (como recuperação de senha)

## Exemplo de Configuração

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=casa.mais.sistema@gmail.com

# SMTP_PASS=abcd efgh ijkl mnop # voce recebe com espaco, deve retirar e ficar assim:
SMTP_PASS=abcdefghijklmnop

EMAIL_FROM=Casa Mais <noreply@casamais.org>
```

## Troubleshooting

### Erro: "Invalid login"

- Verifique se a verificação em 2 etapas está ativada
- Confirme se você está usando a senha de aplicativo, não a senha normal da conta
- Verifique se o e-mail está correto

### Erro: "Connection timeout"

- Verifique sua conexão com a internet
- Confirme se a porta 587 não está bloqueada pelo firewall

### Erro: "Authentication failed"

- Gere uma nova senha de aplicativo
- Verifique se não há espaços extras na senha no arquivo .env

## Alternativas

Se você não conseguir configurar o Gmail, considere:

- Usar outro provedor de e-mail (Outlook, Yahoo, etc.)
- Usar um serviço de e-mail transacional (SendGrid, Mailgun, etc.)
- Configurar um servidor SMTP próprio

## Segurança

- **Nunca compartilhe** a senha de aplicativo
- **Não commit** o arquivo `.env` no repositório Git
- **Revogue senhas de aplicativo** não utilizadas periodicamente
- Use o arquivo `.env.example` como modelo sem dados sensíveis

## Links Úteis

- [Como gerar senhas de app - Google](https://support.google.com/accounts/answer/185833)
- [Verificação em duas etapas - Google](https://support.google.com/accounts/answer/185839)
- [Configurações de SMTP do Gmail](https://support.google.com/a/answer/176600)
