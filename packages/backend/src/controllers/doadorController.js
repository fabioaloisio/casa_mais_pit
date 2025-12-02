const doadorRepository = require('../repository/doadorRepository');
const Doador = require('../models/doador');
const { validateCPF, validateCNPJ, validateDocumento } = require('../../../shared/src/validators');

class DoadorController {
  async create(req, res) {
    console.log('========================================');
    console.log(`[${new Date().toISOString()}] DOADOR - CADASTRO`);
    console.log('Dados recebidos:', JSON.stringify(req.body, null, 2));
    console.log('========================================');

    try {
      const { tipo_doador, nome, documento, email, telefone, endereco, cidade, estado, cep } = req.body;

      if (!tipo_doador || !nome || !documento || !telefone) {
        console.log('ERRO: Campos obrigatórios faltando');
        console.log('========================================\n');
        return res.status(400).json({
          success: false,
          message: 'Campos obrigatórios: tipo_doador, nome, documento, telefone'
        });
      }

      console.log('Tipo de doador:', tipo_doador);
      console.log('Nome:', nome);
      console.log('Documento:', documento);

      // Validar documento (CPF ou CNPJ)
      console.log(`Validando ${tipo_doador === 'PF' ? 'CPF' : 'CNPJ'}...`);
      if (!validateDocumento(documento, tipo_doador)) {
        const docType = tipo_doador === 'PF' ? 'CPF' : 'CNPJ';
        console.log(`ERRO: ${docType} inválido!`);
        console.log('========================================\n');
        return res.status(400).json({
          success: false,
          message: `${docType} inválido`
        });
      }
      console.log('Validação de documento: OK');

      console.log('Verificando duplicidade...');
      const doadorExistente = await doadorRepository.findByDocumento(documento);
      if (doadorExistente) {
        console.log('ERRO: Doador já existe!');
        console.log('ID existente:', doadorExistente.id);
        console.log('Nome existente:', doadorExistente.nome);
        console.log('========================================\n');
        return res.status(409).json({
          success: false,
          message: 'Já existe um doador cadastrado com este documento',
          data: doadorExistente
        });
      }
      console.log('Doador não existe, criando novo...');

      const novoDoador = new Doador(
        null,
        tipo_doador,
        nome,
        documento,
        email || null,
        telefone,
        endereco || null,
        cidade || null,
        estado || null,
        cep || null,
        null,
        null,
        true
      );

      const id = await doadorRepository.create(novoDoador);
      console.log('ID do doador gerado:', id);

      const doadorCriado = await doadorRepository.findById(id);

      console.log('========================================');
      console.log('DOADOR CADASTRADO COM SUCESSO!');
      console.log('ID:', id);
      console.log('Nome:', nome);
      console.log('Documento:', documento);
      console.log('Tipo:', tipo_doador);
      console.log('Status: SUCESSO');
      console.log('========================================\n');

      res.status(201).json({
        success: true,
        message: 'Doador cadastrado com sucesso',
        data: doadorCriado
      });
    } catch (error) {
      console.log('========================================');
      console.log('ERRO AO CADASTRAR DOADOR:', error.message);
      console.log('Stack:', error.stack);
      console.log('========================================\n');
      console.error('Erro ao criar doador:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao cadastrar doador'
      });
    }
  }

  async findAll(req, res) {
    console.log('========================================');
    console.log(`[${new Date().toISOString()}] DOADOR - LISTAGEM`);

    // Mostrar apenas filtros que foram enviados
    const filtrosEnviados = Object.keys(req.query).length > 0 ? req.query : 'Nenhum filtro aplicado';
    console.log('Filtros recebidos:', filtrosEnviados);
    console.log('========================================');

    try {
      const { tipo_doador, ativo, search } = req.query;

      const filters = {};
      if (tipo_doador) filters.tipo_doador = tipo_doador;
      if (ativo !== undefined) filters.ativo = ativo === 'true';
      if (search) filters.search = search;

      if (Object.keys(filters).length > 0) {
        console.log('Filtros aplicados:', filters);
      } else {
        console.log('Buscando todos os doadores (sem filtros)');
      }
      const doadores = await doadorRepository.findAll(filters);

      console.log('Total de doadores encontrados:', doadores.length);
      if (doadores.length > 0) {
        console.log('Primeiro doador:', {
          id: doadores[0].id,
          nome: doadores[0].nome,
          tipo: doadores[0].tipo_doador
        });
      }
      console.log('========================================\n');

      res.json({
        success: true,
        data: doadores
      });
    } catch (error) {
      console.log('ERRO ao listar doadores:', error.message);
      console.log('========================================\n');
      console.error('Erro ao buscar doadores:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar doadores'
      });
    }
  }

  async findById(req, res) {
    console.log('========================================');
    console.log(`[${new Date().toISOString()}] DOADOR - CONSULTA POR ID`);
    console.log('ID solicitado:', req.params.id);
    console.log('========================================');

    try {
      const { id } = req.params;
      const doador = await doadorRepository.findById(id);

      if (!doador) {
        console.log('Doador não encontrado!');
        console.log('========================================\n');
        return res.status(404).json({
          success: false,
          message: 'Doador não encontrado'
        });
      }

      console.log('Doador encontrado:');
      console.log('- ID:', doador.id);
      console.log('- Nome:', doador.nome);
      console.log('- Documento:', doador.documento);
      console.log('- Tipo:', doador.tipo_doador);
      console.log('- Ativo:', doador.ativo ? 'SIM' : 'NÃO');

      const estatisticasConsolidadas = await doadorRepository.getEstatisticasConsolidadas(id);
      console.log('Estatísticas carregadas');
      console.log('========================================\n');

      res.json({
        success: true,
        data: {
          ...doador,
          estatisticas: estatisticasConsolidadas
        }
      });
    } catch (error) {
      console.log('ERRO ao buscar doador:', error.message);
      console.log('========================================\n');
      console.error('Erro ao buscar doador:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar doador'
      });
    }
  }

  async update(req, res) {
    console.log('========================================');
    console.log(`[${new Date().toISOString()}] DOADOR - ATUALIZAÇÃO`);
    console.log('ID:', req.params.id);
    console.log('Dados para atualizar:', JSON.stringify(req.body, null, 2));
    console.log('========================================');

    try {
      const { id } = req.params;
      const dadosAtualizacao = req.body;

      console.log('Verificando se doador existe...');
      const doadorExistente = await doadorRepository.findById(id);
      if (!doadorExistente) {
        console.log('ERRO: Doador não encontrado!');
        console.log('========================================\n');
        return res.status(404).json({
          success: false,
          message: 'Doador não encontrado'
        });
      }

      console.log('Doador encontrado. Dados anteriores:');
      console.log('- Nome anterior:', doadorExistente.nome);
      console.log('- Documento anterior:', doadorExistente.documento);
      console.log('- Status anterior:', doadorExistente.ativo ? 'ATIVO' : 'INATIVO');

      if (dadosAtualizacao.documento && dadosAtualizacao.documento !== doadorExistente.documento) {
        console.log('Verificando duplicidade de documento...');
        const doadorComMesmoDocumento = await doadorRepository.findByDocumento(dadosAtualizacao.documento);
        if (doadorComMesmoDocumento) {
          console.log('ERRO: Já existe outro doador com este documento!');
          console.log('========================================\n');
          return res.status(409).json({
            success: false,
            message: 'Já existe outro doador cadastrado com este documento'
          });
        }
        console.log('Documento disponível');
      }

      // Verificar se está tentando inativar um doador com doações
      if (dadosAtualizacao.ativo === false || dadosAtualizacao.ativo === 0) {
        console.log('Verificando se doador possui doações...');
        const doacoes = await doadorRepository.findDoacoesByDoadorId(id);
        if (doacoes.length > 0) {
          console.log(`ERRO: Doador possui ${doacoes.length} doações e não pode ser inativado!`);
          console.log('========================================\n');
          return res.status(400).json({
            success: false,
            message: 'Não é possível inativar um doador que possui doações registradas',
            total_doacoes: doacoes.length
          });
        }
        console.log('Doador não possui doações, pode ser inativado');
      }

      const doadorAtualizado = new Doador();
      Object.assign(doadorAtualizado, dadosAtualizacao);

      console.log('Atualizando doador...');
      const linhasAfetadas = await doadorRepository.update(id, doadorAtualizado);

      if (linhasAfetadas === 0) {
        console.log('AVISO: Nenhuma alteração realizada');
        console.log('========================================\n');
        return res.status(400).json({
          success: false,
          message: 'Nenhuma alteração realizada'
        });
      }

      const doador = await doadorRepository.findById(id);

      console.log('========================================');
      console.log('DOADOR ATUALIZADO COM SUCESSO!');
      console.log('- Novo nome:', doador.nome);
      console.log('- Novo status:', doador.ativo ? 'ATIVO' : 'INATIVO');
      console.log('Status: SUCESSO');
      console.log('========================================\n');

      res.json({
        success: true,
        message: 'Doador atualizado com sucesso',
        data: doador
      });
    } catch (error) {
      console.log('========================================');
      console.log('ERRO ao atualizar doador:', error.message);
      console.log('========================================\n');
      console.error('Erro ao atualizar doador:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar doador'
      });
    }
  }

  async delete(req, res) {
    console.log('========================================');
    console.log(`[${new Date().toISOString()}] DOADOR - EXCLUSÃO`);
    console.log('ID:', req.params.id);
    console.log('========================================');

    try {
      const { id } = req.params;

      console.log('Verificando se doador existe...');
      const doador = await doadorRepository.findById(id);
      if (!doador) {
        console.log('ERRO: Doador não encontrado!');
        console.log('========================================\n');
        return res.status(404).json({
          success: false,
          message: 'Doador não encontrado'
        });
      }

      console.log('Doador encontrado:', doador.nome);
      console.log('Verificando se possui doações...');

      const doacoes = await doadorRepository.findDoacoesByDoadorId(id);
      if (doacoes.length > 0) {
        console.log(`ERRO: Doador possui ${doacoes.length} doações!`);
        console.log('Exclusão bloqueada para manter integridade');
        console.log('========================================\n');
        return res.status(400).json({
          success: false,
          message: 'Não é possível excluir um doador que possui doações registradas',
          total_doacoes: doacoes.length
        });
      }

      console.log('Doador não possui doações, prosseguindo com exclusão...');

      const linhasAfetadas = await doadorRepository.delete(id);

      if (linhasAfetadas === 0) {
        console.log('ERRO: Falha ao excluir do banco!');
        console.log('========================================\n');
        return res.status(400).json({
          success: false,
          message: 'Erro ao excluir doador'
        });
      }

      console.log('========================================');
      console.log('DOADOR EXCLUÍDO COM SUCESSO!');
      console.log('ID:', id);
      console.log('Nome:', doador.nome);
      console.log('Status: SUCESSO');
      console.log('========================================\n');

      res.json({
        success: true,
        message: 'Doador excluído com sucesso'
      });
    } catch (error) {
      console.log('========================================');
      console.log('ERRO ao excluir doador:', error.message);
      console.log('========================================\n');
      console.error('Erro ao excluir doador:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao excluir doador'
      });
    }
  }

  async findDoacoes(req, res) {
    try {
      const { id } = req.params;
      
      const doador = await doadorRepository.findById(id);
      if (!doador) {
        return res.status(404).json({ 
          success: false,
          message: 'Doador não encontrado' 
        });
      }

      const doacoes = await doadorRepository.findDoacoesByDoadorId(id);
      res.json({
        success: true,
        data: doacoes
      });
    } catch (error) {
      console.error('Erro ao buscar doações do doador:', error);
      res.status(500).json({ 
        success: false,
        message: 'Erro ao buscar doações do doador' 
      });
    }
  }

  async findHistoricoUnificado(req, res) {
    try {
      const { id } = req.params;
      
      const doador = await doadorRepository.findById(id);
      if (!doador) {
        return res.status(404).json({ 
          success: false,
          message: 'Doador não encontrado' 
        });
      }

      const historicoUnificado = await doadorRepository.findHistoricoUnificadoByDoadorId(id);
      res.json({
        success: true,
        data: historicoUnificado
      });
    } catch (error) {
      console.error('Erro ao buscar histórico unificado do doador:', error);
      res.status(500).json({ 
        success: false,
        message: 'Erro ao buscar histórico unificado do doador' 
      });
    }
  }

  async getEstatisticasConsolidadas(req, res) {
    try {
      const { id } = req.params;
      
      const doador = await doadorRepository.findById(id);
      if (!doador) {
        return res.status(404).json({ 
          success: false,
          message: 'Doador não encontrado' 
        });
      }

      const estatisticas = await doadorRepository.getEstatisticasConsolidadas(id);
      res.json({
        success: true,
        data: estatisticas
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas consolidadas do doador:', error);
      res.status(500).json({ 
        success: false,
        message: 'Erro ao buscar estatísticas consolidadas do doador' 
      });
    }
  }
}

module.exports = new DoadorController();