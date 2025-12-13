const { HPR } = require('../models/HPR');
const hprRepository = require('../repository/hprRepository');

class HPRController {
  async getAll(req, res) {
    try {
      let hprs = await hprRepository.findAll();

      res.json({
        success: true,
        data: hprs.map(h => h.toJSON()),
        total: hprs.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async create(req, res) {
    try {
      const hpr = new HPR(req.body);

      const errors = hpr.validate();

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors
        });
      }

      // Pega o userId do token decodificado
      const userId = req.user.id; // assumindo que você tem um middleware de auth que coloca o user em req.user
      const newHPR = await hprRepository.create(hpr, userId);
      console.log(newHPR)

      res.status(201).json({
        success: true,
        data: newHPR[newHPR.length - 1].toJSON(),
        message: 'HPR cadastrada com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const existingHPR = await hprRepository.findHprById(id);
      if (!existingHPR || existingHPR.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'HPR não encontrada'
        });
      }

      const hpr = new HPR({ ...req.body, id: Number(id) });

      const errors = hpr.validate();
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors
        });
      }

      const updatedHPR = await hprRepository.update(hpr.id, hpr, 1);

      res.json({
        success: true,
        data: updatedHPR.toJSON()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const existingHPR = await hprRepository.findHprById(id);

      if (!existingHPR || existingHPR.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'HPR não encontrada'
        });
      }

      // const userId = req.user.id;
      const deleted = await hprRepository.delete(id, 1);

      res.json(deleted);

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const hprList = await hprRepository.findByAssistidaId(id);

      if (!hprList) {
        return res.status(404).json({
          success: false,
          message: 'HPR não encontrada'
        });
      }

      const data = hprList.map(hpr => hpr.toJSON());
      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new HPRController();
