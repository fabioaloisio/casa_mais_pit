class Produto {
  constructor(data) {
    this.id = data.id || null;
    this.nome = data.nome;
    this.descricao = data.descricao || '';
    this.preco_venda = data.preco_venda || 0;
    this.receita_id = data.receita_id || null;
    this.custo_estimado = data.custo_estimado || 0;
    this.margem_bruta = data.margem_bruta || 0;
    this.margem_percentual = data.margem_percentual || 0;
    this.ativo = data.ativo !== undefined ? data.ativo : 1;
  }

  validate(isUpdate = false) {
    const errors = [];

    if (!isUpdate || this.nome !== undefined) {
      if (!this.nome || this.nome.trim().length === 0) {
        errors.push('Nome é obrigatório.');
      }
    }

    if (!isUpdate || this.preco_venda !== undefined) {
      if (this.preco_venda === null || this.preco_venda < 0) {
        errors.push('Preço de venda deve ser maior ou igual a zero.');
      }
    }

    return errors;
  }

  toJSON() {
    return {
      id: this.id,
      nome: this.nome,
      descricao: this.descricao,
      preco_venda: parseFloat(this.preco_venda),
      receita_id: this.receita_id,
      custo_estimado: parseFloat(this.custo_estimado),
      margem_bruta: parseFloat(this.margem_bruta),
      margem_percentual: parseFloat(this.margem_percentual),
      ativo: this.ativo
    };
  }
}

module.exports = Produto;

