const ReceitaRepository = require('../repository/receitaRepository');
const Receita = require('../models/receita');

class ReceitaController {
  async getAll(req, res) {
    try {
      const receitas = await ReceitaRepository.findAll();

      res.json({
        success: true,
        data: receitas.map(r => r.toJSON()),
        total: receitas.length
      });

    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const receita = await ReceitaRepository.findById(id);

      if (!receita) {
        return res.status(404).json({
          success: false,
          message: 'Receita não encontrada.'
        });
      }

      res.json({
        success: true,
        data: receita.toJSON(),
      });

    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req, res) {
    try {
      const receita = new Receita(req.body);
      const errors = receita.validate();

      if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
      }

      const novaReceita = await ReceitaRepository.create(receita);

      res.status(201).json({
        success: true,
        data: novaReceita.toJSON(),
        message: 'Receita cadastrada com sucesso.'
      });

    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const receita = new Receita({ ...req.body, id });

      const errors = receita.validate(true);
      if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
      }

      const exists = await ReceitaRepository.findById(id);
      if (!exists) {
        return res.status(404).json({
          success: false,
          message: 'Receita não encontrada.'
        });
      }

      const success = await ReceitaRepository.update(id, receita);

      if (success) {
        const updated = await ReceitaRepository.findById(id);
        res.json({
          success: true,
          data: updated.toJSON(),
          message: 'Receita atualizada com sucesso.'
        });
      } else {
        res.status(500).json({ success: false, message: 'Erro ao atualizar receita.' });
      }

    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      const exists = await ReceitaRepository.findById(id);
      if (!exists) {
        return res.status(404).json({ success: false, message: 'Receita não encontrada.' });
      }

      const success = await ReceitaRepository.delete(id);

      if (success) {
        res.json({
          success: true,
          message: 'Receita excluída com sucesso.'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erro ao excluir receita.'
        });
      }

    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new ReceitaController();

