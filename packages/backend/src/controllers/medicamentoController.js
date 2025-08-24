// Aldruin Bonfim de Lima Souza - RA 10482416915
const MedicamentoRepository = require('../repository/medicamentoRepository');
const Medicamento = require('../models/medicamento');

class MedicamentoController {
  async getAll(req, res) {
    try {
      const { forma_farmaceutica, nome } = req.query;
      let medicamentos;

      if (forma_farmaceutica) {
        medicamentos = await MedicamentoRepository.findByFormaFarmaceutica(forma_farmaceutica);
      } else if (nome) {
        medicamentos = await MedicamentoRepository.findByNome(nome);
      } else {
        medicamentos = await MedicamentoRepository.findAll();
      }

      res.json({
        success: true,
        data: medicamentos.map(med => med.toJSON()),
        total: medicamentos.length
      });

    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const medicamento = await MedicamentoRepository.findById(id);

      if (!medicamento) {
        return res.status(404).json({
          success: false,
          message: 'Medicamento não encontrado.'
        });
      }

      res.json({
        success: true,
        data: medicamento.toJSON(),
      });

    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req, res) {
    try {
      const medicamento = new Medicamento(req.body);
      const errors = medicamento.validate();

      if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
      }

      const novoMedicamento = await MedicamentoRepository.create(medicamento);

      res.status(201).json({
        success: true,
        data: novoMedicamento.toJSON(),
        message: 'Medicamento cadastrado com sucesso.'
      });

    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const medicamento = new Medicamento({ ...req.body, id });

      const errors = medicamento.validate();
      if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
      }

      const exists = await MedicamentoRepository.findById(id);
      if (!exists) {
        return res.status(404).json({
          success: false,
          message: 'Medicamento não encontrado.'
        });
      }

      const success = await MedicamentoRepository.update(id, medicamento);

      if (success) {
        res.json({
          success: true,
          data: medicamento.toJSON(),
          message: 'Medicamento atualizado com sucesso.'
        });
      } else {
        res.status(500).json({ success: false, message: 'Erro ao atualizar medicamento.' });
      }

    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      const exists = await MedicamentoRepository.findById(id);
      if (!exists) {
        return res.status(404).json({ success: false, message: 'Medicamento não encontrado.' });
      }

      const success = await MedicamentoRepository.delete(id);

      if (success) {
        res.json({
          success: true,
          message: 'Medicamento deletado com sucesso.'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erro ao deletar medicamento.'
        });
      }

    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new MedicamentoController();