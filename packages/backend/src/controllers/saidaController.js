
const SaidaRepository = require('../repository/saidaRepository');
const Saida = require('../models/saida');
const AssistidaRepository = require('../repository/assistidasRepository');

class SaidaController {
  // 🔹 Lista todas as saídas
  async getAll(req, res) {
    try {
      const { assistidaId } = req.query;
      let saidas;

      if (assistidaId) {
        saidas = await SaidaRepository.findByAssistidaId(assistidaId);
      } else {
        saidas = await SaidaRepository.findAll();
      }

      res.json({
        success: true,
        data: saidas.map(s => s.toJSON()),
        total: saidas.length
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }


  // 🔹 Busca saída por ID
async getById(req, res) {
  try {
    const { id } = req.params;
    const saidas = await SaidaRepository.findByAssistidaId(id); // retorna array

    res.json({
      success: true,
      data: saidas.map(s => s.toJSON()), // mapeia cada saída para JSON
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar saídas da assistida',
    });
  }
}


  // 🔹 Cria uma nova saída
  async create(req, res) {
    try {
      const saida = new Saida(req.body);
      const errors = saida.validate();

      if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
      }

      const novaSaida = await SaidaRepository.create(saida);

      // Atualiza status da assistida para "Inativa"
      // await AssistidaRepository.updateStatus(saida.assistidaId, 'Inativa');

      res.status(201).json({
        success: true,
        data: novaSaida.toJSON(),
        message: 'Saída registrada com sucesso.'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // 🔹 Atualiza uma saída existente
  async update(req, res) {
    try {
      const { id } = req.params;
      const saida = new Saida({ ...req.body, id });

      const errors = saida.validate();
      if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
      }

      const exists = await SaidaRepository.findById(id);
      if (!exists) {
        return res.status(404).json({ success: false, message: 'Saída não encontrada.' });
      }

      const success = await SaidaRepository.update(id, saida);

      if (success) {
        res.json({
          success: true,
          data: saida.toJSON(),
          message: 'Saída atualizada com sucesso.'
        });
      } else {
        res.status(500).json({ success: false, message: 'Erro ao atualizar saída.' });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 🔹 Exclui uma saída
  async delete(req, res) {
    try {
      const { id } = req.params;
      const exists = await SaidaRepository.findById(id);

      if (!exists) {
        return res.status(404).json({ success: false, message: 'Saída não encontrada.' });
      }

      const success = await SaidaRepository.delete(id);

      if (success) {
        res.json({
          success: true,
          message: 'Saída deletada com sucesso.'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erro ao deletar saída.'
        });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new SaidaController();
