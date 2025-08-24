# Configuração do MySQL para Casa Mais

## 1. Instalação do MySQL

### Windows

#### Opção 1: MySQL Installer (Recomendado)
- Baixe o MySQL Installer em: https://dev.mysql.com/downloads/installer/
- Execute o instalador e siga as instruções
- Durante a instalação, defina a senha do usuário root
- **Importante**: Anote a senha para usar no arquivo `.env`

#### Opção 2: Chocolatey
```powershell
# Instalar Chocolatey (se não tiver)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Instalar MySQL
choco install mysql

# Iniciar serviço
net start mysql
```

#### Verificar instalação no Windows
```powershell
# Verificar se MySQL está rodando
net start | findstr MySQL

# Testar conexão
mysql -u root -p
```

### macOS

```bash
# Usando Homebrew
brew install mysql
brew services start mysql
```

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
```

## 2. Configuração Rápida (Recomendada)

### Método Automatizado

#### Windows (PowerShell/CMD)
```powershell
# 1. Navegar para o diretório do backend
cd packages/backend

# 2. Instalar dependências
npm install

# 3. (Opcional) Personalizar configurações MySQL
# Veja seção 3 se precisar alterar a senha padrão "3511"

# 4. Setup completo: criar estrutura + popular dados
npm run db:setup

# 6. (Opcional) Reset completo para desenvolvimento
npm run db:full-reset
```

#### macOS/Linux
```bash
# 1. Navegar para o diretório do backend
cd packages/backend

# 2. Instalar dependências
npm install

# 3. (Opcional) Personalizar configurações MySQL  
# Veja seção 3 se precisar alterar a senha padrão "3511"

# 4. Setup completo: criar estrutura + popular dados
npm run db:setup

# 6. (Opcional) Reset completo para desenvolvimento
npm run db:full-reset
```

## 3. Configurar Variáveis de Ambiente (Opcional)

**⚠️ Esta seção é OPCIONAL** - O sistema já funciona com configurações padrão:
- **Usuário**: root
- **Senha**: 3511 
- **Banco**: casamais_db
- **Host**: localhost:3306

### Personalizar configurações (apenas se necessário)

Se precisar alterar as configurações padrão, crie um arquivo `.env` em `packages/backend/`:

```env
# Apenas inclua as variáveis que deseja alterar
DB_PASSWORD=sua_senha_personalizada
# DB_HOST=localhost
# DB_USER=root  
# DB_NAME=casamais_db
# DB_PORT=3306
# DB_CONNECTION_LIMIT=10
```

**Dicas por Sistema Operacional:**

- **Windows**: Use o Bloco de Notas, Notepad++ ou VS Code para editar o `.env`
- **macOS**: Use TextEdit (modo texto simples), VS Code ou nano
- **Linux**: Use nano, vim ou VS Code

## 4. Estrutura do Banco de Dados

### Tabelas Criadas Automaticamente

O script `npm run db:create` cria automaticamente:

1. **Banco de dados**: `casamais_db`
2. **11 tabelas** com relacionamentos Foreign Key:
   - `tipos_despesas` - Categorias de despesas
   - `doadores` - Doadores PF/PJ
   - `despesas` - Registro de despesas
   - `doacoes` - Gestão de doações
   - `unidades_medida` - Unidades para medicamentos
   - `medicamentos` - Catálogo de medicamentos
   - `assistidas` - Cadastro de mulheres assistidas
   - `internacoes` - Histórico de internações
   - `medicamentos_utilizados` - Controle de medicamentos
   - `usuarios` - Usuários do sistema
   - `consultas` - Agendamento de consultas

### Arquivos SQL (Fonte da Verdade)

- `scripts/sql/create_tables.sql` - Criação do banco e todas as tabelas
- `scripts/sql/populate_data.sql` - Dados de exemplo para testes
- `scripts/sql/reset_tables.sql` - Remove todas as tabelas

## 5. Iniciar o Servidor

### Desenvolvimento (com hot reload)

```bash
npm run dev   # Usa nodemon para reiniciar automaticamente
```

### Produção

```bash
npm start
```

Você deve ver a mensagem: "Conectado com sucesso ao banco de dados"

## 6. Testar a API

### Criar um doador

```bash
curl -X POST http://localhost:3003/api/doadores \
  -H "Content-Type: application/json" \
  -d '{
    "tipo_doador": "PF",
    "nome": "João Silva",
    "documento": "12345678901",
    "email": "joao@email.com",
    "telefone": "11999999999",
    "endereco": "Rua das Flores, 123",
    "cidade": "São Paulo",
    "estado": "SP",
    "cep": "01234567"
  }'
```

### Criar uma doação

```bash
curl -X POST http://localhost:3003/api/doacoes \
  -H "Content-Type: application/json" \
  -d '{
    "doador_id": 1,
    "valor": 100.00,
    "data_doacao": "2025-08-24",
    "observacoes": "Doação mensal"
  }'
```

### Listar doações

```bash
curl http://localhost:3003/api/doacoes
```


## 7. Integração com Frontend

O frontend React já está configurado para consumir a API:

1. **Backend API**: http://localhost:3003/api (verificar porta configurada no backend)
2. **Frontend**: Configuração depende do frontend usado

### APIs Disponíveis

- ✅ **Doadores** (`/api/doadores`) - CRUD completo
- ✅ **Doações** (`/api/doacoes`) - CRUD com relacionamentos
- ✅ **Despesas** (`/api/despesas`) - Gestão de despesas e gastos
- ✅ **Medicamentos** (`/api/medicamentos`) - Gestão de estoque
- ✅ **Assistidas** (`/api/assistidas`) - Cadastro de pessoas assistidas
- ✅ **Tipos de Despesas** (`/api/tipos-despesas`) - Categorização
- ✅ **Unidades de Medida** (`/api/unidades-medida`) - Para medicamentos

## 8. Troubleshooting

### Erro de conexão

- Verifique se o MySQL está rodando:

  #### Windows
  ```powershell
  # Verificar serviços em execução
  net start | findstr MySQL
  
  # Iniciar MySQL se não estiver rodando
  net start mysql
  
  # Ou usando Services Manager
  services.msc
  # Procure por "MySQL" e inicie o serviço
  ```

  #### macOS
  ```bash
  brew services list
  brew services start mysql
  ```

  #### Linux
  ```bash
  sudo systemctl status mysql
  sudo systemctl start mysql
  ```

### Erro de autenticação

- Verifique as credenciais no arquivo .env
- Certifique-se que o usuário tem permissões no banco:
  ```sql
  GRANT ALL PRIVILEGES ON casamais_db.* TO 'root'@'localhost';
  FLUSH PRIVILEGES;
  ```

### Porta em uso

- Se a porta 3306 estiver em uso, altere no .env:
  ```env
  DB_PORT=3307
  ```

### Erro "process is not defined" no frontend

- O frontend usa Vite, que requer `import.meta.env` ao invés de `process.env`
- Variáveis de ambiente devem começar com `VITE_`

## 9. Backup e Restauração

### Fazer backup

#### Windows
```powershell
# PowerShell
mysqldump -u root -p casamais_db > "backup_casamais_$(Get-Date -Format 'yyyyMMdd').sql"

# CMD
mysqldump -u root -p casamais_db > backup_casamais_%date:~-4,4%%date:~-10,2%%date:~-7,2%.sql
```

#### macOS/Linux
```bash
mysqldump -u root -p casamais_db > backup_casamais_$(date +%Y%m%d).sql
```

### Restaurar backup

#### Windows
```powershell
mysql -u root -p casamais_db < backup_casamais_20250612.sql
```

#### macOS/Linux
```bash
mysql -u root -p casamais_db < backup_casamais_20250612.sql
```

## 10. Scripts Disponíveis

**⚠️ Importante**: Execute todos os comandos npm do diretório `packages/backend/`

### Servidor
- `npm run dev` - Inicia servidor com nodemon (hot reload)
- `npm start` - Inicia servidor em produção

### Banco de Dados (DRY-compliant)
- `npm run db:create` - Cria estrutura do banco
- `npm run db:populate` - Popula dados de exemplo
- `npm run db:setup` - Setup completo (criar + popular)
- `npm run db:reset` - Remove todas as tabelas
- `npm run db:full-reset` - Reset + setup completo

## 11. Estrutura de Arquivos SQL

```
packages/backend/scripts/sql/
├── create_tables.sql     # ✅ Criação do banco e 11 tabelas
├── populate_data.sql     # ✅ Dados de exemplo para testes
└── reset_tables.sql      # ✅ Remove todas as tabelas (DROP only)
```

### Executores JavaScript

```
packages/backend/scripts/
├── db-create.js          # ✅ Executa create_tables.sql
├── db-populate.js        # ✅ Executa populate_data.sql
├── db-reset.js           # ✅ Executa reset_tables.sql
└── utils/
    └── sql-executor.js   # ✅ Utilitário para executar arquivos SQL
```

**Nota**: Toda alteração na estrutura do banco deve ser feita apenas nos arquivos `.sql` para manter consistência.
