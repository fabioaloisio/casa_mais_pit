class Substancia {
  constructor({ id, nome, categoria, descricao, createdAt, updatedAt }) {
    this.id = id;
    this.nome = nome;
    this.categoria = categoria;
    this.descricao = descricao;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Validação simples
  validate() {
    const errors = [];
    if (!this.nome || this.nome.trim() === '') {
      errors.push('O campo "nome" é obrigatório.');
    }
    if (!this.categoria || this.categoria.trim() === '') {
      errors.push('O campo "categoria" é obrigatório.');
    }
    return errors;
  }

  // Converter para JSON
  toJSON() {
    return {
      id: this.id,
      nome: this.nome,
      categoria: this.categoria,
      descricao: this.descricao,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Substancia;
