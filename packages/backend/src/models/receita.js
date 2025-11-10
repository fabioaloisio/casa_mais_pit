class Receita {
  constructor(data) {
    this.id = data.id || null;
    this.nome = data.nome;
    this.descricao = data.descricao || '';
    this.rendimento = data.rendimento || 1;
    this.custo_estimado = data.custo_estimado || 0;
    this.ativo = data.ativo !== undefined ? data.ativo : 1;
    this.materias_primas = data.materias_primas || [];
  }

  validate(isUpdate = false) {
    const errors = [];

    if (!isUpdate || this.nome !== undefined) {
      if (!this.nome || this.nome.trim().length === 0) {
        errors.push('Nome é obrigatório.');
      }
    }

    if (!isUpdate || this.rendimento !== undefined) {
      if (this.rendimento === null || this.rendimento < 1) {
        errors.push('Rendimento deve ser maior ou igual a 1.');
      }
    }

    return errors;
  }

  toJSON() {
    return {
      id: this.id,
      nome: this.nome,
      descricao: this.descricao,
      rendimento: parseInt(this.rendimento),
      custo_estimado: parseFloat(this.custo_estimado),
      ativo: this.ativo,
      materias_primas: this.materias_primas
    };
  }
}

module.exports = Receita;

