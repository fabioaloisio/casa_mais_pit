class Usuario {
  constructor({
    id = null,
    nome,
    email,
    senha,
    tipo = 'Colaborador',
    ativo = true,
    data_cadastro = null,
    data_atualizacao = null
  }) {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.senha = senha;
    this.tipo = tipo;
    this.ativo = ativo;
    this.data_cadastro = data_cadastro;
    this.data_atualizacao = data_atualizacao;
  }

  // Método para converter para objeto JSON (sem senha)
  toJSON() {
    return {
      id: this.id,
      nome: this.nome,
      email: this.email,
      tipo: this.tipo,
      ativo: this.ativo,
      data_cadastro: this.data_cadastro,
      data_atualizacao: this.data_atualizacao
    };
  }

  // Método para validação básica
  isValid() {
    return !!(this.nome && this.email && this.senha);
  }
}

module.exports = Usuario;