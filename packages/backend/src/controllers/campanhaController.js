const campanhaRepository = require('../repository/campanhaRepository');
const doadorRepository = require('../repository/doadorRepository');

class CampanhaController {
  // ================ CAMPANHAS ================

  async criarCampanha(req, res) {
    try {
      const { nome, descricao, meta_valor, data_inicio, data_fim, tipo, imagem_url } = req.body;

      // Validações básicas
      if (!nome || !data_inicio) {
        return res.status(400).json({
          success: false,
          message: 'Nome e data de início são obrigatórios'
        });
      }

      // Validar datas
      if (data_fim && new Date(data_fim) < new Date(data_inicio)) {
        return res.status(400).json({
          success: false,
          message: 'Data de fim não pode ser anterior à data de início'
        });
      }

      const dadosCampanha = {
        nome,
        descricao,
        meta_valor: meta_valor || null,
        data_inicio,
        data_fim: data_fim || null,
        tipo: tipo || null,
        imagem_url: imagem_url || null,
        criado_por: req.user.id
      };

      const campanhaId = await campanhaRepository.criarCampanha(dadosCampanha);
      const campanha = await campanhaRepository.obterCampanhaPorId(campanhaId);

      console.log(`[${new Date().toISOString()}] Campanha criada: ${campanhaId} por usuário ${req.user.id}`);

      res.status(201).json({
        success: true,
        message: 'Campanha criada com sucesso',
        data: campanha
      });
    } catch (error) {
      console.error('Erro ao criar campanha:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao criar campanha',
        error: error.message
      });
    }
  }

  async listarCampanhas(req, res) {
    try {
      const { status, tipo, ativas } = req.query;

      const filtros = {};
      if (status) filtros.status = status;
      if (tipo) filtros.tipo = tipo;
      if (ativas === 'true') filtros.ativas = true;

      const campanhas = await campanhaRepository.listarCampanhas(filtros);

      res.json({
        success: true,
        data: campanhas,
        total: campanhas.length
      });
    } catch (error) {
      console.error('Erro ao listar campanhas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao listar campanhas',
        error: error.message
      });
    }
  }

  async obterCampanha(req, res) {
    try {
      const { id } = req.params;

      const campanha = await campanhaRepository.obterCampanhaPorId(id);

      if (!campanha) {
        return res.status(404).json({
          success: false,
          message: 'Campanha não encontrada'
        });
      }

      res.json({
        success: true,
        data: campanha
      });
    } catch (error) {
      console.error('Erro ao obter campanha:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao obter campanha',
        error: error.message
      });
    }
  }

  async atualizarCampanha(req, res) {
    try {
      const { id } = req.params;
      const dados = req.body;

      // Validar se campanha existe
      const campanhaExistente = await campanhaRepository.obterCampanhaPorId(id);
      if (!campanhaExistente) {
        return res.status(404).json({
          success: false,
          message: 'Campanha não encontrada'
        });
      }

      // Validar datas se fornecidas
      if (dados.data_fim && dados.data_inicio) {
        if (new Date(dados.data_fim) < new Date(dados.data_inicio)) {
          return res.status(400).json({
            success: false,
            message: 'Data de fim não pode ser anterior à data de início'
          });
        }
      }

      const atualizada = await campanhaRepository.atualizarCampanha(id, dados);

      if (!atualizada) {
        return res.status(400).json({
          success: false,
          message: 'Nenhum campo para atualizar'
        });
      }

      const campanhaAtualizada = await campanhaRepository.obterCampanhaPorId(id);

      console.log(`Campanha ${id} atualizada por usuário ${req.user.id}`);

      res.json({
        success: true,
        message: 'Campanha atualizada com sucesso',
        data: campanhaAtualizada
      });
    } catch (error) {
      console.error('Erro ao atualizar campanha:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar campanha',
        error: error.message
      });
    }
  }

  // ================ DOADORES_CAMPANHAS (N:N) ================

  async associarDoador(req, res) {
    try {
      const { id: campanhaId } = req.params;
      const { doador_id, valor_doado, forma_pagamento, recibo_numero, anonimo, mensagem } = req.body;

      // Validações
      if (!doador_id || !valor_doado) {
        return res.status(400).json({
          success: false,
          message: 'Doador e valor são obrigatórios'
        });
      }

      if (valor_doado <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Valor deve ser maior que zero'
        });
      }

      // Verificar se campanha existe
      const campanhaExistente = await campanhaRepository.obterCampanhaPorId(campanhaId);
      if (!campanhaExistente) {
        return res.status(404).json({
          success: false,
          message: 'Campanha não encontrada'
        });
      }

      // Se a campanha está planejada, ativá-la automaticamente
      if (campanhaExistente.status === 'planejada') {
        console.log(`Ativando campanha planejada ${campanhaId} devido a primeira doação`);
        await campanhaRepository.atualizarCampanha(campanhaId, {
          status: 'ativa',
          data_inicio: new Date().toISOString().split('T')[0] // Atualiza data de início para hoje
        });
      } else if (campanhaExistente.status !== 'ativa') {
        // Campanha encerrada ou cancelada
        return res.status(400).json({
          success: false,
          message: `Não é possível doar para campanha ${campanhaExistente.status}`
        });
      }

      // Verificar se doador existe
      const doador = await doadorRepository.findById(doador_id);
      if (!doador) {
        return res.status(404).json({
          success: false,
          message: 'Doador não encontrado'
        });
      }

      // Registrar a contribuição
      const dados = {
        doador_id,
        campanha_id: campanhaId,
        valor_doado,
        forma_pagamento: forma_pagamento || 'Não informado',
        recibo_numero,
        anonimo: anonimo || false,
        mensagem,
        usuario_registro_id: req.user.id
      };

      const contribuicaoId = await campanhaRepository.associarDoadorCampanha(dados);

      console.log(`Doação registrada: Doador ${doador_id} -> Campanha ${campanhaId}, Valor: ${valor_doado}`);

      // Obter dados atualizados da campanha
      const campanhaAtualizada = await campanhaRepository.obterCampanhaPorId(campanhaId);

      res.status(201).json({
        success: true,
        message: 'Doação registrada com sucesso',
        data: {
          contribuicao_id: contribuicaoId,
          campanha: campanhaAtualizada
        }
      });
    } catch (error) {
      console.error('Erro ao associar doador:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao registrar doação',
        error: error.message
      });
    }
  }

  async listarDoadoresCampanha(req, res) {
    try {
      const { id } = req.params;

      const doadores = await campanhaRepository.listarDoadoresCampanha(id);

      res.json({
        success: true,
        data: doadores,
        total: doadores.length
      });
    } catch (error) {
      console.error('Erro ao listar doadores da campanha:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao listar doadores',
        error: error.message
      });
    }
  }

  async listarCampanhasDoador(req, res) {
    try {
      const { doadorId } = req.params;

      const campanhas = await campanhaRepository.listarCampanhasDoador(doadorId);

      res.json({
        success: true,
        data: campanhas,
        total: campanhas.length
      });
    } catch (error) {
      console.error('Erro ao listar campanhas do doador:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao listar campanhas do doador',
        error: error.message
      });
    }
  }

  // ================ RELATÓRIOS ================

  async obterEstatisticas(req, res) {
    try {
      const { id } = req.params;

      const estatisticas = await campanhaRepository.obterEstatisticasCampanha(id);

      res.json({
        success: true,
        data: estatisticas
      });
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao obter estatísticas',
        error: error.message
      });
    }
  }

  async obterRanking(req, res) {
    try {
      const { limit = 10 } = req.query;

      const ranking = await campanhaRepository.obterRankingCampanhas(parseInt(limit));

      res.json({
        success: true,
        data: ranking
      });
    } catch (error) {
      console.error('Erro ao obter ranking:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao obter ranking',
        error: error.message
      });
    }
  }

  // ================ CONTROLE DE STATUS ================

  async encerrarCampanha(req, res) {
    try {
      const { id } = req.params;
      const { motivo } = req.body;
      const campanhaStatusService = require('../services/campanhaStatusService');

      const resultado = await campanhaStatusService.encerrarCampanhaManualmente(id, motivo);

      if (!resultado) {
        return res.status(400).json({
          success: false,
          message: 'Não foi possível encerrar a campanha. Verifique se ela está ativa ou planejada.'
        });
      }

      res.json({
        success: true,
        message: 'Campanha encerrada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao encerrar campanha:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao encerrar campanha',
        error: error.message
      });
    }
  }

  async cancelarCampanha(req, res) {
    try {
      const { id } = req.params;
      const { motivo } = req.body;
      const campanhaStatusService = require('../services/campanhaStatusService');

      const resultado = await campanhaStatusService.cancelarCampanha(id, motivo);

      if (!resultado) {
        return res.status(400).json({
          success: false,
          message: 'Não foi possível cancelar a campanha. Verifique se ela está ativa ou planejada.'
        });
      }

      res.json({
        success: true,
        message: 'Campanha cancelada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao cancelar campanha:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao cancelar campanha',
        error: error.message
      });
    }
  }

  async reativarCampanha(req, res) {
    try {
      const { id } = req.params;
      const campanhaStatusService = require('../services/campanhaStatusService');

      const resultado = await campanhaStatusService.reativarCampanha(id);

      if (!resultado) {
        return res.status(400).json({
          success: false,
          message: 'Não foi possível reativar a campanha.'
        });
      }

      res.json({
        success: true,
        message: 'Campanha reativada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao reativar campanha:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao reativar campanha',
        error: error.message
      });
    }
  }
}

module.exports = new CampanhaController();