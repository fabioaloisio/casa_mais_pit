const InternacaoRepository = require('../repository/internacaoRepository');

const internacaoRepository = new InternacaoRepository();

// RF_F1 - Efetuar Entrada na Instituição
const efetuarEntrada = async (req, res) => {
  try {
    const { assistida_id, motivo, observacoes } = req.body;
    
    // Validação dos campos obrigatórios
    if (!assistida_id) {
      return res.status(400).json({
        success: false,
        message: 'Assistida é obrigatória',
        errors: ['Campo assistida_id não pode estar vazio']
      });
    }

    // Verificar se já existe internação ativa para esta assistida
    const internacaoAtiva = await internacaoRepository.findAtivaByAssistida(assistida_id);
    if (internacaoAtiva) {
      return res.status(400).json({
        success: false,
        message: 'Assistida já possui internação ativa',
        errors: ['É necessário efetuar saída antes de uma nova entrada']
      });
    }

    const internacao = await internacaoRepository.criarEntrada({
      assistida_id,
      motivo,
      observacoes,
      usuario_id: req.user.id // Registrar quem efetuou a entrada
    });

    res.status(201).json({
      success: true,
      message: 'Entrada efetuada com sucesso',
      data: internacao
    });
  } catch (error) {
    console.error('Erro ao efetuar entrada:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao efetuar entrada',
      errors: [error.message]
    });
  }
};

// RF_F2 - Efetuar Saída da Instituição
const efetuarSaida = async (req, res) => {
  try {
    const { assistida_id, observacoes_saida } = req.body;
    
    // Validação dos campos obrigatórios
    if (!assistida_id) {
      return res.status(400).json({
        success: false,
        message: 'Assistida é obrigatória',
        errors: ['Campo assistida_id não pode estar vazio']
      });
    }

    // Verificar se existe internação ativa para esta assistida
    const internacaoAtiva = await internacaoRepository.findAtivaByAssistida(assistida_id);
    if (!internacaoAtiva) {
      return res.status(400).json({
        success: false,
        message: 'Não existe internação ativa para esta assistida',
        errors: ['É necessário efetuar entrada antes da saída']
      });
    }

    const internacao = await internacaoRepository.efetuarSaida({
      id: internacaoAtiva.id,
      observacoes_saida,
      usuario_saida_id: req.user.id // Registrar quem efetuou a saída
    });

    res.status(200).json({
      success: true,
      message: 'Saída efetuada com sucesso',
      data: internacao
    });
  } catch (error) {
    console.error('Erro ao efetuar saída:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao efetuar saída',
      errors: [error.message]
    });
  }
};

// Listar todas as internações (ativas e finalizadas)
const listarTodas = async (req, res) => {
  try {
    const internacoes = await internacaoRepository.findAll();
    
    res.status(200).json({
      success: true,
      message: 'Internações listadas com sucesso',
      data: internacoes
    });
  } catch (error) {
    console.error('Erro ao listar internações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar internações',
      errors: [error.message]
    });
  }
};

// Listar internações ativas
const listarAtivas = async (req, res) => {
  try {
    const internacoes = await internacaoRepository.findAllAtivas();
    
    res.status(200).json({
      success: true,
      message: 'Internações ativas listadas com sucesso',
      data: internacoes
    });
  } catch (error) {
    console.error('Erro ao listar internações ativas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar internações ativas',
      errors: [error.message]
    });
  }
};

// Buscar histórico de internações por assistida
const buscarHistorico = async (req, res) => {
  try {
    const { assistidaId } = req.params;
    
    if (!assistidaId) {
      return res.status(400).json({
        success: false,
        message: 'ID da assistida é obrigatório',
        errors: ['Parâmetro assistidaId não fornecido']
      });
    }

    const historico = await internacaoRepository.findHistoricoByAssistida(assistidaId);
    
    res.status(200).json({
      success: true,
      message: 'Histórico de internações obtido com sucesso',
      data: historico
    });
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar histórico de internações',
      errors: [error.message]
    });
  }
};

// Buscar estatísticas de internações
const estatisticas = async (req, res) => {
  try {
    const stats = await internacaoRepository.getEstatisticas();
    
    res.status(200).json({
      success: true,
      message: 'Estatísticas obtidas com sucesso',
      data: stats
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas',
      errors: [error.message]
    });
  }
};

module.exports = {
  efetuarEntrada,
  efetuarSaida,
  listarTodas,
  listarAtivas,
  buscarHistorico,
  estatisticas
};