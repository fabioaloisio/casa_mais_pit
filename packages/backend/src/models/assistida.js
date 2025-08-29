
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
  }

  validate() {
    const errors = [];

    // Regras básicas
    if (!this.nome || this.nome.trim() === '') errors.push('Nome é obrigatório');
    if (!this.cpf || this.cpf.trim() === '') errors.push('CPF é obrigatório');
    if (!this.data_nascimento) errors.push('Data de nascimento é obrigatória');
    if (!this.estado || this.estado.trim().length !== 2) errors.push('Estado deve ter 2 letras');
    if (!this.telefone || this.telefone.trim() === '') errors.push('Telefone é obrigatório');
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
    };
  }
}


module.exports = { Assistida};
