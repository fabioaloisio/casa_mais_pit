const VendaRepository = require('../repository/vendaRepository');
const Venda = require('../models/venda');

class VendaController {
  async getAll(req, res) {
    try {
      const { data_inicio, data_fim, produto_id } = req.query;
      const filters = {};

      if (data_inicio) filters.data_inicio = data_inicio;
      if (data_fim) filters.data_fim = data_fim;
      if (produto_id) filters.produto_id = parseInt(produto_id);

      const vendas = await VendaRepository.findAll(filters);

      res.json({
        success: true,
        data: vendas.map(v => v.toJSON()),
        total: vendas.length
      });

    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const venda = await VendaRepository.findById(id);

      if (!venda) {
        return res.status(404).json({
          success: false,
          message: 'Venda não encontrada.'
        });
      }

      res.json({
        success: true,
        data: venda.toJSON(),
      });

    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req, res) {
    try {
      const vendaData = {
        ...req.body,
        usuario_id: req.user?.id || null
      };
      const venda = new Venda(vendaData);
      const errors = venda.validate();

      if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
      }

      const novaVenda = await VendaRepository.create(venda);

      res.status(201).json({
        success: true,
        data: novaVenda.toJSON(),
        message: 'Venda cadastrada com sucesso.'
      });

    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const venda = new Venda({ ...req.body, id });

      const errors = venda.validate(true);
      if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
      }

      const exists = await VendaRepository.findById(id);
      if (!exists) {
        return res.status(404).json({
          success: false,
          message: 'Venda não encontrada.'
        });
      }

      const success = await VendaRepository.update(id, venda);

      if (success) {
        const updated = await VendaRepository.findById(id);
        res.json({
          success: true,
          data: updated.toJSON(),
          message: 'Venda atualizada com sucesso.'
        });
      } else {
        res.status(500).json({ success: false, message: 'Erro ao atualizar venda.' });
      }

    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      const exists = await VendaRepository.findById(id);
      if (!exists) {
        return res.status(404).json({ success: false, message: 'Venda não encontrada.' });
      }

      const success = await VendaRepository.delete(id);

      if (success) {
        res.json({
          success: true,
          message: 'Venda excluída com sucesso.'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erro ao excluir venda.'
        });
      }

    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getRelatorio(req, res) {
    try {
      const { data_inicio, data_fim } = req.query;

      if (!data_inicio || !data_fim) {
        return res.status(400).json({
          success: false,
          message: 'Data de início e data de fim são obrigatórias.'
        });
      }

      const relatorio = await VendaRepository.getRelatorioPeriodo(data_inicio, data_fim);

      res.json({
        success: true,
        data: relatorio,
        total: relatorio.length
      });

    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new VendaController();

