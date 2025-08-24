const UnidadeMedidaRepository = require('../repository/unidadeMedidaRepository');
const UnidadeMedida = require('../models/unidadeMedida');

class UnidadeMedidaController {
  
  async getAll(req, res) {
    try {
      const { nome } = req.query;
      let unidadesMedida;

      if (nome) {
        unidadesMedida = await UnidadeMedidaRepository.findByNome(nome);
      } else {
        unidadesMedida = await UnidadeMedidaRepository.findAll();
      }

      res.json({
        success: true,
        data: unidadesMedida.map(um => um.toJSON()),
        total: unidadesMedida.length
      });

    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const unidadeMedida = await UnidadeMedidaRepository.findById(id);

      if (!unidadeMedida) {
        return res.status(404).json({
          success: false,
          message: 'Unidade de medida não encontrada.'
        });
      }

      res.json({
        success: true,
        data: unidadeMedida.toJSON(),
      });

    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req, res) {
    try {
      const unidadeMedida = new UnidadeMedida(req.body);
      const errors = unidadeMedida.validate();

      if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
      }

      const novaUnidadeMedida = await UnidadeMedidaRepository.create(unidadeMedida);

      res.status(201).json({
        success: true,
        data: novaUnidadeMedida.toJSON(),
        message: 'Unidade de medida cadastrada com sucesso.'
      });

    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const unidadeMedida = new UnidadeMedida({ ...req.body, id });

      const errors = unidadeMedida.validate();
      if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
      }

      const exists = await UnidadeMedidaRepository.findById(id);
      if (!exists) {
        return res.status(404).json({
          success: false,
          message: 'Unidade de medida não encontrada.'
        });
      }

      const success = await UnidadeMedidaRepository.update(id, unidadeMedida);

      if (success) {
        res.json({
          success: true,
          data: unidadeMedida.toJSON(),
          message: 'Unidade de medida atualizada com sucesso.'
        });
      } else {
        res.status(500).json({ success: false, message: 'Erro ao atualizar unidade de medida.' });
      }

    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      const exists = await UnidadeMedidaRepository.findById(id);
      if (!exists) {
        return res.status(404).json({ success: false, message: 'Unidade de medida não encontrada.' });
      }

      const success = await UnidadeMedidaRepository.delete(id);

      if (success) {
        res.json({
          success: true,
          message: 'Unidade de medida deletada com sucesso.'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erro ao deletar unidade de medida.'
        });
      }

    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new UnidadeMedidaController();