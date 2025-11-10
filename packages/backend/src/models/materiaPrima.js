class MateriaPrima {
  constructor(data) {
    this.id = data.id || null;
    this.nome = data.nome;
    this.unidade_medida = data.unidade_medida;
    this.preco_por_unidade = data.preco_por_unidade || 0;
    this.descricao = data.descricao || '';
    this.ativo = data.ativo !== undefined ? data.ativo : 1;
  }

  validate(isUpdate = false) {
    const errors = [];

    if (!isUpdate || this.nome !== undefined) {
      if (!this.nome || this.nome.trim().length === 0) {
        errors.push('Nome é obrigatório.');
      }
    }

    if (!isUpdate || this.unidade_medida !== undefined) {
      if (!this.unidade_medida || this.unidade_medida.trim().length === 0) {
        errors.push('Unidade de medida é obrigatória.');
      }
    }

    if (!isUpdate || this.preco_por_unidade !== undefined) {
      if (this.preco_por_unidade === null || this.preco_por_unidade < 0) {
        errors.push('Preço por unidade deve ser maior ou igual a zero.');
      }
    }

    return errors;
  }

  toJSON() {
    return {
      id: this.id,
      nome: this.nome,
      unidade_medida: this.unidade_medida,
      preco_por_unidade: parseFloat(this.preco_por_unidade),
      descricao: this.descricao,
      ativo: this.ativo
    };
  }
}

module.exports = MateriaPrima;

