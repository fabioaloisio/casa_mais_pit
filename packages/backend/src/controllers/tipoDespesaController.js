const TipoDespesaRepository = require('../repository/tipoDespesaRepository');
const DespesaRepository = require('../repository/despesaRepository');
const TipoDespesa = require('../models/tipoDespesa');

class TipoDespesaController {
  async getAll(req, res) {
    try {
      const { ativo, search } = req.query;
      const filters = {};

      if (ativo !== undefined) {
        filters.ativo = ativo === 'true';
      }

      if (search) {
        filters.search = search;
      }

      const tiposDespesas = await TipoDespesaRepository.findAll(filters);

      res.json({
        success: true,
        data: tiposDespesas.map(tipo => tipo.toJSON()),
        total: tiposDespesas.length
      });

    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar tipos de despesas: ' + error.message 
      });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const tipoDespesa = await TipoDespesaRepository.findById(id);

      if (!tipoDespesa) {
        return res.status(404).json({
          success: false,
          message: 'Tipo de despesa não encontrado.'
        });
      }

      res.json({
        success: true,
        data: tipoDespesa.toJSON()
      });

    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar tipo de despesa: ' + error.message 
      });
    }
  }

  async create(req, res) {
    try {
      const tipoDespesa = new TipoDespesa(req.body);
      const errors = tipoDespesa.validate();

      if (errors.length > 0) {
        return res.status(400).json({ 
          success: false, 
          errors 
        });
      }

      // Verificar se já existe tipo de despesa com o mesmo nome
      const exists = await TipoDespesaRepository.existsByNome(tipoDespesa.nome);
      if (exists) {
        return res.status(409).json({
          success: false,
          message: 'Já existe um tipo de despesa com este nome.'
        });
      }

      const novoTipoDespesa = await TipoDespesaRepository.create(tipoDespesa);

      res.status(201).json({
        success: true,
        data: novoTipoDespesa.toJSON(),
        message: 'Tipo de despesa cadastrado com sucesso.'
      });

    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao criar tipo de despesa: ' + error.message 
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const tipoDespesa = new TipoDespesa({ ...req.body, id });

      const errors = tipoDespesa.validate(true);
      if (errors.length > 0) {
        return res.status(400).json({ 
          success: false, 
          errors 
        });
      }

      const exists = await TipoDespesaRepository.findById(id);
      if (!exists) {
        return res.status(404).json({
          success: false,
          message: 'Tipo de despesa não encontrado.'
        });
      }

      // Verificar se o novo nome já existe (excluindo o próprio registro)
      if (tipoDespesa.nome && await TipoDespesaRepository.existsByNome(tipoDespesa.nome, id)) {
        return res.status(409).json({
          success: false,
          message: 'Já existe um tipo de despesa com este nome.'
        });
      }

      const success = await TipoDespesaRepository.update(id, tipoDespesa);

      if (success) {
        const tipoDespesaAtualizado = await TipoDespesaRepository.findById(id);
        res.json({
          success: true,
          data: tipoDespesaAtualizado.toJSON(),
          message: 'Tipo de despesa atualizado com sucesso.'
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: 'Erro ao atualizar tipo de despesa.' 
        });
      }

    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao atualizar tipo de despesa: ' + error.message 
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      const tipoDespesa = await TipoDespesaRepository.findById(id);
      if (!tipoDespesa) {
        return res.status(404).json({ 
          success: false, 
          message: 'Tipo de despesa não encontrado.' 
        });
      }

      // Verificar se existem despesas associadas a este tipo (usar FK)
      const temDespesasAssociadas = await DespesaRepository.existsByTipoDespesaId(id);
      if (temDespesasAssociadas) {
        return res.status(409).json({
          success: false,
          message: 'Não é possível excluir este tipo de despesa pois existem despesas associadas a ele. Exclua ou altere a categoria das despesas antes de excluir o tipo.'
        });
      }

      const success = await TipoDespesaRepository.delete(id);

      if (success) {
        res.json({
          success: true,
          message: 'Tipo de despesa excluído com sucesso.'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erro ao excluir tipo de despesa.'
        });
      }

    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao excluir tipo de despesa: ' + error.message 
      });
    }
  }
}

module.exports = new TipoDespesaController();