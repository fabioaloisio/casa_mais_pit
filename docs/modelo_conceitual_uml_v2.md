# Modelo Conceitual UML - Sistema Casa+ (Versão 2)

Referencia para melhoria futura.

## Diagrama de Classes - Modelo Conceitual Completo

```mermaid
classDiagram
    class Usuario {
        id: int
        nome: string
        email: string
        senha: string
        tipo: enum
        ativo: boolean
        data_cadastro: timestamp
        data_atualizacao: timestamp
    }

    class Assistida {
        id: int
        nome: string
        cpf: string
        rg: string
        idade: int
        data_nascimento: date
        nacionalidade: string
        estado_civil: string
        profissao: string
        escolaridade: string
        status: string
        logradouro: string
        bairro: string
        numero: string
        cep: string
        estado: string
        cidade: string
        telefone: string
        telefone_contato: string
        data_atendimento: date
        hora: time
        historia_patologica: text
        tempo_sem_uso: string
        motivacao_internacoes: text
        fatos_marcantes: text
        infancia: text
        adolescencia: text
        createdAt: timestamp
        updatedAt: timestamp
    }

    class Internacao {
        id: int
        assistida_id: int
        local: string
        duracao: string
        data: date
        createdAt: timestamp
        updatedAt: timestamp
    }

    class DrogaUtilizada {
        id: int
        assistida_id: int
        tipo: string
        idade_inicio: int
        tempo_uso: string
        intensidade: string
        createdAt: timestamp
        updatedAt: timestamp
    }

    class Consulta {
        id: int
        assistida_id: int
        data_consulta: date
        hora: time
        medico: string
        status: enum
        observacoes: text
        createdAt: timestamp
        updatedAt: timestamp
    }

    class UnidadeMedida {
        id: int
        nome: string
        sigla: string
        createdAt: timestamp
        updatedAt: timestamp
    }

    class Medicamento {
        id: int
        nome: string
        forma_farmaceutica: string
        descricao: string
        unidade_medida_id: int
        estoque_minimo: int
        estoque_atual: int
        createdAt: timestamp
        updatedAt: timestamp
    }

    class MedicamentoUtilizado {
        id: int
        assistida_id: int
        medicamento_id: int
        dosagem: string
        frequencia: string
        data_inicio: date
        data_fim: date
        ativo: boolean
        createdAt: timestamp
        updatedAt: timestamp
    }

    class MovimentacaoEstoque {
        id: int
        medicamento_id: int
        usuario_id: int
        assistida_id: int
        tipo_movimentacao: enum
        quantidade: int
        data_movimentacao: datetime
        motivo: string
        observacoes: text
        createdAt: timestamp
    }

    class Doador {
        id: int
        tipo_doador: enum
        nome: string
        documento: string
        email: string
        telefone: string
        endereco: string
        cidade: string
        estado: string
        cep: string
        data_cadastro: timestamp
        data_atualizacao: timestamp
    }

    class Doacao {
        id: int
        doador_id: int
        usuario_id: int
        valor: decimal
        data_doacao: date
        observacoes: text
        data_cadastro: datetime
        data_atualizacao: datetime
    }

    class TipoDespesa {
        id: int
        nome: string
        descricao: string
        ativo: boolean
        data_cadastro: timestamp
        data_atualizacao: timestamp
    }

    class Despesa {
        id: int
        tipo_despesa_id: int
        usuario_id: int
        descricao: string
        categoria: string
        valor: decimal
        data_despesa: date
        forma_pagamento: string
        fornecedor: string
        observacoes: text
        status: enum
        data_cadastro: timestamp
        data_atualizacao: timestamp
    }

    %% Relacionamentos Principais
    Usuario "1" --> "0..*" Doacao : registra
    Usuario "1" --> "0..*" Despesa : registra
    Usuario "1" --> "0..*" MovimentacaoEstoque : executa

    Assistida "1" --> "0..*" Internacao : possui
    Assistida "1" --> "0..*" DrogaUtilizada : utilizou
    Assistida "1" --> "0..*" Consulta : agenda
    Assistida "1" --> "0..*" MedicamentoUtilizado : toma
    Assistida "0..1" --> "0..*" MovimentacaoEstoque : recebe

    Medicamento "1" --> "0..*" MedicamentoUtilizado : prescreve
    Medicamento "1" --> "0..*" MovimentacaoEstoque : movimenta
    UnidadeMedida "1" --> "0..*" Medicamento : define medida

    Doador "1" --> "0..*" Doacao : realiza
    TipoDespesa "1" --> "0..*" Despesa : categoriza
```

## Principais Melhorias na Versão 2

### 1. **Sistema de Usuários e Auditoria**

- **Usuario**: Entidade para autenticação e controle de acesso
- **Rastreabilidade**: Todas as operações críticas são associadas a um usuário
- **Tipos**: Administrador, Operador

### 2. **Gestão Médica Completa**

- **Consulta**: Agendamento e controle de consultas médicas
- **DrogaUtilizada**: Histórico de substâncias utilizadas pelas assistidas
- **Status das consultas**: agendada, realizada, cancelada

### 3. **Sistema de Estoque Inteligente**

- **MovimentacaoEstoque**: Controle de entradas e saídas
- **Tipos de movimentação**: entrada, saida_dispensacao, saida_descarte
- **Estoque atual**: Controle automático de quantidades

### 4. **Relacionamentos Aprimorados**

- **MedicamentoUtilizado**: Agora relaciona medicamento do cadastro com prescrição
- **Rastreabilidade**: Quem registrou cada operação
- **Dispensação**: Saídas de estoque podem ser associadas a assistidas específicas

## Descrição dos Relacionamentos

### **Relacionamentos de Usuário (Auditoria)**

- Usuario → Doacao (1:N): "registra"
- Usuario → Despesa (1:N): "registra"
- Usuario → MovimentacaoEstoque (1:N): "executa"

### **Relacionamentos de Assistida**

- Assistida → Internacao (1:N): "possui"
- Assistida → DrogaUtilizada (1:N): "utilizou"
- Assistida → Consulta (1:N): "agenda"
- Assistida → MedicamentoUtilizado (1:N): "toma"
- Assistida → MovimentacaoEstoque (0..1:N): "recebe"

### **Relacionamentos de Medicamento**

- UnidadeMedida → Medicamento (1:N): "define medida"
- Medicamento → MedicamentoUtilizado (1:N): "prescreve"
- Medicamento → MovimentacaoEstoque (1:N): "movimenta"

### **Relacionamentos Financeiros**

- Doador → Doacao (1:N): "realiza"
- TipoDespesa → Despesa (1:N): "categoriza"

## Tipos Enumerados

- **tipo_usuario**: Administrador, Operador
- **tipo_doador**: PF, PJ
- **status_consulta**: agendada, realizada, cancelada
- **status_despesa**: pendente, paga, cancelada
- **tipo_movimentacao**: entrada, saida_dispensacao, saida_descarte

## Conceitos de Negócio Representados

1. **Controle de Acesso**: Sistema completo de usuários
2. **Gestão Médica**: Consultas e histórico de drogas
3. **Controle de Estoque**: Movimentações rastreadas
4. **Auditoria**: Todas as operações têm responsável
5. **Integridade**: Medicamentos utilizados referenciam cadastro geral

## Comparação com Versão 1

### **Entidades Adicionadas na V2**

- **Usuario**: Sistema de autenticação e controle
- **DrogaUtilizada**: Histórico de substâncias
- **Consulta**: Agendamento médico
- **MovimentacaoEstoque**: Controle de estoque

### **Entidades Modificadas na V2**

- **Medicamento**: Adicionados campos de estoque
- **MedicamentoUtilizado**: Relacionado com medicamento do cadastro
- **Doacao/Despesa**: Rastreabilidade com usuário responsável

### **Relacionamentos Adicionados na V2**

- 6 novos relacionamentos de auditoria e controle
- Melhor integridade referencial entre medicamentos
- Controle de dispensação para assistidas específicas
