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

  // ===== MÉTODOS DE INSTÂNCIA =====

  validate(isUpdate = false) {
    const errors = [];

    if (!isUpdate || this.produto_id !== undefined) {
      if (!this.produto_id || typeof this.produto_id !== 'number') {
        errors.push('Produto é obrigatório.');
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
      const formasValidas = ['Pix', 'Dinheiro', 'Débito', 'Crédito'];
      if (!formasValidas.includes(this.forma_pagamento)) {
        errors.push('Forma de pagamento inválida.');
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

  // ===== MÉTODOS ESTÁTICOS DE NEGÓCIO =====

  /**
   * Calcula valores da venda baseado no produto
   * @param {number} quantidade - Quantidade vendida
   * @param {number} precoVenda - Preço de venda unitário
   * @param {number} custoEstimado - Custo estimado unitário
   * @param {number} desconto - Desconto aplicado
   * @returns {Object} Valores calculados
   */
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

  // ===== MÉTODOS ESTÁTICOS CRUD =====

  /**
   * Busca todas as vendas com filtros opcionais
   * @param {Object} filters - Filtros de busca
   * @returns {Promise<Venda[]>}
   */
  static async findAll(filters = {}) {
    return VendaRepository.findAll(filters);
  }

  /**
   * Busca uma venda por ID
   * @param {number} id - ID da venda
   * @returns {Promise<Venda|null>}
   */
  static async findById(id) {
    return VendaRepository.findById(id);
  }

  /**
   * Cria uma nova venda
   * @param {Object} data - Dados da venda
   * @returns {Promise<Venda>}
   */
  static async create(data) {
    // 1. Criar instância e validar
    const venda = new Venda(data);
    const errors = venda.validate();
    if (errors.length > 0) {
      throw { type: 'validation', errors };
    }

    // 2. Buscar dados do produto para cálculos
    const produto = await ProdutoRepository.findById(data.produto_id);
    if (!produto) {
      throw { type: 'not_found', message: 'Produto não encontrado.' };
    }

    // 3. Calcular valores (lógica de negócio NO MODEL)
    const valores = Venda.calcularValores(
      venda.quantidade,
      produto.preco_venda,
      produto.custo_estimado,
      venda.desconto
    );

    // 4. Atribuir valores calculados à instância
    Object.assign(venda, valores);

    // 5. Persistir via Repository
    return VendaRepository.create(venda);
  }

  /**
   * Atualiza uma venda existente
   * @param {number} id - ID da venda
   * @param {Object} data - Dados para atualização
   * @returns {Promise<Venda>}
   */
  static async update(id, data) {
    // 1. Verificar existência
    const exists = await VendaRepository.findById(id);
    if (!exists) {
      throw { type: 'not_found', message: 'Venda não encontrada.' };
    }

    // 2. Validar dados
    const venda = new Venda({ ...data, id });
    const errors = venda.validate(true);
    if (errors.length > 0) {
      throw { type: 'validation', errors };
    }

    // 3. Buscar produto e recalcular valores
    const produtoId = data.produto_id || exists.produto_id;
    const produto = await ProdutoRepository.findById(produtoId);
    if (!produto) {
      throw { type: 'not_found', message: 'Produto não encontrado.' };
    }

    // 4. Calcular valores usando dados novos ou existentes
    const valores = Venda.calcularValores(
      venda.quantidade ?? exists.quantidade,
      produto.preco_venda,
      produto.custo_estimado,
      venda.desconto ?? exists.desconto
    );
    Object.assign(venda, valores);

    // 5. Persistir e retornar atualizado
    await VendaRepository.update(id, venda);
    return VendaRepository.findById(id);
  }

  /**
   * Exclui uma venda
   * @param {number} id - ID da venda
   * @returns {Promise<boolean>}
   */
  static async delete(id) {
    const exists = await VendaRepository.findById(id);
    if (!exists) {
      throw { type: 'not_found', message: 'Venda não encontrada.' };
    }
    return VendaRepository.delete(id);
  }

  /**
   * Gera relatório de vendas por período
   * @param {string} dataInicio - Data inicial
   * @param {string} dataFim - Data final
   * @returns {Promise<Array>}
   */
  static async getRelatorio(dataInicio, dataFim) {
    if (!dataInicio || !dataFim) {
      throw { type: 'validation', errors: ['Data de início e data de fim são obrigatórias.'] };
    }
    return VendaRepository.getRelatorioPeriodo(dataInicio, dataFim);
  }
}

module.exports = Venda;
