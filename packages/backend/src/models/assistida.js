// Classe de substância utilizada
class DrogaUtilizada {
  constructor(data = {}) {
    this.tipo = data.tipo || null;
    this.idade_inicio = data.idade_inicio || null;
    this.tempo_uso = data.tempo_uso || null;
    this.intensidade = data.intensidade || null;
  }

  validate() {
    const errors = [];
    if (!this.tipo || this.tipo.trim() === '') {
      errors.push('Tipo de substância é obrigatório');
    }
    if (!this.idade_inicio) {
      errors.push('Idade de início é obrigatória');
    }
    if (!this.tempo_uso) {
      errors.push('Tempo de uso é obrigatório');
    }
    if (!this.intensidade) {
      errors.push('Intensidade é obrigatória');
    }
    return errors;
  }

  toJSON() {
    return {
      tipo: this.tipo,
      idade_inicio: this.idade_inicio,
      tempo_uso: this.tempo_uso,
      intensidade: this.intensidade
    };
  }
}

// Classe de internação
class Internacao {
  constructor(data = {}) {
    this.local = data.local || null;
    this.duracao = data.duracao || null;
    this.data = data.data || null;
  }

  validate() {
    const errors = [];
    if (!this.local || this.local.trim() === '') {
      errors.push('Local da internação é obrigatório');
    }
    if (!this.duracao || this.duracao.trim() === '') {
      errors.push('Duração da internação é obrigatória');
    }
    if (!this.data) {
      errors.push('Data da internação é obrigatória');
    }
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


// Classe principal
class Assistida {
  constructor(data = {}) {
    this.id = data.id || null;

    // Dados pessoais
    this.nome = data.nome || null;
    this.cpf = data.cpf || null;
    this.rg = data.rg || null;
    this.idade = data.idade || null;
    this.data_nascimento = data.data_nascimento || null;
    this.nacionalidade = data.nacionalidade || null;
    this.estado_civil = data.estado_civil || null;
    this.profissao = data.profissao || null;
    this.escolaridade = data.escolaridade || null;
    this.status = data.status || null;

    // Endereço e contato
    this.logradouro = data.logradouro || null;
    this.bairro = data.bairro || null;
    this.numero = data.numero || null;
    this.cep = data.cep || null;
    this.estado = data.estado || null;
    this.cidade = data.cidade || null;
    this.telefone = data.telefone || null;
    this.telefone_contato = data.telefone_contato || null;

    // Atendimento
    this.data_atendimento = data.data_atendimento || null;
    this.hora = data.hora || null;
    this.historia_patologica = data.historia_patologica || null;
    this.tempo_sem_uso = data.tempo_sem_uso || null;

    // Medicamentos
    this.medicamentos = (data.medicamentos || []).map(m => new MedicamentoUtilizado(m));

    // Internações
    this.motivacao_internacoes = data.motivacao_internacoes || null;
    this.internacoes = (data.internacoes || []).map(i => new Internacao(i));

    // Drogas
    this.drogas = (data.drogas || []).map(d => new DrogaUtilizada(d));

    // Contexto pessoal
    this.fatos_marcantes = data.fatos_marcantes || null;
    this.infancia = data.infancia || null;
    this.adolescencia = data.adolescencia || null;
  }

  validate() {
    const errors = [];

    // Regras básicas
    if (!this.nome || this.nome.trim() === '') errors.push('Nome é obrigatório');
    if (!this.cpf || this.cpf.trim() === '') errors.push('CPF é obrigatório');
    if (!this.data_nascimento) errors.push('Data de nascimento é obrigatória');
    if (!this.estado || this.estado.trim().length !== 2) errors.push('Estado deve ter 2 letras');
    if (!this.telefone || this.telefone.trim() === '') errors.push('Telefone é obrigatório');

    this.medicamentos.forEach((med, index) => {
      const e = med.validate();
      if (e.length > 0) {
        errors.push(`Erro no medicamento ${index + 1}: ${e.join(', ')}`);
      }
    });


    // Validar drogas utilizadas
    this.drogas.forEach((droga, index) => {
      const e = droga.validate();
      if (e.length > 0) {
        errors.push(`Erro na substância ${index + 1}: ${e.join(', ')}`);
      }
    });

    // Validar internações
    this.internacoes.forEach((internacao, index) => {
      const e = internacao.validate();
      if (e.length > 0) {
        errors.push(`Erro na internação ${index + 1}: ${e.join(', ')}`);
      }
    });

    return errors;
  }

  toJSON() {
    return {
      id: this.id,

      nome: this.nome,
      cpf: this.cpf,
      rg: this.rg,
      idade: this.idade,
      data_nascimento: this.data_nascimento,
      nacionalidade: this.nacionalidade,
      estado_civil: this.estado_civil,
      profissao: this.profissao,
      escolaridade: this.escolaridade,
      status: this.status,

      logradouro: this.logradouro,
      bairro: this.bairro,
      numero: this.numero,
      cep: this.cep,
      estado: this.estado,
      cidade: this.cidade,
      telefone: this.telefone,
      telefone_contato: this.telefone_contato,

      data_atendimento: this.data_atendimento,
      hora: this.hora,
      historia_patologica: this.historia_patologica,
      tempo_sem_uso: this.tempo_sem_uso,

      medicamentos: this.medicamentos.map(m => m.toJSON()),

      motivacao_internacoes: this.motivacao_internacoes,
      internacoes: this.internacoes.map(i => i.toJSON()),

      drogas: this.drogas.map(d => d.toJSON()),

      fatos_marcantes: this.fatos_marcantes,
      infancia: this.infancia,
      adolescencia: this.adolescencia
    };
  }
}


module.exports = { Assistida, DrogaUtilizada, Internacao, MedicamentoUtilizado };
