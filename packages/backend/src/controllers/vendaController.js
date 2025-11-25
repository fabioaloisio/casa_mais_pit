const Venda = require('../models/venda');

class VendaController {
  async getAll(req, res) {
    try {
      const { data_inicio, data_fim, produto_id } = req.query;
      const filters = {};

      if (data_inicio) filters.data_inicio = data_inicio;
      if (data_fim) filters.data_fim = data_fim;
      if (produto_id) filters.produto_id = parseInt(produto_id);

      const vendas = await Venda.findAll(filters);

      res.json({
        success: true,
        data: vendas.map(v => v.toJSON()),
        total: vendas.length
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getById(req, res) {
    try {
      const venda = await Venda.findById(req.params.id);

      if (!venda) {
        return res.status(404).json({
          success: false,
          message: 'Venda não encontrada.'
        });
      }

      res.json({
        success: true,
        data: venda.toJSON()
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async create(req, res) {
    try {
      const vendaData = {
        ...req.body,
        usuario_id: req.user?.id || null
      };

      const novaVenda = await Venda.create(vendaData);

      res.status(201).json({
        success: true,
        data: novaVenda.toJSON(),
        message: 'Venda cadastrada com sucesso.'
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async update(req, res) {
    try {
      const updated = await Venda.update(req.params.id, req.body);

      res.json({
        success: true,
        data: updated.toJSON(),
        message: 'Venda atualizada com sucesso.'
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async delete(req, res) {
    try {
      await Venda.delete(req.params.id);

      res.json({
        success: true,
        message: 'Venda excluída com sucesso.'
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getRelatorio(req, res) {
    try {
      const { data_inicio, data_fim } = req.query;
      const relatorio = await Venda.getRelatorio(data_inicio, data_fim);

      res.json({
        success: true,
        data: relatorio,
        total: relatorio.length
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * Trata erros de forma centralizada
   * @param {Response} res - Objeto de resposta Express
   * @param {Error} error - Erro capturado
   */
  handleError(res, error) {
    if (error.type === 'validation') {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    if (error.type === 'not_found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = new VendaController();
