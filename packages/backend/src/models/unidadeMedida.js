class UnidadeMedida {
  constructor(data) {
    this.id = data.id || null;
    this.nome = data.nome;
    this.sigla = data.sigla;
  }

  validate(isUpdate = false) {
    const errors = [];

    if (!isUpdate || this.nome !== undefined) {
      if (!this.nome || this.nome.trim().length === 0) {
        errors.push(isUpdate ? 'Nome da unidade de medida não pode ser vazio.' : 'Nome da unidade de medida é obrigatório.');
      }
    }

    if (!isUpdate || this.sigla !== undefined) {
      if (!this.sigla || this.sigla.trim().length === 0) {
        errors.push(isUpdate ? 'Sigla da unidade de medida não pode ser vazia.' : 'Sigla da unidade de medida é obrigatória.');
      } else if (this.sigla.length > 5) {
        errors.push('Sigla da unidade de medida deve ter no máximo 5 caracteres.');
      }
    }

    return errors;
  }

  toJSON() {
    return {
      id: this.id,
      nome: this.nome,
      sigla: this.sigla
    };
  }
}

module.exports = UnidadeMedida;