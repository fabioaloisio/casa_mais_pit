// Aldruin Bonfim de Lima Souza - RA 10482416915
class Medicamento {
  constructor(data) {
    this.id = data.id || null;
    this.nome = data.nome;
    this.forma_farmaceutica = data.forma_farmaceutica;
    this.descricao = data.descricao || '';
    this.unidade_medida_id = data.unidade_medida_id;
  }

  validate(isUpdate = false) {
    const errors = [];

    if (!isUpdate || this.nome !== undefined) {
      if (!this.nome || this.nome.trim().length === 0) {
        errors.push(isUpdate ? 'Nome do Medicamento não pode ser vazio.' : 'Nome do Medicamento é obrigatório.');
      }
    }

    if (!isUpdate || this.forma_farmaceutica !== undefined) {
      if (!this.forma_farmaceutica || this.forma_farmaceutica.trim().length === 0) {
        errors.push(isUpdate ? 'Forma Farmacêutica não pode ser vazia.' : 'Forma Farmacêutica é obrigatória.');
      }
    }

    if (!isUpdate || this.descricao !== undefined) {
      if (this.descricao.length > 250) {
        errors.push('Descrição deve ter no máximo 250 caracteres.');
      }
    }

    if (!isUpdate || this.unidade_medida_id !== undefined) {
      if (!this.unidade_medida_id || typeof this.unidade_medida_id !== 'number') {
        errors.push('Unidade de Medida é obrigatória e deve ser um ID válido.');
      }
    }

    return errors;
  }

  toJSON() {
    return {
      id: this.id,
      nome: this.nome,
      forma_farmaceutica: this.forma_farmaceutica,
      descricao: this.descricao,
      unidade_medida_id: this.unidade_medida_id
    };
  }
}

module.exports = Medicamento;