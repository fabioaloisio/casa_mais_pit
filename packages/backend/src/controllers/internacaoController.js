const InternacaoRepository = require('../repository/internacaoRepository');

const internacaoRepository = new InternacaoRepository();

// RF_F1 - Efetuar Entrada na Instituição
const efetuarEntrada = async (req, res) => {
  try {
    const { assistida_id, motivo, observacoes, modo_retorno } = req.body;

    if (!assistida_id) {
      return res.status(400).json({
        success: false,
        message: 'Assistida é obrigatória'
      });
    }

    // SE FOR RETORNO ➜ cria nova internação com modo_retorno = TRUE
    if (modo_retorno === true) {
      const nova = await internacaoRepository.criarRetorno({
        assistida_id,
        motivo,
        observacoes,
        usuario_id: req.user.id
      });

      return res.status(201).json({
        success: true,
        message: 'Retorno registrado com sucesso',
        data: nova
      });
    }

    // Entrada normal (sem retorno)
    const internacaoAtiva = await internacaoRepository.findAtivaByAssistida(assistida_id);
    if (internacaoAtiva) {
      return res.status(400).json({
        success: false,
        message: 'Assistida já possui internação ativa'
      });
    }

    const nova = await internacaoRepository.criarEntrada({
      assistida_id,
      motivo,
      observacoes,
      usuario_id: req.user.id
    });

    return res.status(201).json({
      success: true,
      message: 'Entrada efetuada com sucesso',
      data: nova
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
;

// RF_F2 - Efetuar Saída da Instituição
const efetuarSaida = async (req, res) => {
  try {
    const { assistida_id, motivo_saida, observacoes_saida } = req.body;

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
      assistida_id,
      motivo_saida,
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

const atualizarEntrada = async (req, res) => {
  try {
    const { id } = req.params;
    const { data_entrada, motivo, observacoes } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID da internação é obrigatório'
      });
    }

    const internacao = await internacaoRepository.updateEntrada(id, {
      data_entrada,
      motivo,
      observacoes,
      usuario_entrada_id: req.user.id
    });

    return res.status(200).json({
      success: true,
      message: 'Entrada atualizada com sucesso',
      data: internacao
    });

  } catch (error) {
    console.error('Erro ao atualizar entrada:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao atualizar entrada da internação',
      errors: [error.message]
    });
  }
};


const atualizarSaida = async (req, res) => {
  try {
    const { id } = req.params;
    const { data_saida, motivo_saida, observacoes_saida } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID da internação é obrigatório'
      });
    }

    const internacao = await internacaoRepository.updateSaida(id, {
      data_saida,
      motivo_saida,
      observacoes_saida,
      usuario_saida_id: req.user.id
    });

    return res.status(200).json({
      success: true,
      message: 'Saída atualizada com sucesso',
      data: internacao
    });

  } catch (error) {
    console.error('Erro ao atualizar saída:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao atualizar saída da internação',
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
  estatisticas,
  atualizarSaida,
  atualizarEntrada,
  // registrarRetorno
};
