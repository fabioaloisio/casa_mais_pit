const consultaRepository = require('../repository/consultaRepository');

const criar = async (req, res) => {
  try {
    const {
      assistida_id,
      data_consulta,
      medico_id,
      tipo_consulta,
      observacoes
    } = req.body;

    if (!assistida_id || !data_consulta || !medico_id) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios não fornecidos',
        errors: ['assistida_id, data_consulta e medico_id são obrigatórios']
      });
    }

    const consulta = await consultaRepository.criar({
      assistida_id,
      data_consulta,
      medico_id,
      tipo_consulta,
      observacoes,
      usuario_id: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Consulta agendada com sucesso',
      data: consulta
    });
  } catch (error) {
    console.error('Erro ao criar consulta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar consulta',
      errors: [error.message]
    });
  }
};

const lancarPrescricao = async (req, res) => {
  try {
    const { id } = req.params;
    const { prescricao, medicamentos } = req.body;

    if (!prescricao) {
      return res.status(400).json({
        success: false,
        message: 'Prescrição é obrigatória',
        errors: ['Campo prescricao não pode estar vazio']
      });
    }

    const consulta = await consultaRepository.lancarPrescricao({
      id,
      prescricao,
      medicamentos,
      usuario_id: req.user.id
    });

    res.status(200).json({
      success: true,
      message: 'Prescrição lançada com sucesso',
      data: consulta
    });
  } catch (error) {
    console.error('Erro ao lançar prescrição:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao lançar prescrição',
      errors: [error.message]
    });
  }
};

const lancarHistoriaPatologica = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      historia_patologica,
      alergias,
      condicoes_cronicas,
      cirurgias_previas,
      medicamentos_uso_continuo
    } = req.body;

    if (!historia_patologica) {
      return res.status(400).json({
        success: false,
        message: 'História patológica é obrigatória',
        errors: ['Campo historia_patologica não pode estar vazio']
      });
    }

    const consulta = await consultaRepository.lancarHistoriaPatologica({
      id,
      historia_patologica,
      alergias,
      condicoes_cronicas,
      cirurgias_previas,
      medicamentos_uso_continuo,
      usuario_id: req.user.id
    });

    res.status(200).json({
      success: true,
      message: 'História patológica lançada com sucesso',
      data: consulta
    });
  } catch (error) {
    console.error('Erro ao lançar história patológica:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao lançar história patológica',
      errors: [error.message]
    });
  }
};

const registrarPosConsulta = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      evolucao,
      encaminhamentos,
      retorno_agendado,
      observacoes_pos_consulta
    } = req.body;

    if (!evolucao) {
      return res.status(400).json({
        success: false,
        message: 'Evolução é obrigatória',
        errors: ['Campo evolucao não pode estar vazio']
      });
    }

    const consulta = await consultaRepository.registrarPosConsulta({
      id,
      evolucao,
      encaminhamentos,
      retorno_agendado,
      observacoes_pos_consulta,
      usuario_id: req.user.id
    });

    res.status(200).json({
      success: true,
      message: 'Dados pós-consulta registrados com sucesso',
      data: consulta
    });
  } catch (error) {
    console.error('Erro ao registrar dados pós-consulta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao registrar dados pós-consulta',
      errors: [error.message]
    });
  }
};

const listar = async (req, res) => {
  try {
    const { assistida_id, data_inicio, data_fim, status } = req.query;

    const consultas = await consultaRepository.listar({
      assistida_id,
      data_inicio,
      data_fim,
      status
    });

    res.status(200).json({
      success: true,
      message: 'Consultas listadas com sucesso',
      data: consultas
    });
  } catch (error) {
    console.error('Erro ao listar consultas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar consultas',
      errors: [error.message]
    });
  }
};

const buscarPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const consulta = await consultaRepository.buscarPorId(id);

    if (!consulta) {
      return res.status(404).json({
        success: false,
        message: 'Consulta não encontrada',
        errors: ['ID inválido ou consulta não existe']
      });
    }

    res.status(200).json({
      success: true,
      message: 'Consulta obtida com sucesso',
      data: consulta
    });
  } catch (error) {
    console.error('Erro ao buscar consulta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar consulta',
      errors: [error.message]
    });
  }
};

const atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const dados = req.body;

    const consulta = await consultaRepository.atualizar(id, dados);

    res.status(200).json({
      success: true,
      message: 'Consulta atualizada com sucesso',
      data: consulta
    });
  } catch (error) {
    console.error('Erro ao atualizar consulta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar consulta',
      errors: [error.message]
    });
  }
};

const cancelar = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo_cancelamento } = req.body;

    const consulta = await consultaRepository.cancelar({
      id,
      motivo_cancelamento,
      usuario_id: req.user.id
    });

    res.status(200).json({
      success: true,
      message: 'Consulta cancelada com sucesso',
      data: consulta
    });
  } catch (error) {
    console.error('Erro ao cancelar consulta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao cancelar consulta',
      errors: [error.message]
    });
  }
};

const estatisticas = async (req, res) => {
  try {
    const stats = await consultaRepository.getEstatisticas();

    res.status(200).json({
      success: true,
      message: 'Estatísticas obtidas com sucesso',
      data: stats
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas de consultas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas de consultas',
      errors: [error.message]
    });
  }
};

module.exports = {
  criar,
  lancarPrescricao,
  lancarHistoriaPatologica,
  registrarPosConsulta,
  listar,
  buscarPorId,
  atualizar,
  cancelar,
  estatisticas
};
