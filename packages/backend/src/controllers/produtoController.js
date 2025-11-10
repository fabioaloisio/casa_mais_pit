const ProdutoRepository = require('../repository/produtoRepository');
const Produto = require('../models/produto');

class ProdutoController {
  async getAll(req, res) {
    try {
      const produtos = await ProdutoRepository.findAll();

      res.json({
        success: true,
        data: produtos.map(p => p.toJSON()),
        total: produtos.length
      });

    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const produto = await ProdutoRepository.findById(id);

      if (!produto) {
        return res.status(404).json({
          success: false,
          message: 'Produto não encontrado.'
        });
      }

      res.json({
        success: true,
        data: produto.toJSON(),
      });

    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req, res) {
    try {
      const produto = new Produto(req.body);
      const errors = produto.validate();

      if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
      }

      const novoProduto = await ProdutoRepository.create(produto);

      res.status(201).json({
        success: true,
        data: novoProduto.toJSON(),
        message: 'Produto cadastrado com sucesso.'
      });

    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const produto = new Produto({ ...req.body, id });

      const errors = produto.validate(true);
      if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
      }

      const exists = await ProdutoRepository.findById(id);
      if (!exists) {
        return res.status(404).json({
          success: false,
          message: 'Produto não encontrado.'
        });
      }

      const success = await ProdutoRepository.update(id, produto);

      if (success) {
        const updated = await ProdutoRepository.findById(id);
        res.json({
          success: true,
          data: updated.toJSON(),
          message: 'Produto atualizado com sucesso.'
        });
      } else {
        res.status(500).json({ success: false, message: 'Erro ao atualizar produto.' });
      }

    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      const exists = await ProdutoRepository.findById(id);
      if (!exists) {
        return res.status(404).json({ success: false, message: 'Produto não encontrado.' });
      }

      const success = await ProdutoRepository.delete(id);

      if (success) {
        res.json({
          success: true,
          message: 'Produto excluído com sucesso.'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erro ao excluir produto.'
        });
      }

    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new ProdutoController();

