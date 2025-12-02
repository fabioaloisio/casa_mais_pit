const CaixaRepository = require('../repository/caixaRepository');

const caixaRepository = new CaixaRepository();

// RF_F4 - Lançar Doação Monetária
const lancarDoacaoMonetaria = async (req, res) => {
  try {
    const { 
      doador_id, 
      valor, 
      descricao, 
      forma_pagamento,
      numero_recibo 
    } = req.body;
    
    // Validação dos campos obrigatórios
    if (!valor || valor <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valor da doação é obrigatório e deve ser positivo',
        errors: ['Campo valor inválido']
      });
    }

    const movimentacao = await caixaRepository.lancarDoacaoMonetaria({
      doador_id,
      valor,
      descricao,
      forma_pagamento,
      numero_recibo,
      usuario_id: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Doação monetária lançada com sucesso',
      data: movimentacao
    });
  } catch (error) {
    console.error('Erro ao lançar doação monetária:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao lançar doação monetária',
      errors: [error.message]
    });
  }
};

// RF_F5 - Atualizar Caixa (lançar despesa ou ajuste)
const atualizarCaixa = async (req, res) => {
  try {
    const { 
      tipo_movimentacao, // 'despesa' ou 'ajuste'
      valor, 
      descricao,
      categoria,
      despesa_id 
    } = req.body;
    
    // Validação dos campos obrigatórios
    if (!tipo_movimentacao || !valor) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de movimentação e valor são obrigatórios',
        errors: ['Campos obrigatórios não fornecidos']
      });
    }

    if (!['despesa', 'ajuste'].includes(tipo_movimentacao)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de movimentação inválido',
        errors: ['Use "despesa" ou "ajuste"']
      });
    }

    const movimentacao = await caixaRepository.atualizarCaixa({
      tipo_movimentacao,
      valor,
      descricao,
      categoria,
      despesa_id,
      usuario_id: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Caixa atualizado com sucesso',
      data: movimentacao
    });
  } catch (error) {
    console.error('Erro ao atualizar caixa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar caixa',
      errors: [error.message]
    });
  }
};

// Obter saldo atual do caixa
const obterSaldo = async (req, res) => {
  try {
    const saldo = await caixaRepository.getSaldoAtual();
    
    res.status(200).json({
      success: true,
      message: 'Saldo obtido com sucesso',
      data: saldo
    });
  } catch (error) {
    console.error('Erro ao obter saldo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter saldo do caixa',
      errors: [error.message]
    });
  }
};

// Listar movimentações do caixa
const listarMovimentacoes = async (req, res) => {
  try {
    const { data_inicio, data_fim, tipo, limite } = req.query;
    
    const movimentacoes = await caixaRepository.getMovimentacoes({
      data_inicio,
      data_fim,
      tipo,
      limite: limite || 100
    });
    
    res.status(200).json({
      success: true,
      message: 'Movimentações listadas com sucesso',
      data: movimentacoes
    });
  } catch (error) {
    console.error('Erro ao listar movimentações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar movimentações',
      errors: [error.message]
    });
  }
};

// Listar movimentações recentes do caixa
const listarMovimentacoesRecentes = async (req, res) => {
  try {
    const { limit } = req.query;
    
    const movimentacoes = await caixaRepository.getMovimentacoesRecentes({
      limite: parseInt(limit) || 10
    });
    
    res.status(200).json({
      success: true,
      message: 'Movimentações recentes listadas com sucesso',
      data: movimentacoes
    });
  } catch (error) {
    console.error('Erro ao listar movimentações recentes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar movimentações recentes',
      errors: [error.message]
    });
  }
};

// Obter extrato do caixa por período
const obterExtrato = async (req, res) => {
  try {
    const { data_inicio, data_fim } = req.query;
    
    if (!data_inicio || !data_fim) {
      return res.status(400).json({
        success: false,
        message: 'Período é obrigatório',
        errors: ['Informe data_inicio e data_fim']
      });
    }

    const extrato = await caixaRepository.getExtrato(data_inicio, data_fim);
    
    res.status(200).json({
      success: true,
      message: 'Extrato gerado com sucesso',
      data: extrato
    });
  } catch (error) {
    console.error('Erro ao gerar extrato:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar extrato',
      errors: [error.message]
    });
  }
};

// Fechar caixa do dia
const fecharCaixa = async (req, res) => {
  try {
    const { observacoes } = req.body;
    
    const fechamento = await caixaRepository.fecharCaixaDia({
      usuario_id: req.user.id,
      observacoes
    });
    
    res.status(200).json({
      success: true,
      message: 'Caixa fechado com sucesso',
      data: fechamento
    });
  } catch (error) {
    console.error('Erro ao fechar caixa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao fechar caixa',
      errors: [error.message]
    });
  }
};

// Obter estatísticas do caixa
const obterEstatisticas = async (req, res) => {
  try {
    const estatisticas = await caixaRepository.getEstatisticas();
    
    res.status(200).json({
      success: true,
      message: 'Estatísticas obtidas com sucesso',
      data: estatisticas
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter estatísticas do caixa',
      errors: [error.message]
    });
  }
};

module.exports = {
  lancarDoacaoMonetaria,
  atualizarCaixa,
  obterSaldo,
  listarMovimentacoes,
  listarMovimentacoesRecentes,
  obterExtrato,
  fecharCaixa,
  obterEstatisticas
};