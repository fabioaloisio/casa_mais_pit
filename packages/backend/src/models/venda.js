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
}

module.exports = Venda;

