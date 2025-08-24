class Doador {
  constructor(id, tipo_doador, nome, documento, email, telefone, endereco, cidade, estado, cep, data_cadastro, data_atualizacao, ativo) {
    this.id = id;
    this.tipo_doador = tipo_doador;
    this.nome = nome;
    this.documento = documento;
    this.email = email;
    this.telefone = telefone;
    this.endereco = endereco;
    this.cidade = cidade;
    this.estado = estado;
    this.cep = cep;
    this.data_cadastro = data_cadastro;
    this.data_atualizacao = data_atualizacao;
    this.ativo = ativo !== undefined ? ativo : true;
  }

  static fromRow(row) {
    return new Doador(
      row.id,
      row.tipo_doador,
      row.nome,
      row.documento,
      row.email,
      row.telefone,
      row.endereco,
      row.cidade,
      row.estado,
      row.cep,
      row.data_cadastro,
      row.data_atualizacao,
      row.ativo
    );
  }

  toCreateObject() {
    return {
      tipo_doador: this.tipo_doador,
      nome: this.nome,
      documento: this.documento,
      email: this.email || null,
      telefone: this.telefone,
      endereco: this.endereco || null,
      cidade: this.cidade || null,
      estado: this.estado || null,
      cep: this.cep || null,
      ativo: this.ativo
    };
  }

  toUpdateObject() {
    const obj = {};
    if (this.tipo_doador !== undefined) obj.tipo_doador = this.tipo_doador;
    if (this.nome !== undefined) obj.nome = this.nome;
    if (this.documento !== undefined) obj.documento = this.documento;
    if (this.email !== undefined) obj.email = this.email;
    if (this.telefone !== undefined) obj.telefone = this.telefone;
    if (this.endereco !== undefined) obj.endereco = this.endereco;
    if (this.cidade !== undefined) obj.cidade = this.cidade;
    if (this.estado !== undefined) obj.estado = this.estado;
    if (this.cep !== undefined) obj.cep = this.cep;
    if (this.ativo !== undefined) obj.ativo = this.ativo;
    return obj;
  }
}

module.exports = Doador;