class TipoDespesa {
  constructor(data) {
    this.id = data.id || null;
    this.nome = data.nome;
    this.descricao = data.descricao || null;
    this.ativo = data.ativo !== undefined ? data.ativo : true;
  }

  validate(isUpdate = false) {
    const errors = [];

    if (!isUpdate || this.nome !== undefined) {
      if (!this.nome || this.nome.trim().length === 0) {
        errors.push(isUpdate ? 'Nome do tipo de despesa não pode ser vazio.' : 'Nome do tipo de despesa é obrigatório.');
      } else if (this.nome.trim().length > 100) {
        errors.push('Nome do tipo de despesa deve ter no máximo 100 caracteres.');
      }
    }

    if (!isUpdate || this.descricao !== undefined) {
      if (this.descricao && this.descricao.trim().length > 500) {
        errors.push('Descrição deve ter no máximo 500 caracteres.');
      }
    }

    if (!isUpdate || this.ativo !== undefined) {
      if (this.ativo !== undefined && typeof this.ativo !== 'boolean') {
        errors.push('Status ativo deve ser um valor booleano.');
      }
    }

    return errors;
  }

  toJSON() {
    return {
      id: this.id,
      nome: this.nome,
      descricao: this.descricao,
      ativo: this.ativo
    };
  }
}

module.exports = TipoDespesa;