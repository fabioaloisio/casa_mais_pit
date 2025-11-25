# Documentacao da Refatoracao: Arquitetura MVC + Padroes de Projeto

## Projeto: Casa Mais - Sistema de Gestao
## Funcionalidade: Gestao de Vendas
## Equipe:
- RA 10482416915 - Aldruin Bonfim de Lima Souza
- RA 10482417037 - Fabio Aloisio Goncalves
- RA 10482417402 - Juliano Campos dos Santos

---

## 1. DIAGRAMA DA ARQUITETURA DO SISTEMA (Modelo em Camadas MVC)

```
+-----------------------------------------------------------------------------+
|                              VISAO (VIEW)                                   |
|                         Frontend / Cliente HTTP                             |
|                    (React, Mobile App, Postman, etc.)                       |
+-----------------------------------------------------------------------------+
                                      |
                                      | HTTP Request
                                      v
+-----------------------------------------------------------------------------+
|                           CONTROLADOR (CONTROLLER)                          |
|                           vendaController.js                                |
|  +---------------------------------------------------------------------+    |
|  |  Responsabilidades:                                                 |    |
|  |  - Receber requisicoes HTTP                                         |    |
|  |  - Extrair dados (req.body, req.params, req.query)                  |    |
|  |  - Delegar operacoes ao MODEL                                       |    |
|  |  - Formatar e retornar respostas HTTP                               |    |
|  |  - Tratar erros (handleError)                                       |    |
|  +---------------------------------------------------------------------+    |
+-----------------------------------------------------------------------------+
                                      |
                                      | Venda.create(), Venda.findAll(), etc.
                                      v
+-----------------------------------------------------------------------------+
|                              MODELO (MODEL)                                 |
|                               venda.js                                      |
|  +---------------------------------------------------------------------+    |
|  |  Responsabilidades:                                                 |    |
|  |  - Representar a entidade de negocio (atributos)                    |    |
|  |  - Validar regras de negocio                                        |    |
|  |  - Executar logica de negocio (calcularValores)                     |    |
|  |  - Orquestrar chamadas ao Repository                                |    |
|  |  - Metodos estaticos: findAll, findById, create, update, delete     |    |
|  +---------------------------------------------------------------------+    |
+-----------------------------------------------------------------------------+
                                      |
                                      | VendaRepository.create(), etc.
                                      v
+-----------------------------------------------------------------------------+
|                        REPOSITORIO (DAO/Repository)                         |
|                          vendaRepository.js                                 |
|  +---------------------------------------------------------------------+    |
|  |  Responsabilidades:                                                 |    |
|  |  - Acesso exclusivo ao banco de dados                               |    |
|  |  - Operacoes CRUD (Create, Read, Update, Delete)                    |    |
|  |  - Queries SQL                                                      |    |
|  |  - NAO contem logica de negocio                                     |    |
|  +---------------------------------------------------------------------+    |
+-----------------------------------------------------------------------------+
                                      |
                                      | db.execute()
                                      v
+-----------------------------------------------------------------------------+
|                     PADRAO SINGLETON - Database                             |
|                           database.js                                       |
|  +---------------------------------------------------------------------+    |
|  |  class Database {                                                   |    |
|  |    static #instance = null;  // Instancia unica                     |    |
|  |    static getInstance() { ... }  // Acesso a instancia              |    |
|  |  }                                                                  |    |
|  |                                                                     |    |
|  |  Garante UMA UNICA conexao com o banco de dados                     |    |
|  +---------------------------------------------------------------------+    |
+-----------------------------------------------------------------------------+
                                      |
                                      v
+-----------------------------------------------------------------------------+
|                          BANCO DE DADOS                                     |
|                            MySQL                                            |
|                        Tabela: vendas                                       |
+-----------------------------------------------------------------------------+
```

---

## 2. DESCRICAO DAS MODIFICACOES NO CODIGO-FONTE

### 2.1 Arquivo: database.js (Padrao Singleton)

**Antes:**
- Exportava o pool de conexoes diretamente (singleton implicito do Node.js)
- Nao havia uma classe formal

**Depois:**
- Implementada classe `Database` com padrao Singleton GoF
- Atributo privado `#instance` para armazenar instancia unica
- Metodo `getInstance()` para obter a instancia
- Encapsulamento de configuracoes em atributo privado `#config`
- Camada de compatibilidade para nao quebrar codigo existente

### 2.2 Arquivo: venda.js (Model)

**Antes:**
- Apenas atributos, `validate()` e `toJSON()`
- Nao chamava o Repository
- Era um "Anemic Model" (modelo anemico)

**Depois:**
- Adicionados imports: `VendaRepository`, `ProdutoRepository`
- Novo metodo estatico `calcularValores()` - logica de negocio
- Metodos estaticos CRUD: `findAll()`, `findById()`, `create()`, `update()`, `delete()`, `getRelatorio()`
- Model agora orquestra as chamadas ao Repository
- Validacao e calculos centralizados no Model

### 2.3 Arquivo: vendaController.js (Controller)

**Antes:**
- Criava instancia do Model para validar
- Chamava Repository diretamente
- Fazia verificacoes de existencia
- ~165 linhas de codigo

**Depois:**
- Remove import do `VendaRepository`
- Apenas delega ao Model: `Venda.create()`, `Venda.findAll()`, etc.
- Metodo `handleError()` para tratamento centralizado de erros
- Controller "magro" (thin controller)
- ~122 linhas de codigo

### 2.4 Arquivo: vendaRepository.js (Repository/DAO)

**Antes:**
- Buscava dados do produto para calcular valores
- Calculava `valor_bruto`, `valor_final`, `custo_estimado_total`, `lucro_estimado`
- Misturava logica de negocio com persistencia

**Depois:**
- Removida toda logica de calculo
- Recebe dados ja calculados pelo Model
- Foco exclusivo em operacoes de banco de dados (CRUD)
- Lazy loading do Model para evitar dependencia circular

---

## 3. DIAGRAMA DE CLASSES UML

```
+-----------------------------------------------------------------------------+
|                           DIAGRAMA DE CLASSES                               |
|                    Padrao MVC - Funcionalidade Venda                        |
+-----------------------------------------------------------------------------+

+---------------------------------------+
|          <<Singleton>>                |
|           Database                    |
+---------------------------------------+
| - #instance: Database                 |
| - #pool: Pool                         |
| - #config: Object                     |
+---------------------------------------+
| + getInstance(): Database             |
| + execute(query, params): Promise     |
| + query(query, params): Promise       |
| + getConnection(): Promise            |
| + testConnection(): Promise<boolean>  |
| + close(): Promise<void>              |
+---------------------------------------+
              ^
              | usa
              |
+---------------------------------------+       +---------------------------------------+
|      <<Repository/DAO>>               |       |         <<Model/Entity>>              |
|       VendaRepository                 |<------|             Venda                     |
+---------------------------------------+       +---------------------------------------+
| - db: Database                        |       | - id: number                          |
+---------------------------------------+       | - produto_id: number                  |
| + findAll(filters): Promise<Venda[]>  |       | - quantidade: number                  |
| + findById(id): Promise<Venda>        |       | - valor_bruto: number                 |
| + create(venda): Promise<Venda>       |       | - desconto: number                    |
| + update(id, venda): Promise<boolean> |       | - valor_final: number                 |
| + delete(id): Promise<boolean>        |       | - forma_pagamento: string             |
| + getRelatorioPeriodo(): Promise      |       | - custo_estimado_total: number        |
+---------------------------------------+       | - lucro_estimado: number              |
              ^                                 | - observacoes: string                 |
              |                                 | - data_venda: string                  |
              | usa                             | - usuario_id: number                  |
              |                                 +---------------------------------------+
+-------------+-------------------------+       | + constructor(data)                   |
|         <<Controller>>                |       | + validate(isUpdate): string[]        |
|       VendaController                 |       | + toJSON(): Object                    |
+---------------------------------------+       | + static calcularValores(): Object    |
|                                       |       | + static findAll(): Promise<Venda[]>  |
+---------------------------------------+       | + static findById(): Promise<Venda>   |
| + getAll(req, res): void              |------>| + static create(): Promise<Venda>     |
| + getById(req, res): void             |       | + static update(): Promise<Venda>     |
| + create(req, res): void              |       | + static delete(): Promise<boolean>   |
| + update(req, res): void              |       | + static getRelatorio(): Promise      |
| + delete(req, res): void              |       +---------------------------------------+
| + getRelatorio(req, res): void        |                       |
| + handleError(res, error): void       |                       | usa
+---------------------------------------+                       |
                                                                v
                                               +---------------------------------------+
                                               |         <<Repository>>                |
                                               |      ProdutoRepository                |
                                               +---------------------------------------+
                                               | + findById(id): Promise<Produto>      |
                                               +---------------------------------------+
```

### Legenda dos Relacionamentos:

```
-------> : Associacao/Dependencia (usa)
<------- : Dependencia reversa
- privado : Atributo/metodo privado
+ publico : Atributo/metodo publico
static    : Metodo estatico (pertence a classe, nao a instancia)
```

---

## 4. PADROES DE PROJETO APLICADOS

### 4.1 Singleton (GoF - Criacional)

**Objetivo:** Garantir que uma classe tenha apenas uma instancia e fornecer um ponto global de acesso a ela.

**Aplicacao:** Classe `Database`
- Garante unica conexao com banco de dados
- Evita multiplas instancias do pool de conexoes
- Economiza recursos do sistema

**Estrutura:**
```
+-----------------------------+
|      <<Singleton>>          |
|        Database             |
+-----------------------------+
| - instance: Database        |
+-----------------------------+
| + getInstance(): Database   |
+-----------------------------+
```

### 4.2 Repository/DAO (Padrao de Arquitetura)

**Objetivo:** Separar a logica de acesso a dados da logica de negocio.

**Aplicacao:** Classe `VendaRepository`
- Abstrai operacoes de banco de dados
- Centraliza queries SQL
- Facilita manutencao e testes

### 4.3 MVC - Model-View-Controller (Padrao Arquitetural)

**Objetivo:** Separar a aplicacao em tres camadas com responsabilidades distintas.

**Aplicacao:**
- **Model (Venda):** Logica de negocio e validacao
- **View:** Frontend (externo ao backend)
- **Controller (VendaController):** Orquestracao de requisicoes HTTP

---

## 5. FLUXO DE EXECUCAO (Diagrama de Sequencia)

```
+---------+     +----------------+     +-------+     +-----------------+     +----------+
| Cliente |     | VendaController|     | Venda |     | VendaRepository |     | Database |
+----+----+     +-------+--------+     +---+---+     +--------+--------+     +----+-----+
     |                  |                  |                  |                   |
     | POST /vendas     |                  |                  |                   |
     |----------------->|                  |                  |                   |
     |                  |                  |                  |                   |
     |                  | Venda.create(data)                  |                   |
     |                  |----------------->|                  |                   |
     |                  |                  |                  |                   |
     |                  |                  | new Venda(data)  |                   |
     |                  |                  |------+           |                   |
     |                  |                  |      |           |                   |
     |                  |                  |<-----+           |                   |
     |                  |                  |                  |                   |
     |                  |                  | venda.validate() |                   |
     |                  |                  |------+           |                   |
     |                  |                  |      |           |                   |
     |                  |                  |<-----+           |                   |
     |                  |                  |                  |                   |
     |                  |                  | calcularValores()|                   |
     |                  |                  |------+           |                   |
     |                  |                  |      |           |                   |
     |                  |                  |<-----+           |                   |
     |                  |                  |                  |                   |
     |                  |                  | Repository.create(venda)             |
     |                  |                  |----------------->|                   |
     |                  |                  |                  |                   |
     |                  |                  |                  | db.execute(INSERT)|
     |                  |                  |                  |------------------>|
     |                  |                  |                  |                   |
     |                  |                  |                  |     [result]      |
     |                  |                  |                  |<------------------|
     |                  |                  |                  |                   |
     |                  |                  |    [venda]       |                   |
     |                  |                  |<-----------------|                   |
     |                  |                  |                  |                   |
     |                  |     [venda]      |                  |                   |
     |                  |<-----------------|                  |                   |
     |                  |                  |                  |                   |
     |   JSON Response  |                  |                  |                   |
     |<-----------------|                  |                  |                   |
     |                  |                  |                  |                   |
```

---

## 6. CODIGO-FONTE MODIFICADO

### 6.1 database.js (Singleton)

```javascript
const mysql = require('mysql2/promise');
const path = require('path');

const envPath = path.resolve(__dirname, '../../../../.env');
require('dotenv').config({ path: envPath });

/**
 * Classe Database - Implementacao do Padrao Singleton (GoF)
 */
class Database {
  static #instance = null;
  #pool = null;
  #config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '3511',
    database: process.env.DB_NAME || 'casamais_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
    queueLimit: 0
  };

  constructor() {
    if (Database.#instance) {
      throw new Error('Database ja foi instanciado. Use Database.getInstance()');
    }
    this.#pool = mysql.createPool(this.#config);
  }

  static getInstance() {
    if (!Database.#instance) {
      Database.#instance = new Database();
    }
    return Database.#instance;
  }

  async execute(query, params = []) {
    return this.#pool.execute(query, params);
  }

  async query(query, params = []) {
    return this.#pool.query(query, params);
  }

  async getConnection() {
    return this.#pool.getConnection();
  }

  async testConnection() {
    try {
      const connection = await this.#pool.getConnection();
      console.log('Conectado com sucesso ao banco de dados');
      connection.release();
      return true;
    } catch (error) {
      console.error('Erro ao conectar ao banco de dados MySQL:', error.message);
      return false;
    }
  }

  async close() {
    if (this.#pool) {
      await this.#pool.end();
    }
  }
}

// Camada de compatibilidade
const instance = Database.getInstance();
module.exports = {
  execute: (...args) => instance.execute(...args),
  query: (...args) => instance.query(...args),
  getConnection: () => instance.getConnection(),
  testConnection: () => instance.testConnection(),
  Database: Database,
  getInstance: () => Database.getInstance()
};
```

### 6.2 venda.js (Model)

```javascript
const VendaRepository = require('../repository/vendaRepository');
const ProdutoRepository = require('../repository/produtoRepository');

class Venda {
  constructor(data) {
    this.id = data.id || null;
    this.produto_id = data.produto_id;
    this.quantidade = data.quantidade || 1;
    this.valor_bruto = data.valor_bruto || 0;
    this.desconto = data.desconto || 0;
    this.valor_final = data.valor_final || 0;
    this.forma_pagamento = data.forma_pagamento || 'Dinheiro';
    this.custo_estimado_total = data.custo_estimado_total || 0;
    this.lucro_estimado = data.lucro_estimado || 0;
    this.observacoes = data.observacoes || '';
    this.data_venda = data.data_venda || new Date().toISOString().split('T')[0];
    this.usuario_id = data.usuario_id || null;
  }

  validate(isUpdate = false) {
    const errors = [];
    if (!isUpdate || this.produto_id !== undefined) {
      if (!this.produto_id || typeof this.produto_id !== 'number') {
        errors.push('Produto e obrigatorio.');
      }
    }
    if (!isUpdate || this.quantidade !== undefined) {
      if (this.quantidade === null || this.quantidade < 1) {
        errors.push('Quantidade deve ser maior ou igual a 1.');
      }
    }
    if (!isUpdate || this.desconto !== undefined) {
      if (this.desconto === null || this.desconto < 0) {
        errors.push('Desconto deve ser maior ou igual a zero.');
      }
    }
    if (!isUpdate || this.forma_pagamento !== undefined) {
      const formasValidas = ['Pix', 'Dinheiro', 'Debito', 'Credito'];
      if (!formasValidas.includes(this.forma_pagamento)) {
        errors.push('Forma de pagamento invalida.');
      }
    }
    return errors;
  }

  toJSON() {
    return {
      id: this.id,
      produto_id: this.produto_id,
      quantidade: parseInt(this.quantidade),
      valor_bruto: parseFloat(this.valor_bruto),
      desconto: parseFloat(this.desconto),
      valor_final: parseFloat(this.valor_final),
      forma_pagamento: this.forma_pagamento,
      custo_estimado_total: parseFloat(this.custo_estimado_total),
      lucro_estimado: parseFloat(this.lucro_estimado),
      observacoes: this.observacoes,
      data_venda: this.data_venda,
      usuario_id: this.usuario_id
    };
  }

  // METODOS ESTATICOS DE NEGOCIO

  static calcularValores(quantidade, precoVenda, custoEstimado, desconto = 0) {
    const valorBruto = quantidade * precoVenda;
    const valorFinal = valorBruto - desconto;
    const custoEstimadoTotal = quantidade * custoEstimado;
    const lucroEstimado = valorFinal - custoEstimadoTotal;
    return {
      valor_bruto: valorBruto,
      valor_final: valorFinal,
      custo_estimado_total: custoEstimadoTotal,
      lucro_estimado: lucroEstimado
    };
  }

  // METODOS ESTATICOS CRUD

  static async findAll(filters = {}) {
    return VendaRepository.findAll(filters);
  }

  static async findById(id) {
    return VendaRepository.findById(id);
  }

  static async create(data) {
    const venda = new Venda(data);
    const errors = venda.validate();
    if (errors.length > 0) throw { type: 'validation', errors };

    const produto = await ProdutoRepository.findById(data.produto_id);
    if (!produto) throw { type: 'not_found', message: 'Produto nao encontrado.' };

    const valores = Venda.calcularValores(
      venda.quantidade, produto.preco_venda, produto.custo_estimado, venda.desconto
    );
    Object.assign(venda, valores);

    return VendaRepository.create(venda);
  }

  static async update(id, data) {
    const exists = await VendaRepository.findById(id);
    if (!exists) throw { type: 'not_found', message: 'Venda nao encontrada.' };

    const venda = new Venda({ ...data, id });
    const errors = venda.validate(true);
    if (errors.length > 0) throw { type: 'validation', errors };

    const produtoId = data.produto_id || exists.produto_id;
    const produto = await ProdutoRepository.findById(produtoId);
    if (!produto) throw { type: 'not_found', message: 'Produto nao encontrado.' };

    const valores = Venda.calcularValores(
      venda.quantidade ?? exists.quantidade,
      produto.preco_venda,
      produto.custo_estimado,
      venda.desconto ?? exists.desconto
    );
    Object.assign(venda, valores);

    await VendaRepository.update(id, venda);
    return VendaRepository.findById(id);
  }

  static async delete(id) {
    const exists = await VendaRepository.findById(id);
    if (!exists) throw { type: 'not_found', message: 'Venda nao encontrada.' };
    return VendaRepository.delete(id);
  }

  static async getRelatorio(dataInicio, dataFim) {
    if (!dataInicio || !dataFim) {
      throw { type: 'validation', errors: ['Data de inicio e fim sao obrigatorias.'] };
    }
    return VendaRepository.getRelatorioPeriodo(dataInicio, dataFim);
  }
}

module.exports = Venda;
```

### 6.3 vendaController.js (Controller)

```javascript
const Venda = require('../models/venda');

class VendaController {
  async getAll(req, res) {
    try {
      const { data_inicio, data_fim, produto_id } = req.query;
      const filters = {};
      if (data_inicio) filters.data_inicio = data_inicio;
      if (data_fim) filters.data_fim = data_fim;
      if (produto_id) filters.produto_id = parseInt(produto_id);

      const vendas = await Venda.findAll(filters);
      res.json({ success: true, data: vendas.map(v => v.toJSON()), total: vendas.length });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getById(req, res) {
    try {
      const venda = await Venda.findById(req.params.id);
      if (!venda) {
        return res.status(404).json({ success: false, message: 'Venda nao encontrada.' });
      }
      res.json({ success: true, data: venda.toJSON() });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async create(req, res) {
    try {
      const vendaData = { ...req.body, usuario_id: req.user?.id || null };
      const novaVenda = await Venda.create(vendaData);
      res.status(201).json({
        success: true,
        data: novaVenda.toJSON(),
        message: 'Venda cadastrada com sucesso.'
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async update(req, res) {
    try {
      const updated = await Venda.update(req.params.id, req.body);
      res.json({
        success: true,
        data: updated.toJSON(),
        message: 'Venda atualizada com sucesso.'
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async delete(req, res) {
    try {
      await Venda.delete(req.params.id);
      res.json({ success: true, message: 'Venda excluida com sucesso.' });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getRelatorio(req, res) {
    try {
      const { data_inicio, data_fim } = req.query;
      const relatorio = await Venda.getRelatorio(data_inicio, data_fim);
      res.json({ success: true, data: relatorio, total: relatorio.length });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  handleError(res, error) {
    if (error.type === 'validation') {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    if (error.type === 'not_found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = new VendaController();
```

### 6.4 vendaRepository.js (Repository/DAO)

```javascript
const db = require('../config/database');
const BaseRepository = require('../../../shared/repository/BaseRepository');

let Venda = null;
const getVendaModel = () => {
  if (!Venda) {
    Venda = require('../models/venda');
  }
  return Venda;
};

class VendaRepository extends BaseRepository {
  constructor() {
    super('vendas', 'v');
  }

  async findAll(filters = {}) {
    let query = `
      SELECT v.*, p.nome as produto_nome, u.nome as usuario_nome
      FROM vendas v
      LEFT JOIN produtos p ON v.produto_id = p.id
      LEFT JOIN usuarios u ON v.usuario_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.data_inicio) {
      query += ' AND v.data_venda >= ?';
      params.push(filters.data_inicio);
    }
    if (filters.data_fim) {
      query += ' AND v.data_venda <= ?';
      params.push(filters.data_fim);
    }
    if (filters.produto_id) {
      query += ' AND v.produto_id = ?';
      params.push(filters.produto_id);
    }

    query += ' ORDER BY v.data_venda DESC, v.id DESC';
    const [rows] = await db.execute(query, params);
    const VendaModel = getVendaModel();
    return rows.map(row => new VendaModel(row));
  }

  async findById(id) {
    const [rows] = await db.execute(`
      SELECT v.*, p.nome as produto_nome, u.nome as usuario_nome
      FROM vendas v
      LEFT JOIN produtos p ON v.produto_id = p.id
      LEFT JOIN usuarios u ON v.usuario_id = u.id
      WHERE v.id = ?;
    `, [id]);

    if (!rows.length) return null;
    const VendaModel = getVendaModel();
    return new VendaModel(rows[0]);
  }

  async create(venda) {
    const [result] = await db.execute(`
      INSERT INTO vendas (
        produto_id, quantidade, valor_bruto, desconto, valor_final,
        forma_pagamento, custo_estimado_total, lucro_estimado,
        observacoes, data_venda, usuario_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `, [
      venda.produto_id, venda.quantidade, venda.valor_bruto,
      venda.desconto || 0, venda.valor_final, venda.forma_pagamento,
      venda.custo_estimado_total, venda.lucro_estimado,
      venda.observacoes || '', venda.data_venda, venda.usuario_id || null
    ]);

    return this.findById(result.insertId);
  }

  async update(id, venda) {
    const campos = [];
    const valores = [];

    if (venda.produto_id !== undefined) { campos.push('produto_id = ?'); valores.push(venda.produto_id); }
    if (venda.quantidade !== undefined) { campos.push('quantidade = ?'); valores.push(venda.quantidade); }
    if (venda.desconto !== undefined) { campos.push('desconto = ?'); valores.push(venda.desconto); }
    if (venda.forma_pagamento !== undefined) { campos.push('forma_pagamento = ?'); valores.push(venda.forma_pagamento); }
    if (venda.observacoes !== undefined) { campos.push('observacoes = ?'); valores.push(venda.observacoes); }
    if (venda.data_venda !== undefined) { campos.push('data_venda = ?'); valores.push(venda.data_venda); }
    if (venda.valor_bruto !== undefined) { campos.push('valor_bruto = ?'); valores.push(venda.valor_bruto); }
    if (venda.valor_final !== undefined) { campos.push('valor_final = ?'); valores.push(venda.valor_final); }
    if (venda.custo_estimado_total !== undefined) { campos.push('custo_estimado_total = ?'); valores.push(venda.custo_estimado_total); }
    if (venda.lucro_estimado !== undefined) { campos.push('lucro_estimado = ?'); valores.push(venda.lucro_estimado); }

    if (campos.length === 0) return false;
    valores.push(id);

    const [result] = await db.execute(`UPDATE vendas SET ${campos.join(', ')} WHERE id = ?;`, valores);
    return result.affectedRows > 0;
  }

  async delete(id) {
    const [result] = await db.execute('DELETE FROM vendas WHERE id = ?;', [id]);
    return result.affectedRows > 0;
  }

  async getRelatorioPeriodo(dataInicio, dataFim) {
    const [rows] = await db.execute(`
      SELECT
        DATE(v.data_venda) as data,
        COUNT(v.id) as total_vendas,
        SUM(v.quantidade) as total_quantidade,
        SUM(v.valor_bruto) as total_valor_bruto,
        SUM(v.desconto) as total_desconto,
        SUM(v.valor_final) as total_valor_final,
        SUM(v.custo_estimado_total) as total_custo_estimado,
        SUM(v.lucro_estimado) as total_lucro_estimado
      FROM vendas v
      WHERE v.data_venda >= ? AND v.data_venda <= ?
      GROUP BY DATE(v.data_venda)
      ORDER BY data DESC;
    `, [dataInicio, dataFim]);
    return rows;
  }
}

module.exports = new VendaRepository();
```

---

## 7. RESULTADO DA REFATORACAO

### Antes (Arquitetura Incorreta):
```
Controller -> Model (apenas validacao) -> Repository (com logica de negocio)
```

### Depois (Arquitetura MVC Correta):
```
Controller -> Model (validacao + logica + orquestracao) -> Repository (apenas CRUD)
```

### Beneficios Obtidos:
- **Separacao de Responsabilidades:** Cada camada tem funcao especifica
- **Manutenibilidade:** Alteracoes isoladas em cada camada
- **Testabilidade:** Camadas podem ser testadas independentemente
- **Reusabilidade:** Model pode ser usado em diferentes contextos
- **Singleton:** Unica conexao de banco evita desperdicio de recursos
