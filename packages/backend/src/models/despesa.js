class Despesa {
  constructor(data) {
    this.id = data.id || null;
    this.descricao = data.descricao;
    this.categoria = data.categoria; // Manter para compatibilidade e exibição
    this.tipo_despesa_id = data.tipo_despesa_id;
    this.valor = data.valor;
    this.data_despesa = data.data_despesa;
    this.forma_pagamento = data.forma_pagamento;
    this.fornecedor = data.fornecedor || null;
    this.observacoes = data.observacoes || null;
    this.status = data.status || 'pendente';
    this.data_cadastro = data.data_cadastro || null;
    this.data_atualizacao = data.data_atualizacao || null;
  }

  validate(isUpdate = false) {
    const errors = [];

    if (!isUpdate || this.descricao !== undefined) {
      if (!this.descricao || this.descricao.trim().length === 0) {
        errors.push(isUpdate ? 'Descrição não pode ser vazia.' : 'Descrição é obrigatória.');
      } else if (this.descricao.trim().length < 3) {
        errors.push('Descrição deve ter pelo menos 3 caracteres.');
      } else if (this.descricao.trim().length > 255) {
        errors.push('Descrição deve ter no máximo 255 caracteres.');
      }
    }

    if (!isUpdate || this.tipo_despesa_id !== undefined) {
      const tipoId = Number(this.tipo_despesa_id);
      if (!this.tipo_despesa_id || isNaN(tipoId) || tipoId <= 0) {
        errors.push(isUpdate ? 'Tipo de despesa não pode ser vazio.' : 'Tipo de despesa é obrigatório.');
      }
    }

    if (!isUpdate || this.valor !== undefined) {
      const valorNumerico = Number(this.valor);
      if (isNaN(valorNumerico)) {
        errors.push('Valor deve ser um número válido.');
      } else if (valorNumerico <= 0) {
        errors.push('Valor deve ser maior que zero.');
      }
    }

    if (!isUpdate || this.data_despesa !== undefined) {
      if (!this.data_despesa) {
        errors.push('Data da despesa é obrigatória.');
      } else {
        const dataDespesa = new Date(this.data_despesa);
        const hoje = new Date();
        hoje.setHours(23, 59, 59, 999); // Fim do dia atual
        
        if (dataDespesa > hoje) {
          errors.push('Data da despesa não pode ser futura.');
        }
      }
    }

    if (!isUpdate || this.forma_pagamento !== undefined) {
      if (!this.forma_pagamento || this.forma_pagamento.trim().length === 0) {
        errors.push(isUpdate ? 'Forma de pagamento não pode ser vazia.' : 'Forma de pagamento é obrigatória.');
      }
    }

    if (!isUpdate || this.status !== undefined) {
      const statusValidos = ['pendente', 'paga', 'cancelada'];
      if (!this.status || !statusValidos.includes(this.status)) {
        errors.push('Status deve ser: pendente, paga ou cancelada.');
      }
    }

    if (this.fornecedor !== undefined && this.fornecedor !== null) {
      if (this.fornecedor.trim().length > 255) {
        errors.push('Fornecedor deve ter no máximo 255 caracteres.');
      }
    }

    if (this.observacoes !== undefined && this.observacoes !== null) {
      if (this.observacoes.trim().length > 1000) {
        errors.push('Observações devem ter no máximo 1000 caracteres.');
      }
    }

    return errors;
  }

  // Formatar data para MySQL
  getDataDespesaParaMySQL() {
    if (!this.data_despesa) return null;
    const data = new Date(this.data_despesa);
    return data.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  // Preparar dados para inserção/atualização no MySQL
  paraMySQL() {
    return {
      descricao: this.descricao?.trim(),
      categoria: this.categoria?.trim(), // Manter para compatibilidade durante transição
      tipo_despesa_id: Number(this.tipo_despesa_id),
      valor: Number(this.valor),
      data_despesa: this.getDataDespesaParaMySQL(),
      forma_pagamento: this.forma_pagamento?.trim(),
      fornecedor: this.fornecedor?.trim() || null,
      observacoes: this.observacoes?.trim() || null,
      status: this.status
    };
  }

  toJSON() {
    return {
      id: this.id,
      descricao: this.descricao,
      categoria: this.categoria,
      tipo_despesa_id: this.tipo_despesa_id,
      valor: this.valor,
      data_despesa: this.data_despesa,
      forma_pagamento: this.forma_pagamento,
      fornecedor: this.fornecedor,
      observacoes: this.observacoes,
      status: this.status,
      data_cadastro: this.data_cadastro,
      data_atualizacao: this.data_atualizacao
    };
  }

  // Criar instância a partir de dados do banco
  static fromDatabase(row) {
    return new Despesa({
      id: row.id,
      descricao: row.descricao,
      categoria: row.categoria,
      tipo_despesa_id: row.tipo_despesa_id,
      valor: parseFloat(row.valor),
      data_despesa: row.data_despesa,
      forma_pagamento: row.forma_pagamento,
      fornecedor: row.fornecedor,
      observacoes: row.observacoes,
      status: row.status,
      data_cadastro: row.data_cadastro,
      data_atualizacao: row.data_atualizacao
    });
  }
}

module.exports = Despesa;