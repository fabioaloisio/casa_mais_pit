const DespesaRepository = require('../repository/despesaRepository');
const Despesa = require('../models/despesa');

class DespesaController {
  async getAll(req, res) {
    try {
      const { categoria, status, forma_pagamento, dataInicio, dataFim, search } = req.query;
      const filters = {};

      if (categoria) filters.categoria = categoria;
      if (status) filters.status = status;
      if (forma_pagamento) filters.forma_pagamento = forma_pagamento;
      if (dataInicio) filters.dataInicio = dataInicio;
      if (dataFim) filters.dataFim = dataFim;
      if (search) filters.search = search;

      const despesas = await DespesaRepository.findAll(filters);

      res.json({
        success: true,
        data: despesas.map(despesa => despesa.toJSON()),
        total: despesas.length
      });

    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar despesas: ' + error.message 
      });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const despesa = await DespesaRepository.findById(id);

      if (!despesa) {
        return res.status(404).json({
          success: false,
          message: 'Despesa não encontrada.'
        });
      }

      res.json({
        success: true,
        data: despesa.toJSON()
      });

    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar despesa: ' + error.message 
      });
    }
  }

  async create(req, res) {
    try {
      const despesa = new Despesa(req.body);
      const errors = despesa.validate();

      if (errors.length > 0) {
        return res.status(400).json({ 
          success: false, 
          errors 
        });
      }

      // Verificar se já existe despesa similar (opcional - pode ser removido se não desejado)
      // const exists = await DespesaRepository.existsByDescricaoEData(
      //   despesa.descricao, 
      //   despesa.getDataDespesaParaMySQL()
      // );
      // if (exists) {
      //   return res.status(409).json({
      //     success: false,
      //     message: 'Já existe uma despesa com a mesma descrição nesta data.'
      //   });
      // }

      const novaDespesa = await DespesaRepository.create(despesa);

      res.status(201).json({
        success: true,
        data: novaDespesa.toJSON(),
        message: 'Despesa cadastrada com sucesso.'
      });

    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao criar despesa: ' + error.message 
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const despesa = new Despesa({ ...req.body, id });

      const errors = despesa.validate(true);
      if (errors.length > 0) {
        return res.status(400).json({ 
          success: false, 
          errors 
        });
      }

      const exists = await DespesaRepository.findById(id);
      if (!exists) {
        return res.status(404).json({
          success: false,
          message: 'Despesa não encontrada.'
        });
      }

      const success = await DespesaRepository.update(id, despesa);

      if (success) {
        const despesaAtualizada = await DespesaRepository.findById(id);
        res.json({
          success: true,
          data: despesaAtualizada.toJSON(),
          message: 'Despesa atualizada com sucesso.'
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: 'Erro ao atualizar despesa.' 
        });
      }

    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao atualizar despesa: ' + error.message 
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      const exists = await DespesaRepository.findById(id);
      if (!exists) {
        return res.status(404).json({ 
          success: false, 
          message: 'Despesa não encontrada.' 
        });
      }

      const success = await DespesaRepository.delete(id);

      if (success) {
        res.json({
          success: true,
          message: 'Despesa excluída com sucesso.'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erro ao excluir despesa.'
        });
      }

    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao excluir despesa: ' + error.message 
      });
    }
  }

  // Endpoint para estatísticas
  async getEstatisticas(req, res) {
    try {
      const { dataInicio, dataFim } = req.query;
      const filters = {};

      if (dataInicio) filters.dataInicio = dataInicio;
      if (dataFim) filters.dataFim = dataFim;

      const estatisticas = await DespesaRepository.getEstatisticas(filters);

      res.json({
        success: true,
        data: estatisticas
      });

    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar estatísticas: ' + error.message 
      });
    }
  }

  // Buscar despesas por categoria
  async getByCategoria(req, res) {
    try {
      const { categoria } = req.params;
      const despesas = await DespesaRepository.findByCategoria(categoria);

      res.json({
        success: true,
        data: despesas.map(despesa => despesa.toJSON()),
        total: despesas.length
      });

    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar despesas por categoria: ' + error.message 
      });
    }
  }

  // Buscar despesas por período
  async getByPeriodo(req, res) {
    try {
      const { dataInicio, dataFim } = req.params;
      const despesas = await DespesaRepository.findByPeriodo(dataInicio, dataFim);

      res.json({
        success: true,
        data: despesas.map(despesa => despesa.toJSON()),
        total: despesas.length
      });

    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar despesas por período: ' + error.message 
      });
    }
  }

  // Buscar despesas por status
  async getByStatus(req, res) {
    try {
      const { status } = req.params;
      const despesas = await DespesaRepository.findByStatus(status);

      res.json({
        success: true,
        data: despesas.map(despesa => despesa.toJSON()),
        total: despesas.length
      });

    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar despesas por status: ' + error.message 
      });
    }
  }
}

module.exports = new DespesaController();