# 🎨 Casa Mais - Frontend

Interface React moderna e responsiva para o sistema Casa Mais - gestão completa de assistidas, medicamentos, doações, despesas, caixa e campanhas.

---

## 📋 Pré-requisitos

- Node.js 16+
- NPM 8+
- Backend API rodando (porta 3003)

---

## 🚀 Setup

```bash
# No monorepo (raiz do projeto)
npm run dev:frontend

# Ou localmente no pacote
cd packages/frontend
npm install
npm run dev
```

Aplicação disponível em: **http://localhost:5173**

---

## 🔧 Stack Tecnológico

- **Framework**: React 19.1.0
- **Build Tool**: Vite 6.3.5
- **Routing**: React Router DOM 7.6.1
- **UI Framework**: Bootstrap 5.3.6 + React Bootstrap 2.10.10
- **Icons**: React Icons 5.5.0
- **Notificações**: React Toastify 11.0.5
- **Máscaras de Input**: React IMask 7.6.1 + React Input Mask 2.0.4
- **HTTP Client**: Fetch API nativa
- **State Management**: Context API + useState/useEffect

---

## 📁 Estrutura do Frontend

```
src/
├── components/           # Componentes reutilizáveis (17+ componentes)
│   ├── assistidas/       # Componentes de assistidas
│   ├── auth/             # Login, cadastro, reset senha
│   ├── consultas/        # Gestão de consultas
│   ├── dashboard/        # Cards e gráficos do dashboard
│   ├── doadores/         # Gestão de doadores
│   ├── doacoes/          # Gestão de doações
│   ├── internacoes/      # Gestão de internações
│   ├── medicamentos/     # Gestão de medicamentos
│   ├── relatorios/       # Componentes de relatórios
│   └── usuarios/         # Gestão de usuários
├── pages/                # Páginas principais (32+ páginas)
│   ├── ActivateAccount.jsx
│   ├── AgendarConsulta.jsx
│   ├── Assistidas.jsx
│   ├── CadastroUsuario.jsx
│   ├── Caixa.jsx
│   ├── Campanhas.jsx
│   ├── Consultas.jsx
│   ├── Dashboard.jsx
│   ├── Despesas.jsx
│   ├── DetalhesAssistida.jsx
│   ├── Doacoes.jsx
│   ├── Doadores.jsx
│   ├── EstoqueEntradas.jsx
│   ├── EstoqueSaidas.jsx
│   ├── GerenciarMedicamentos.jsx
│   ├── GerenciarTiposDespesas.jsx
│   ├── GerenciarUnidadesMedida.jsx
│   ├── Internacoes.jsx
│   ├── LancarDespesa.jsx
│   ├── Login.jsx
│   ├── Profile.jsx
│   ├── Relatorios.jsx
│   ├── ResetPassword.jsx
│   ├── Usuarios.jsx
│   └── substancias-psicoativas.jsx
├── services/             # Serviços de API (14+ services)
│   ├── api.js            # Configuração base do Axios/Fetch
│   ├── authService.js
│   ├── assistidaService.js
│   ├── consultaService.js
│   ├── internacaoService.js
│   ├── medicamentoService.js
│   ├── doacaoService.js
│   ├── doadorService.js
│   ├── despesaService.js
│   ├── caixaService.js
│   ├── campanhaService.js
│   ├── usuarioService.js
│   └── relatorioService.js
├── contexts/             # Contextos React
│   └── AuthContext.jsx   # Contexto de autenticação
├── utils/                # Utilitários
│   ├── formatters.js     # Formatação (datas, moeda, CPF/CNPJ)
│   └── validators.js     # Validações (usando @casa-mais/shared)
├── styles/               # Estilos globais
│   └── global.css
├── config/               # Configuração
│   └── api.js            # URLs da API
├── App.jsx               # Componente raiz
└── main.jsx              # Entry point
```

---

## 📱 Páginas Implementadas

### 🔐 Autenticação (4 páginas)

- **Login** - Autenticação de usuários
- **CadastroUsuario** - Cadastro de novos usuários
- **ActivateAccount** - Ativação de conta via email
- **ResetPassword** - Reset de senha
- **Profile** - Perfil do usuário logado

### 👥 Gestão de Assistidas (3 páginas)

- **Assistidas** - Listagem e CRUD
- **DetalhesAssistida** - Perfil completo da assistida
- **substancias-psicoativas** - Controle de substâncias

### 🏥 Saúde (3 páginas)

- **Consultas** - Gestão de consultas médicas
- **AgendarConsulta** - Agendamento de consultas
- **Internacoes** - Controle de internações

### 💊 Medicamentos (4 páginas)

- **GerenciarMedicamentos** - CRUD de medicamentos
- **EstoqueEntradas** - Controle de entradas
- **EstoqueSaidas** - Controle de saídas
- **GerenciarUnidadesMedida** - Gestão de unidades

### 💰 Financeiro (7 páginas)

- **Doacoes** - Gestão de doações
- **Doadores** - Cadastro de doadores (PF/PJ)
- **Despesas** - Listagem de despesas
- **LancarDespesa** - Lançamento de despesas
- **GerenciarTiposDespesas** - Tipos de despesas
- **Caixa** - Controle de caixa
- **Campanhas** - Campanhas de arrecadação

### 👤 Administração (1 página)

- **Usuarios** - Gestão completa de usuários (aprovação, ativação, etc)

### 📊 Relatórios e Dashboard (2 páginas)

- **Dashboard** - Visão geral do sistema
- **Relatorios** - Relatórios gerenciais com exportação

---

## 🎨 Componentes Principais

### Layout

- **Navbar** - Navegação principal
- **Sidebar** - Menu lateral (responsivo)
- **Footer** - Rodapé da aplicação

### Forms

- **FormularioAssistida** - Form completo com validações
- **FormularioConsulta** - Agendamento de consultas
- **FormularioDoacao** - Registro de doações
- **FormularioDoador** - Cadastro PF/PJ
- **FormularioDespesa** - Lançamento de despesas

### Cards e Listas

- **CardAssistida** - Card de resumo
- **CardEstatistica** - Cards do dashboard
- **TabelaAssistidas** - Tabela com paginação
- **ListaConsultas** - Lista de consultas

### Modais

- **ModalConfirmacao** - Confirmações de ações
- **ModalDetalhes** - Visualização de detalhes
- **ModalExportacao** - Exportar relatórios

---

## 🔧 Scripts

```bash
npm run dev      # Servidor de desenvolvimento (Vite)
npm run build    # Build de produção
npm run preview  # Preview do build
npm run lint     # ESLint
```

---

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz de `packages/frontend`:

```env
VITE_API_URL=http://localhost:3003
```

### Configuração da API

O arquivo `src/config/api.js` centraliza as URLs:

```javascript
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3003";

export const API_ENDPOINTS = {
  auth: `${API_URL}/api/auth`,
  assistidas: `${API_URL}/api/assistidas`,
  medicamentos: `${API_URL}/api/medicamentos`,
  doacoes: `${API_URL}/api/doacoes`,
  // ... outros endpoints
};
```

---

## 🎯 Funcionalidades Principais

### ✅ Autenticação e Autorização

- Login com JWT
- Logout automático ao expirar token
- Proteção de rotas por permissão
- Cadastro de usuários
- Ativação via email
- Reset de senha
- Perfil do usuário

### ✅ Dashboard

- Cards com estatísticas em tempo real
- Total de assistidas ativas
- Internações em andamento
- Consultas do mês
- Despesas do período
- Doações recebidas
- Campanhas ativas

### ✅ Gestão de Assistidas

- CRUD completo
- Validação de CPF/RG
- Upload de fotos
- Histórico de consultas
- Histórico de internações
- Medicamentos utilizados
- Substâncias registradas

### ✅ Saúde

- Agendamento de consultas
- Controle de internações
- Histórico médico
- Registro de substâncias psicoativas
- Médicos e especialidades

### ✅ Medicamentos

- CRUD de medicamentos
- Controle de estoque
- Entradas e saídas
- Alertas de estoque baixo
- Unidades de medida customizadas

### ✅ Financeiro

- Doações PF/PJ
- Validação de CPF/CNPJ
- Recibos automáticos
- Despesas por categoria
- Controle de caixa
- Campanhas de arrecadação
- Relatórios financeiros

### ✅ Usuários (Admin)

- Listar usuários
- Aprovar/Rejeitar cadastros
- Alterar tipo de usuário
- Bloquear/Desbloquear
- Histórico de status
- Resetar senha

### ✅ Relatórios

- Múltiplas categorias
- Filtros por período
- Exportação PDF
- Exportação Excel
- Visualização em tabelas
- Gráficos e estatísticas

---

## 🎨 UI/UX Features

### Design Responsivo

- Mobile-first approach
- Breakpoints otimizados
- Menu responsivo
- Tabelas com scroll horizontal
- Cards adaptáveis

### Notificações

- Toast notifications (react-toastify)
- Feedback visual de ações
- Confirmações de sucesso/erro
- Loading states

### Máscaras de Input

- CPF/CNPJ automático
- Telefone formatado
- CEP com busca automática
- Moeda (R$)
- Datas (dd/mm/yyyy)

### Validações

- Validação em tempo real
- Mensagens de erro amigáveis
- Validação de CPF/CNPJ
- Validação de email
- Campos obrigatórios destacados

---

## 🔐 Controle de Acesso

### Por Tipo de Usuário

#### 🔴 Administrador

- Acesso total
- Gestão de usuários
- Aprovação de cadastros
- Todos os relatórios
- Configurações

#### 🟡 Financeiro

- Doações e doadores
- Despesas e tipos
- Caixa e movimentações
- Campanhas
- Relatórios financeiros

#### 🟢 Colaborador

- Assistidas (CRUD)
- Consultas e internações
- Medicamentos e estoque
- Substâncias psicoativas
- Relatórios operacionais

### Proteção de Rotas

```javascript
// Rotas protegidas por permissão
<ProtectedRoute requiredRole="Administrador">
  <Usuarios />
</ProtectedRoute>

<ProtectedRoute requiredRole={["Administrador", "Financeiro"]}>
  <Caixa />
</ProtectedRoute>
```

---

## 📦 Integração com Shared Package

O frontend utiliza o pacote `@casa-mais/shared` para:

```javascript
import {
  validateCPF,
  validateCNPJ,
  formatCurrency,
  formatCPF,
  formatCNPJ,
  ERROR_MESSAGES,
  STATUS_TYPES,
} from "@casa-mais/shared";

// Validação
const isValid = validateCPF("111.444.777-35");

// Formatação
const formattedCPF = formatCPF("11144477735");
const formattedMoney = formatCurrency(1234.56);

// Mensagens
toast.error(ERROR_MESSAGES.INVALID_CPF);
```

---

## 🐛 Troubleshooting

### Erro: "Cannot connect to API"

- Verifique se o backend está rodando (porta 3003)
- Confirme a variável `VITE_API_URL` no `.env`
- Teste: `curl http://localhost:3003/api/auth/me`

### Token expirado constantemente

- Verifique a configuração do `JWT_EXPIRES_IN` no backend
- Implemente refresh token se necessário
- Limpe o localStorage: `localStorage.clear()`

### Máscaras não funcionando

- Verifique se `react-imask` ou `react-input-mask` estão instalados
- Importe corretamente: `import { IMaskInput } from 'react-imask'`

### Estilos do Bootstrap não aplicados

- Verifique import no `main.jsx`: `import 'bootstrap/dist/css/bootstrap.min.css'`
- Limpe cache: `npm run build` e reinicie

### Hot reload não funciona

```bash
# Limpar cache do Vite
rm -rf node_modules/.vite
npm run dev
```

---

## 🚀 Build de Produção

```bash
# Build
npm run build

# Preview do build
npm run preview

# Deploy (exemplo com Vercel)
vercel deploy --prod
```

### Otimizações

- Code splitting automático (Vite)
- Tree shaking
- Minificação
- Lazy loading de rotas
- Imagens otimizadas

---

## 📊 Performance

### Métricas Alvo

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Bundle size: < 500KB (gzipped)

### Otimizações Implementadas

- ✅ React.lazy para rotas
- ✅ Memoização de componentes pesados
- ✅ Debounce em buscas
- ✅ Paginação de listas grandes
- ✅ Cache de requisições

---

## 🧪 Testes (Planejado)

```bash
# Testes unitários
npm run test

# Testes E2E
npm run test:e2e

# Coverage
npm run test:coverage
```

---

## 📝 Convenções de Código

### Componentes

- PascalCase para nomes: `MeuComponente.jsx`
- Props com PropTypes
- Hooks customizados com prefixo `use`

### Estilos

- CSS Modules ou styled-components
- Classes BEM quando usar CSS global
- Bootstrap utilities quando possível

### Services

- camelCase: `assistidaService.js`
- Exports nomeados
- Tratamento de erros consistente

---

## 🔄 Fluxo de Dados

```
Componente → Service → API → Backend
              ↓
           Context (global state)
              ↓
           Componentes filhos
```

---

## 📚 Dependências Principais

```json
{
  "react": "^19.1.0",
  "react-dom": "^19.1.0",
  "react-router-dom": "^7.6.1",
  "bootstrap": "^5.3.6",
  "react-bootstrap": "^2.10.10",
  "react-icons": "^5.5.0",
  "react-toastify": "^11.0.5",
  "react-imask": "^7.6.1",
  "react-input-mask": "^2.0.4",
  "@casa-mais/shared": "*"
}
```

---

## 🎓 Recursos de Aprendizado

- [React Docs](https://react.dev)
- [Vite Guide](https://vitejs.dev/guide/)
- [React Router](https://reactrouter.com)
- [Bootstrap Docs](https://getbootstrap.com/docs/5.3/)
- [React Bootstrap](https://react-bootstrap.github.io/)

---

**Última atualização**: Outubro 2025
