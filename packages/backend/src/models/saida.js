// Juliano Campos - Model de Saída
class Saida {
  constructor(data) {
    this.id = data.id || null;
    this.assistidaId = data.assistidaId || data.assistida_id; // aceita ambos os formatos
    this.dataSaida = data.dataSaida || data.data_saida || new Date().toISOString();
    this.diasInternacao = data.diasInternacao || data.dias_internacao || null;
    this.motivoSaida = data.motivoSaida || data.motivo_saida || '';
    this.observacoesSaida = data.observacoesSaida || data.observacoes_saida || '';
  }

  validate(isUpdate = false) {
    const errors = [];

    if (!isUpdate || this.assistidaId !== undefined) {
      if (!this.assistidaId || isNaN(Number(this.assistidaId))) {
        errors.push('Assistida ID é obrigatório e deve ser um número válido.');
      }
    }

    if (!isUpdate || this.dataSaida !== undefined) {
      if (!this.dataSaida || isNaN(new Date(this.dataSaida).getTime())) {
        errors.push('Data de Saída é obrigatória e deve ser uma data válida.');
      }
    }

    if (!isUpdate || this.diasInternacao !== undefined) {
      if (this.diasInternacao === null || isNaN(Number(this.diasInternacao)) || this.diasInternacao < 0) {
        errors.push('Dias de Internação é obrigatório e deve ser um número válido.');
      }
    }

    if (!isUpdate || this.motivoSaida !== undefined) {
      if (!this.motivoSaida || this.motivoSaida.trim().length === 0) {
        errors.push('Motivo da Saída é obrigatório.');
      }
    }

    if (!isUpdate || this.observacoesSaida !== undefined) {
      if (this.observacoesSaida.length > 500) {
        errors.push('Observações devem ter no máximo 500 caracteres.');
      }
    }

    return errors;
  }

  toJSON() {
    return {
      id: this.id,
      assistidaId: this.assistidaId,
      dataSaida: this.dataSaida,
      diasInternacao: this.diasInternacao,
      motivoSaida: this.motivoSaida,
      observacoesSaida: this.observacoesSaida
    };
  }
}

module.exports = Saida;
