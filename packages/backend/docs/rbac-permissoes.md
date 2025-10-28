# RBAC - Controle de Acesso Baseado em Papéis

## Perfis do Sistema

### **ADMINISTRADOR** (Diretora Geral)

Acesso total ao sistema.

### **FINANCEIRO**

Gestão financeira, doações, despesas e campanhas.

### **COLABORADOR**

Operações diárias com assistidas, consultas e internações.

---

## Matriz de Permissões

| Função                                     | ADM | FIN | COL |
| :----------------------------------------- | :-: | :-: | :-: |
| **Requisitos Básicos**                     |
| RF_B1: Gerenciar Assistidas                | ✅  | ❌  | ✅  |
| RF_B2: Gerenciar Substâncias Psicoativas   | ✅  | ❌  | ✅  |
| RF_B3: Gerenciar Doadores                  | ✅  | ✅  | ❌  |
| RF_B4: Gerenciar Medicamentos              | ✅  | ❌  | ✅  |
| RF_B5: Gerenciar Unidades de Medida        | ✅  | ❌  | ✅  |
| RF_B6: Gerenciar Doações                   | ✅  | ✅  | ❌  |
| RF_B7: Gerenciar Tipos de Despesas         | ✅  | ✅  | ❌  |
| RF_B8: Gerenciar Médicos                   | ✅  | ❌  | ✅  |
| RF_B9: Gerenciar Usuários                  | ✅  | ❌  | ❌  |
| RF_B10: Gerenciar Internações              | ✅  | ❌  | ✅  |
| RF_B11: Gerenciar Consultas                | ✅  | ❌  | ✅  |
| RF_B12: Gerenciar Movimentações de Caixa   | ✅  | ✅  | ❌  |
| **Requisitos Funcionais**                  |
| RF_F1: Efetuar Entrada na Instituição      | ✅  | ❌  | ✅  |
| RF_F2: Efetuar Saída da Instituição        | ✅  | ❌  | ✅  |
| RF_F3: Gerenciar Despesas                  | ✅  | ✅  | ❌  |
| RF_F4: Lançar Doação Monetária             | ✅  | ✅  | ❌  |
| RF_F5: Atualizar Caixa                     | ✅  | ✅  | ❌  |
| RF_F6: Gerenciar Consultas                 | ✅  | ❌  | ✅  |
| RF_F7: Lançar Prescrição                   | ✅  | ❌  | ✅  |
| RF_F8: Lançar História Patológica          | ✅  | ❌  | ✅  |
| RF_F9: Registrar Dados Pós-Consulta        | ✅  | ❌  | ✅  |
| RF_F10: Gerenciar Campanhas de Arrecadação | ✅  | ✅  | ❌  |
| **Relatórios**                             |
| RF_S1: Relatório de Assistidas             | ✅  | ❌  | ✅  |
| RF_S2: Relatório de Despesas               | ✅  | ✅  | ❌  |
| RF_S3: Relatório de Consultas              | ✅  | ❌  | ✅  |
| RF_S4: Relatório de Doações                | ✅  | ✅  | ❌  |
| RF_S5: Relatório de Medicamentos           | ✅  | ❌  | ✅  |
| RF_S6: Relatório de Internações            | ✅  | ❌  | ✅  |
| RF_S7: Relatório de Doadores               | ✅  | ✅  | ❌  |
| RF_S8: Relatório de Campanhas              | ✅  | ✅  | ❌  |

---

## Resumo por Perfil

### **ADMINISTRADOR**

Acesso a todas as funcionalidades (33 permissões).

### **FINANCEIRO** (13 permissões)

- Gerenciar: Doadores, Doações, Tipos de Despesas, Despesas, Caixa, Campanhas
- Relatórios: Despesas, Doações, Doadores, Campanhas

### **COLABORADOR** (17 permissões)

- Gerenciar: Assistidas, Substâncias, Medicamentos, Unidades, Médicos, Internações, Consultas
- Operações: Entrada/Saída, Prescrições, História Patológica, Pós-Consulta
- Relatórios: Assistidas, Consultas, Medicamentos, Internações

---

## Implementação

**Arquivo:** `packages/shared/src/constants/roles.js`

**Middleware:** `packages/backend/src/middleware/authMiddleware.js`

**Uso:**

```javascript
// Verificar permissão específica
requirePermission("RF_F4"); // Apenas ADM e FIN

// Verificar múltiplos perfis
requireRole([ROLES.ADMINISTRADOR, ROLES.FINANCEIRO]);

// Apenas administrador
requireAdmin;
```
