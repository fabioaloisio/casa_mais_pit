class Usuario {
  constructor({
    id = null,
    nome,
    email,
    senha,
    tipo = 'Colaborador',
    status = 'pendente',
    token_ativacao = null,
    ativo = true,
    data_cadastro = null,
    data_atualizacao = null,
    data_aprovacao = null,
    aprovado_por = null,
    data_ativacao = null,
    data_ultimo_acesso = null,
    data_bloqueio = null,
    motivo_bloqueio = null,
    bloqueado_por = null,
    data_suspensao = null,
    data_fim_suspensao = null,
    suspenso_por = null,
    motivo_suspensao = null
  }) {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.senha = senha;
    this.tipo = tipo;
    this.status = status;
    this.token_ativacao = token_ativacao;
    this.ativo = ativo;
    this.data_cadastro = data_cadastro;
    this.data_atualizacao = data_atualizacao;
    this.data_aprovacao = data_aprovacao;
    this.aprovado_por = aprovado_por;
    this.data_ativacao = data_ativacao;
    this.data_ultimo_acesso = data_ultimo_acesso;
    this.data_bloqueio = data_bloqueio;
    this.motivo_bloqueio = motivo_bloqueio;
    this.bloqueado_por = bloqueado_por;
    this.data_suspensao = data_suspensao;
    this.data_fim_suspensao = data_fim_suspensao;
    this.suspenso_por = suspenso_por;
    this.motivo_suspensao = motivo_suspensao;
  }

  // Método para converter para objeto JSON (sem senha e token)
  toJSON() {
    return {
      id: this.id,
      nome: this.nome,
      email: this.email,
      tipo: this.tipo,
      status: this.status,
      ativo: this.ativo,
      data_cadastro: this.data_cadastro,
      data_atualizacao: this.data_atualizacao,
      data_aprovacao: this.data_aprovacao,
      aprovado_por: this.aprovado_por,
      data_ativacao: this.data_ativacao,
      data_ultimo_acesso: this.data_ultimo_acesso,
      data_bloqueio: this.data_bloqueio,
      motivo_bloqueio: this.motivo_bloqueio,
      bloqueado_por: this.bloqueado_por,
      data_suspensao: this.data_suspensao,
      data_fim_suspensao: this.data_fim_suspensao,
      suspenso_por: this.suspenso_por,
      motivo_suspensao: this.motivo_suspensao
    };
  }

  // Método para validação básica
  isValid() {
    return !!(this.nome && this.email && this.senha);
  }
}

module.exports = Usuario;