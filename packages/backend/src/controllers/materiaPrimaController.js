const MateriaPrimaRepository = require('../repository/materiaPrimaRepository');
const MateriaPrima = require('../models/materiaPrima');

class MateriaPrimaController {
  async getAll(req, res) {
    try {
      const materiasPrimas = await MateriaPrimaRepository.findAll();

      res.json({
        success: true,
        data: materiasPrimas.map(mp => mp.toJSON()),
        total: materiasPrimas.length
      });

    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const materiaPrima = await MateriaPrimaRepository.findById(id);

      if (!materiaPrima) {
        return res.status(404).json({
          success: false,
          message: 'Matéria-prima não encontrada.'
        });
      }

      res.json({
        success: true,
        data: materiaPrima.toJSON(),
      });

    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req, res) {
    try {
      const materiaPrima = new MateriaPrima(req.body);
      const errors = materiaPrima.validate();

      if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
      }

      const novaMateriaPrima = await MateriaPrimaRepository.create(materiaPrima);

      res.status(201).json({
        success: true,
        data: novaMateriaPrima.toJSON(),
        message: 'Matéria-prima cadastrada com sucesso.'
      });

    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const materiaPrima = new MateriaPrima({ ...req.body, id });

      const errors = materiaPrima.validate(true);
      if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
      }

      const exists = await MateriaPrimaRepository.findById(id);
      if (!exists) {
        return res.status(404).json({
          success: false,
          message: 'Matéria-prima não encontrada.'
        });
      }

      const success = await MateriaPrimaRepository.update(id, materiaPrima);

      if (success) {
        const updated = await MateriaPrimaRepository.findById(id);
        res.json({
          success: true,
          data: updated.toJSON(),
          message: 'Matéria-prima atualizada com sucesso.'
        });
      } else {
        res.status(500).json({ success: false, message: 'Erro ao atualizar matéria-prima.' });
      }

    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      const exists = await MateriaPrimaRepository.findById(id);
      if (!exists) {
        return res.status(404).json({ success: false, message: 'Matéria-prima não encontrada.' });
      }

      const success = await MateriaPrimaRepository.delete(id);

      if (success) {
        res.json({
          success: true,
          message: 'Matéria-prima excluída com sucesso.'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erro ao excluir matéria-prima.'
        });
      }

    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new MateriaPrimaController();

