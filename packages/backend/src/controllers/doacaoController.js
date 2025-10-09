const doacaoRepository = require('../repository/doacaoRepository');
const doadorRepository = require('../repository/doadorRepository');
const Doacao = require('../models/doacao');
const Doador = require('../models/doador');

class DoacaoController {
  // Criar nova doação
  async criar(req, res) {
    console.log('========================================');
    console.log(`[${new Date().toISOString()}] DOAÇÃO - CADASTRO`);
    console.log('Dados recebidos:', JSON.stringify(req.body, null, 2));
    console.log('========================================');

    try {
      const { doadorId, dadosDoador, valor, dataDoacao, observacoes } = req.body;

      let doadorIdFinal = doadorId;

      // Se não foi fornecido doadorId, tentar encontrar ou criar doador
      if (!doadorIdFinal && dadosDoador) {
        console.log('Verificando se doador existe pelo documento:', dadosDoador.documento);
        // Verificar se doador já existe pelo documento
        const doadorExistente = await doadorRepository.findByDocumento(dadosDoador.documento);

        if (doadorExistente) {
          console.log('Doador já existe! ID:', doadorExistente.id, 'Nome:', doadorExistente.nome);
          doadorIdFinal = doadorExistente.id;
        } else {
          console.log('Doador não existe, criando novo...');
          // Criar novo doador
          const novoDoador = new Doador(
            null,
            dadosDoador.tipoDoador,
            dadosDoador.nomeDoador || dadosDoador.nome,
            dadosDoador.documento,
            dadosDoador.email,
            dadosDoador.telefone,
            dadosDoador.endereco,
            dadosDoador.cidade,
            dadosDoador.estado,
            dadosDoador.cep
          );

          doadorIdFinal = await doadorRepository.create(novoDoador);
          console.log('Novo doador criado com ID:', doadorIdFinal);
        }
      }

      const doacao = new Doacao({
        doadorId: doadorIdFinal,
        valor,
        dataDoacao,
        observacoes
      });

      console.log('Doador ID final:', doadorIdFinal);
      console.log('Valor da doação:', valor);
      console.log('Data da doação:', dataDoacao);

      // Validar dados
      const erros = doacao.validaDoacao();
      if (erros.length > 0) {
        console.log('ERRO: Validação falhou:', erros);
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: erros
        });
      }

      console.log('Validações: OK');

      // Criar doação
      const id = await doacaoRepository.criar(doacao);
      console.log('ID da doação gerado:', id);

      // Ativar o doador automaticamente ao receber uma doação
      const doador = await doadorRepository.findById(doadorIdFinal);
      if (doador && !doador.ativo) {
        console.log('Ativando doador automaticamente...');
        await doadorRepository.update(doadorIdFinal, { ativo: true });
        console.log('Doador ativado com sucesso!');
      }

      // Buscar doação criada
      const doacaoCriada = await doacaoRepository.buscarPorId(id);

      console.log('========================================');
      console.log('DOAÇÃO CADASTRADA COM SUCESSO!');
      console.log('ID:', id);
      console.log('Doador:', doacaoCriada.doador ? doacaoCriada.doador.nome : 'N/A');
      console.log('Valor: R$', valor);
      console.log('Status: SUCESSO');
      console.log('========================================\n');

      return res.status(201).json({
        success: true,
        message: 'Doação cadastrada com sucesso',
        data: doacaoCriada.toJSON()
      });
    } catch (error) {
      console.log('========================================');
      console.log('ERRO AO CADASTRAR DOAÇÃO:', error.message);
      console.log('Stack:', error.stack);
      console.log('========================================\n');
      console.error('Erro ao criar doação:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao cadastrar doação',
        error: error.message
      });
    }
  }

  // Listar todas as doações
  async listar(req, res) {
    console.log('========================================');
    console.log(`[${new Date().toISOString()}] DOAÇÃO - LISTAGEM`);

    // Mostrar apenas filtros que foram enviados
    const filtrosEnviados = Object.keys(req.query).length > 0 ? req.query : 'Nenhum filtro aplicado';
    console.log('Filtros recebidos:', filtrosEnviados);
    console.log('========================================');

    try {
      const filtros = {
        tipoDoador: req.query.tipoDoador,
        nomeDoador: req.query.nomeDoador,
        documento: req.query.documento,
        doadorId: req.query.doadorId,
        dataInicio: req.query.dataInicio,
        dataFim: req.query.dataFim
      };

      // Criar objeto apenas com filtros definidos para exibição
      const filtrosAplicados = {};
      Object.keys(filtros).forEach(key => {
        if (filtros[key] !== undefined && filtros[key] !== '') {
          filtrosAplicados[key] = filtros[key];
        }
      });

      if (Object.keys(filtrosAplicados).length > 0) {
        console.log('Filtros aplicados:', filtrosAplicados);
      } else {
        console.log('Buscando todas as doações (sem filtros)');
      }

      const doacoes = await doacaoRepository.buscarTodos(filtros);

      console.log('Total de doações encontradas:', doacoes.length);
      if (doacoes.length > 0) {
        console.log('Primeira doação:', {
          id: doacoes[0].id,
          doador: doacoes[0].doador?.nome,
          valor: doacoes[0].valor
        });
      }
      console.log('========================================\n');

      return res.json({
        success: true,
        data: doacoes.map(d => d.toJSON()),
        total: doacoes.length
      });
    } catch (error) {
      console.log('ERRO ao listar doações:', error.message);
      console.log('========================================\n');
      console.error('Erro ao listar doações:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao listar doações',
        error: error.message
      });
    }
  }

  // Buscar doação por ID
  async buscarPorId(req, res) {
    console.log('========================================');
    console.log(`[${new Date().toISOString()}] DOAÇÃO - CONSULTA POR ID`);
    console.log('ID solicitado:', req.params.id);
    console.log('========================================');

    try {
      const { id } = req.params;

      const doacao = await doacaoRepository.buscarPorId(id);

      if (!doacao) {
        console.log('Doação não encontrada!');
        console.log('========================================\n');
        return res.status(404).json({
          success: false,
          message: 'Doação não encontrada'
        });
      }

      console.log('Doação encontrada:');
      console.log('- ID:', doacao.id);
      console.log('- Doador:', doacao.doador?.nome || 'N/A');
      console.log('- Valor: R$', doacao.valor);
      console.log('- Data:', doacao.dataDoacao);
      console.log('========================================\n');

      return res.json({
        success: true,
        data: doacao.toJSON()
      });
    } catch (error) {
      console.log('ERRO ao buscar doação:', error.message);
      console.log('========================================\n');
      console.error('Erro ao buscar doação:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar doação',
        error: error.message
      });
    }
  }

  // Buscar doações por doador
  async buscarPorDoador(req, res) {
    try {
      const { doadorId } = req.params;
      
      if (!doadorId) {
        return res.status(400).json({
          success: false,
          message: 'ID do doador é obrigatório'
        });
      }
      
      const doacoes = await doacaoRepository.buscarPorDoador(doadorId);
      
      return res.json({
        success: true,
        data: doacoes.map(d => d.toJSON()),
        total: doacoes.length
      });
    } catch (error) {
      console.error('Erro ao buscar doações por doador:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar doações do doador',
        error: error.message
      });
    }
  }

  // Atualizar doação
  async atualizar(req, res) {
    console.log('========================================');
    console.log(`[${new Date().toISOString()}] DOAÇÃO - ATUALIZAÇÃO`);
    console.log('ID:', req.params.id);
    console.log('Dados para atualizar:', JSON.stringify(req.body, null, 2));
    console.log('========================================');

    try {
      const { id } = req.params;

      // Verificar se doação existe
      console.log('Verificando se doação existe...');
      const doacaoExistente = await doacaoRepository.buscarPorId(id);
      if (!doacaoExistente) {
        console.log('ERRO: Doação não encontrada!');
        console.log('========================================\n');
        return res.status(404).json({
          success: false,
          message: 'Doação não encontrada'
        });
      }

      console.log('Doação encontrada. Dados anteriores:');
      console.log('- Valor anterior: R$', doacaoExistente.valor);
      console.log('- Data anterior:', doacaoExistente.dataDoacao);

      // Validar dados
      const doacao = new Doacao({ ...req.body, id });
      const erros = doacao.validaDoacao();
      if (erros.length > 0) {
        console.log('ERRO: Validação falhou:', erros);
        console.log('========================================\n');
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: erros
        });
      }

      console.log('Validações: OK');
      console.log('Atualizando doação...');

      // Atualizar doação
      const atualizado = await doacaoRepository.atualizar(id, req.body);

      if (!atualizado) {
        console.log('ERRO: Falha ao atualizar no banco!');
        console.log('========================================\n');
        return res.status(500).json({
          success: false,
          message: 'Erro ao atualizar doação'
        });
      }

      // Buscar doação atualizada
      const doacaoAtualizada = await doacaoRepository.buscarPorId(id);

      console.log('========================================');
      console.log('DOAÇÃO ATUALIZADA COM SUCESSO!');
      console.log('- Novo valor: R$', doacaoAtualizada.valor);
      console.log('- Nova data:', doacaoAtualizada.dataDoacao);
      console.log('Status: SUCESSO');
      console.log('========================================\n');

      return res.json({
        success: true,
        message: 'Doação atualizada com sucesso',
        data: doacaoAtualizada.toJSON()
      });
    } catch (error) {
      console.log('========================================');
      console.log('ERRO ao atualizar doação:', error.message);
      console.log('========================================\n');
      console.error('Erro ao atualizar doação:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao atualizar doação',
        error: error.message
      });
    }
  }

  // Excluir doação - DESABILITADO
  async excluir(req, res) {
    console.log('========================================');
    console.log(`[${new Date().toISOString()}] DOAÇÃO - TENTATIVA DE EXCLUSÃO`);
    console.log('ID:', req.params.id);
    console.log('AÇÃO BLOQUEADA: Doações não podem ser excluídas!');
    console.log('Motivo: Integridade do histórico e auditoria');
    console.log('========================================\n');

    // Doações não podem ser excluídas para manter integridade do histórico
    return res.status(403).json({
      success: false,
      message: 'Não é permitido excluir doações. As doações devem ser mantidas para histórico e auditoria.'
    });
  }

  // Obter estatísticas
  async estatisticas(req, res) {
    try {
      const filtros = {
        dataInicio: req.query.dataInicio,
        dataFim: req.query.dataFim
      };
      
      const estatisticas = await doacaoRepository.obterEstatisticas(filtros);
      
      return res.json({
        success: true,
        data: estatisticas
      });
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao obter estatísticas',
        error: error.message
      });
    }
  }
}

module.exports = new DoacaoController();