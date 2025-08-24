class Doacao {
  constructor(doacao) {
    this.id = doacao.id;
    this.doadorId = doacao.doadorId;
    this.valor = parseFloat(doacao.valor) || 0;
    this.dataDoacao = doacao.dataDoacao;
    this.observacoes = doacao.observacoes || null;
    this.dataCadastro = doacao.dataCadastro || new Date();
    this.dataAtualizacao = doacao.dataAtualizacao || null;
    
    // Campos do doador (apenas para exibição quando vem de JOIN)
    this.doador = doacao.doador || null;
  }

  validaDoacao() {
    const erros = [];

    // Validação do doador
    if (!this.doadorId) {
      erros.push('Doador é obrigatório');
    }

    // Validação do valor
    if (!this.valor || this.valor <= 0) {
      erros.push('Valor da doação deve ser maior que zero');
    }

    // Validação da data de doação
    if (!this.dataDoacao) {
      erros.push('Data da doação é obrigatória');
    } else {
      const dataDoacao = new Date(this.dataDoacao);
      const hoje = new Date();
      
      if (dataDoacao > hoje) {
        erros.push('Data da doação não pode ser futura');
      }
    }

    return erros;
  }


  // Formata data para MySQL
  getDataDoacaoParaMySQL() {
    if (!this.dataDoacao) return null;
    
    const data = new Date(this.dataDoacao);
    return data.toISOString().split('T')[0];
  }

  // Formata datas de timestamp para MySQL
  getDataCadastroParaMySQL() {
    const data = new Date(this.dataCadastro);
    return data.toISOString().slice(0, 19).replace('T', ' ');
  }

  getDataAtualizacaoParaMySQL() {
    if (!this.dataAtualizacao) return null;
    
    const data = new Date(this.dataAtualizacao);
    return data.toISOString().slice(0, 19).replace('T', ' ');
  }

  // Prepara objeto para inserção/atualização no banco
  paraMySQL() {
    return {
      doador_id: this.doadorId,
      valor: this.valor,
      data_doacao: this.getDataDoacaoParaMySQL(),
      observacoes: this.observacoes,
      data_cadastro: this.getDataCadastroParaMySQL(),
      data_atualizacao: this.getDataAtualizacaoParaMySQL()
    };
  }

  // Converte para JSON para resposta da API
  toJSON() {
    return {
      id: this.id,
      doadorId: this.doadorId,
      doador: this.doador,
      valor: this.valor,
      dataDoacao: this.dataDoacao,
      observacoes: this.observacoes,
      dataCadastro: this.dataCadastro,
      dataAtualizacao: this.dataAtualizacao
    };
  }

  // Método estático para criar doação a partir do resultado do banco
  static fromDatabase(row) {
    const doacao = new Doacao({
      id: row.id,
      doadorId: row.doador_id,
      valor: row.valor,
      dataDoacao: row.data_doacao,
      observacoes: row.observacoes,
      dataCadastro: row.data_cadastro,
      dataAtualizacao: row.data_atualizacao
    });

    // Se veio dados do doador via JOIN, adiciona
    if (row.doador_nome) {
      doacao.doador = {
        id: row.doador_id,
        nome: row.doador_nome,
        documento: row.doador_documento,
        tipo_doador: row.doador_tipo_doador,
        email: row.doador_email,
        telefone: row.doador_telefone,
        ativo: row.doador_ativo === 1 || row.doador_ativo === true
      };
    }

    return doacao;
  }
}

module.exports = Doacao;