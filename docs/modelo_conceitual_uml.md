# Modelo Conceitual UML - Sistema Casa+

Reflete a implatacão fisica atual 0.3.0.

## Diagrama de Classes

```mermaid
classDiagram
    class Assistida {
        int id
        string nome
        string cpf
        string rg
        int idade
        date data_nascimento
        string nacionalidade
        string estado_civil
        string profissao
        string escolaridade
        string status
        string logradouro
        string bairro
        string numero
        string cep
        string estado
        string cidade
        string telefone
        string telefone_contato
        date data_atendimento
        time hora
        text historia_patologica
        string tempo_sem_uso
        text motivacao_internacoes
        text fatos_marcantes
        text infancia
        text adolescencia
        timestamp createdAt
        timestamp updatedAt
    }

    class Internacao {
        int id
        int assistida_id
        string local
        string duracao
        date data
        timestamp createdAt
        timestamp updatedAt
    }

    class MedicamentoUtilizado {
        int id
        int assistida_id
        string nome
        string dosagem
        string frequencia
        timestamp createdAt
        timestamp updatedAt
    }

    class Doador {
        int id
        enum tipo_doador
        string nome
        string documento
        string email
        string telefone
        string endereco
        string cidade
        string estado
        string cep
        timestamp data_cadastro
        timestamp data_atualizacao
    }

    class Doacao {
        int id
        int doador_id
        decimal valor
        date data_doacao
        text observacoes
        datetime data_cadastro
        datetime data_atualizacao
    }

    class TipoDespesa {
        int id
        string nome
        string descricao
        boolean ativo
        timestamp data_cadastro
        timestamp data_atualizacao
    }

    class Despesa {
        int id
        int tipo_despesa_id
        string descricao
        string categoria
        decimal valor
        date data_despesa
        string forma_pagamento
        string fornecedor
        text observacoes
        enum status
        timestamp data_cadastro
        timestamp data_atualizacao
    }

    class UnidadeMedida {
        int id
        string nome
        string sigla
        timestamp createdAt
        timestamp updatedAt
    }

    class Medicamento {
        int id
        string nome
        string forma_farmaceutica
        string descricao
        int unidade_medida_id
        timestamp createdAt
        timestamp updatedAt
    }

    %% Relacionamentos
    Assistida "1" --> "0..*" Internacao : possui
    Assistida "1" --> "0..*" MedicamentoUtilizado : utiliza
    Doador "1" --> "0..*" Doacao : realiza
    TipoDespesa "1" --> "0..*" Despesa : categoriza
    UnidadeMedida "1" --> "0..*" Medicamento : define_medida
```

## Descrição dos Relacionamentos

### 1. Assistida - Internacao

- **Relacionamento**: Uma assistida pode ter várias internações
- **Cardinalidade**: 1:N (Um para Muitos)
- **Nome**: "possui"

### 2. Assistida - MedicamentoUtilizado

- **Relacionamento**: Uma assistida pode utilizar vários medicamentos
- **Cardinalidade**: 1:N (Um para Muitos)
- **Nome**: "utiliza"

### 3. Doador - Doacao

- **Relacionamento**: Um doador pode realizar várias doações
- **Cardinalidade**: 1:N (Um para Muitos)
- **Nome**: "realiza"

### 4. TipoDespesa - Despesa

- **Relacionamento**: Um tipo de despesa pode categorizar várias despesas
- **Cardinalidade**: 1:N (Um para Muitos)
- **Nome**: "categoriza"

### 5. UnidadeMedida - Medicamento

- **Relacionamento**: Uma unidade de medida pode definir a medida de vários medicamentos
- **Cardinalidade**: 1:N (Um para Muitos)
- **Nome**: "define medida"

## Observações do Modelo

1. **Entidades Principais**: O sistema possui 9 entidades principais que representam os conceitos fundamentais do domínio.

2. **Separação de Conceitos**:

   - `Medicamento` representa o cadastro geral de medicamentos disponíveis
   - `MedicamentoUtilizado` representa os medicamentos específicos utilizados por cada assistida

3. **Tipos Enumerados**:

   - `tipo_doador`: PF (Pessoa Física) ou PJ (Pessoa Jurídica)
   - `status` (Despesa): pendente, paga, cancelada

4. **Integridade Referencial**: Todos os relacionamentos possuem chaves estrangeiras que garantem a integridade dos dados.
