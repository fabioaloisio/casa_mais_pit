const Substancia = require('../models/substancia');
const substanciaRepository = require('../repository/substanciaRepository');

class SubstanciaController {
    // Listar todas ou com filtros
    async getAll(req, res) {
        try {
            const { nome, categoria, descricao } = req.query;
            let substancias;

            if (nome || categoria || descricao) {
                substancias = await substanciaRepository.findTodosComFiltros({ nome, categoria, descricao });
            } else {
                substancias = await substanciaRepository.findAll();
            }

            res.json({
                success: true,
                data: substancias.map(s => s.toJSON()),
                total: substancias.length
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Criar nova substância
    async create(req, res) {
        try {
            const substancia = new Substancia(req.body);
            const errors = substancia.validate();

            if (errors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    errors
                });
            }

            const novaSubstancia = await substanciaRepository.create(substancia);

            res.json({
                success: true,
                data: novaSubstancia.toJSON(),
                message: 'Substância cadastrada com sucesso'
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Atualizar substância
    async update(req, res) {
        try {
            const { id } = req.params;
            const substanciaExistente = await substanciaRepository.findById(id);

            if (!substanciaExistente) {
                return res.status(404).json({
                    success: false,
                    message: 'Substância não encontrada'
                });
            }

            const substancia = new Substancia({ ...req.body, id });
            const errors = substancia.validate();

            if (errors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    errors
                });
            }

            const substanciaAtualizada = await substanciaRepository.update(id, req.body);

            res.json({
                success: true,
                data: substanciaAtualizada.toJSON()
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Deletar substância
    async delete(req, res) {
        try {
            const { id } = req.params;
            const substanciaExistente = await substanciaRepository.findById(id);

            if (!substanciaExistente) {
                return res.status(404).json({
                    success: false,
                    message: 'Substância não encontrada'
                });
            }

            const deletada = await substanciaRepository.delete(id);

            if (deletada) {
                res.json({
                    success: true,
                    message: 'Substância excluída com sucesso'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erro ao excluir substância'
                });
            }

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Buscar por ID
    async getById(req, res) {
        try {
            const { id } = req.params;
            const substancia = await substanciaRepository.findById(id);

            if (!substancia) {
                return res.status(404).json({
                    success: false,
                    message: 'Substância não encontrada'
                });
            }

            res.json({
                success: true,
                data: substancia.toJSON()
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Estatísticas (opcional)
    async estatisticas(req, res) {
        try {
            const filtros = {
                categoria: req.query.categoria,
                dataInicio: req.query.dataInicio,
                dataFim: req.query.dataFim
            };

            const estatisticas = await substanciaRepository.obterEstatisticas(filtros);

            res.json({
                success: true,
                data: estatisticas
            });

        } catch (error) {
            console.error('Erro ao obter estatísticas de substâncias:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao obter estatísticas',
                error: error.message
            });
        }
    }
}

module.exports = new SubstanciaController();
