# @casa-mais/shared

Pacote compartilhado contendo utilidades, validações, constantes e helpers utilizados por toda a aplicação Casa+ PIT.

## 📦 Instalação

Este pacote é automaticamente instalado como dependência do monorepo. Para usar em frontend ou backend:

```javascript
// CommonJS (Backend)
const { validateCPF, formatCurrency, ERROR_MESSAGES } = require('@casa-mais/shared');

// ES6 (Frontend)
import { validateCPF, formatCurrency, ERROR_MESSAGES } from '@casa-mais/shared';
```

## 📁 Estrutura

```
packages/shared/
├── src/
│   ├── constants/       # Constantes e mensagens
│   │   ├── index.js           # Constantes de domínio
│   │   ├── errorMessages.js   # Mensagens de erro do frontend
│   │   ├── backendMessages.js # Mensagens específicas do backend
│   │   └── roles.js           # Roles e permissões
│   ├── validators/      # Funções de validação
│   │   ├── index.js          # Validadores gerais
│   │   └── business.js       # Validações de negócio
│   ├── utils/          # Utilidades gerais
│   │   └── index.js          # Formatadores e máscaras
│   ├── helpers/        # Helpers específicos
│   │   └── financial.js     # Cálculos financeiros
│   ├── types/          # Definições de tipos
│   │   └── index.js          # Tipos compartilhados
│   └── index.js        # Entry point principal
└── README.md
```

## 🛠️ Funcionalidades

### 📝 Constantes

#### Status Types
```javascript
const { STATUS_TYPES } = require('@casa-mais/shared');

STATUS_TYPES.ACTIVE   // 'ativo'
STATUS_TYPES.INACTIVE // 'inativo'
STATUS_TYPES.PENDING  // 'pendente'
```

#### Medication Units
```javascript
const { MEDICATION_UNITS } = require('@casa-mais/shared');

MEDICATION_UNITS.MG         // 'mg'
MEDICATION_UNITS.ML         // 'ml'
MEDICATION_UNITS.COMPRIMIDO // 'comprimido'
```

#### Error Messages
```javascript
const { ERROR_MESSAGES } = require('@casa-mais/shared');

ERROR_MESSAGES.INVALID_CPF        // 'CPF inválido...'
ERROR_MESSAGES.REQUIRED_FIELD     // 'Campo obrigatório'
ERROR_MESSAGES.ASSISTIDA_NOT_FOUND // 'Assistida não encontrada'
```

#### Backend Messages
```javascript
const { BACKEND_MESSAGES } = require('@casa-mais/shared');

BACKEND_MESSAGES.SUCCESS.USER_REGISTERED // 'Cadastro realizado com sucesso...'
BACKEND_MESSAGES.ERRORS.TOKEN_INVALID    // 'Token inválido'
```

### ✅ Validadores

#### Documentos
```javascript
const { validateCPF, validateCNPJ } = require('@casa-mais/shared');

validateCPF('123.456.789-10');  // false
validateCPF('111.444.777-35');  // true

validateCNPJ('12.345.678/0001-00'); // false
validateCNPJ('11.444.777/0001-61'); // true
```

#### Email e Telefone
```javascript
const { validateEmail, validatePhone } = require('@casa-mais/shared');

validateEmail('usuario@email.com'); // true
validatePhone('(11) 98765-4321');   // true
```

#### Validações de Negócio
```javascript
const { validarIdadeMinima, validarStatusAssistida } = require('@casa-mais/shared');

// Validar idade mínima
const resultado = validarIdadeMinima('2010-01-01', 18);
// { isValid: false, message: 'Idade mínima de 18 anos é requerida' }

// Validar status
validarStatusAssistida('ativa'); // true
validarStatusAssistida('invalido'); // false
```

### 🎨 Formatadores

#### Documentos
```javascript
const { formatCPF, formatCNPJ, formatRG } = require('@casa-mais/shared');

formatCPF('11144477735');    // '111.444.777-35'
formatCNPJ('11444777000161'); // '11.444.777/0001-61'
formatRG('123456789');        // '12.345.678-9'
```

#### Valores Monetários
```javascript
const { formatCurrency, parseCurrency } = require('@casa-mais/shared');

formatCurrency(1234.56);  // 'R$ 1.234,56'
parseCurrency('R$ 1.234,56'); // 1234.56
```

#### Datas
```javascript
const { formatData, formatDataForInput } = require('@casa-mais/shared');

formatData('2024-01-15');        // '15/01/2024'
formatDataForInput('15/01/2024'); // '2024-01-15'
```

#### Máscaras para Inputs
```javascript
const { maskCurrency } = require('@casa-mais/shared');

// Em um evento de input
maskCurrency(event); // Formata o valor do input como moeda
```

### 💰 Helpers Financeiros

```javascript
const { calcularTotal, calcularBalanco, calcularEstatisticasPeriodo } = require('@casa-mais/shared');

// Calcular total
const valores = [100, 200, 300];
calcularTotal(valores); // 600

// Calcular balanço
const resultado = calcularBalanco(1000, 750);
// {
//   entradas: 1000,
//   saidas: 750,
//   balanco: 250,
//   status: 'positivo',
//   percentualGasto: '75.00'
// }

// Estatísticas de período
const movimentacoes = [
  { tipo: 'entrada', valor: 1000 },
  { tipo: 'saida', valor: 500 }
];
calcularEstatisticasPeriodo(movimentacoes);
// {
//   totalEntradas: 1000,
//   totalSaidas: 500,
//   saldo: 500,
//   ...
// }
```

### 🔐 Roles e Permissões

```javascript
const { ROLES, hasPermission, getRolePermissions } = require('@casa-mais/shared');

// Verificar permissão
hasPermission('Administrador', 'RF_B3'); // true
hasPermission('Colaborador', 'RF_B9');   // false

// Obter permissões de um role
getRolePermissions('Financeiro');
// ['RF_B6', 'RF_B7', 'RF_B8', 'RF_B12', ...]
```

## 📊 Estatísticas do Package

- **160+ mensagens** centralizadas
- **10+ validadores** implementados
- **15+ formatadores** disponíveis
- **10+ helpers financeiros**
- **10+ validações de negócio**
- **100% CommonJS** compatível

## 🔄 Migração em Progresso

### Concluído ✅
- ✅ Mensagens de erro básicas (ERROR_MESSAGES)
- ✅ Mensagens do backend (BACKEND_MESSAGES)
- ✅ Sistema de roles e permissões
- ✅ Validadores principais
- ✅ Formatadores essenciais
- ✅ Helpers financeiros
- ✅ Validações de negócio

### Em Progresso 🚧
- 🚧 Migração de ~120 mensagens hardcoded restantes
- 🚧 Testes unitários para todas as funções
- 🚧 Tipos TypeScript

## 🧪 Testes

```bash
# Rodar testes (quando implementados)
npm test

# Verificar cobertura
npm run coverage
```

## 🤝 Contribuindo

1. Sempre adicione novas funcionalidades no shared quando forem usadas em múltiplos lugares
2. Use CommonJS exports para compatibilidade com o backend
3. Adicione documentação JSDoc em todas as funções
4. Mantenha as mensagens centralizadas
5. Evite duplicação de código entre frontend e backend

## 📝 Convenções

### Nomenclatura
- **Validadores**: prefixo `validate` ou `validar`
- **Formatadores**: prefixo `format` ou `formatar`
- **Helpers**: nomes descritivos da ação
- **Constantes**: UPPER_SNAKE_CASE

### Estrutura de Retorno
- **Validadores**: retornam `boolean` ou objeto `{ isValid, message }`
- **Formatadores**: retornam string formatada
- **Helpers**: retornam valor calculado ou objeto com resultados

## 📄 Licença

Propriedade privada - Casa+ PIT

---

**Última atualização**: 18/09/2025