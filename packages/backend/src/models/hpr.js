// Classes aninhadas
class DrogaUtilizada {
  constructor(data = {}) {
    this.assistida_id = data.assistida_id || null; // referência à substância
    this.tipo = data.tipo || null;
    this.idade_inicio = data.idade_inicio || null;
    this.tempo_uso = data.tempo_uso || null;
    this.intensidade = data.intensidade || null;
    this.observacoes = data.observacoes || null;
  }

  validate() {
    const errors = [];
    if (!this.assistida_id) errors.push('ID da substância é obrigatório');
    if (!this.tipo || this.tipo.trim() === '') errors.push('Tipo da substância é obrigatório');
    if (!this.idade_inicio) errors.push('Idade de início é obrigatória');
    if (!this.tempo_uso) errors.push('Tempo de uso é obrigatório');
    if (!this.intensidade) errors.push('Frequência é obrigatória');
    return errors;
  }

  toJSON() {
    return {
      assistida_id: this.assistida_id,
      tipo: this.tipo,
      idade_inicio: this.idade_inicio,
      tempo_uso: this.tempo_uso,
      intensidade: this.intensidade,
      observacoes: this.observacoes
    };
  }
}

class Internacao {
  constructor(data = {}) {
    this.local = data.local || null;
    this.duracao = data.duracao || null;
    this.data = data.data || null;
  }

  validate() {
    const errors = [];
    if (!this.local || this.local.trim() === '') errors.push('Local da internação é obrigatório');
    if (!this.duracao || this.duracao.trim() === '') errors.push('Duração da internação é obrigatória');
    if (!this.data) errors.push('Data da internação é obrigatória');
    return errors;
  }

  toJSON() {
    return {
      local: this.local,
      duracao: this.duracao,
      data: this.data
    };
  }
}

class MedicamentoUtilizado {
  constructor(data = {}) {
    this.nome = data.nome || null;
    this.dosagem = data.dosagem || null;
    this.frequencia = data.frequencia || null;
  }

  validate() {
    const errors = [];
    if (!this.nome || this.nome.trim() === '') errors.push('Nome do medicamento é obrigatório');
    if (!this.dosagem || this.dosagem.trim() === '') errors.push('Dosagem do medicamento é obrigatória');
    if (!this.frequencia || this.frequencia.trim() === '') errors.push('Frequência do medicamento é obrigatória');
    return errors;
  }

  toJSON() {
    return {
      nome: this.nome,
      dosagem: this.dosagem,
      frequencia: this.frequencia
    };
  }
}

// Classe principal: HPR
class HPR {
  constructor(data = {}) {
    this.id = data.id || null;
    this.assistida_id = data.assistida_id || null;
    this.data_atendimento = data.data_atendimento || null;
    this.hora = data.hora || null;
    this.historia_patologica = data.historia_patologica || null;
    this.tempo_sem_uso = data.tempo_sem_uso || null;
    this.motivacao_internacoes = data.motivacao_internacoes || null;
    this.fatos_marcantes = data.fatos_marcantes || null;
    this.infancia = data.infancia || null;
    this.adolescencia = data.adolescencia || null;

    // Arrays de entidades aninhadas
    this.drogas = (data.drogas || []).map(d => new DrogaUtilizada(d));
    this.medicamentos = (data.medicamentos || []).map(m => new MedicamentoUtilizado(m));
    this.internacoes = (data.internacoes || []).map(i => new Internacao(i));
  }

  validate() {
    const errors = [];
    if (!this.assistida_id) errors.push('ID da assistida é obrigatório');
    if (!this.data_atendimento) errors.push('Data de atendimento é obrigatória');

    this.drogas.forEach((d, i) => {
      const e = d.validate();
      if (e.length) errors.push(`Erro na substância ${i + 1}: ${e.join(', ')}`);
    });

    this.medicamentos.forEach((m, i) => {
      const e = m.validate();
      if (e.length) errors.push(`Erro no medicamento ${i + 1}: ${e.join(', ')}`);
    });

    this.internacoes.forEach((i, idx) => {
      const e = i.validate();
      if (e.length) errors.push(`Erro na internação ${idx + 1}: ${e.join(', ')}`);
    });

    return errors;
  }

  toJSON() {
    return {
      id: this.id,
      assistida_id: this.assistida_id,
      data_atendimento: this.data_atendimento,
      hora: this.hora,
      historia_patologica: this.historia_patologica,
      tempo_sem_uso: this.tempo_sem_uso,
      motivacao_internacoes: this.motivacao_internacoes,
      fatos_marcantes: this.fatos_marcantes,
      infancia: this.infancia,
      adolescencia: this.adolescencia,
      drogas: this.drogas.map(d => d.toJSON()),
      medicamentos: this.medicamentos.map(m => m.toJSON()),
      internacoes: this.internacoes.map(i => i.toJSON())
    };
  }
}

module.exports = { HPR, DrogaUtilizada, Internacao, MedicamentoUtilizado };
