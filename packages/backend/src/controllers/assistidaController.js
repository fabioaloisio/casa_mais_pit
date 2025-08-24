const { Assistida, DrogaUtilizada, Internacao } = require('../models/assistida');
const assistidasRepository = require('../repository/assistidasRepository');

class AssistidaController {
    async getAll(req, res) {
        try {
            const { nome, cpf, idade, status } = req.query;
            let assistidas;

            // Se houver qualquer filtro, usa o método com filtros
            if (nome || cpf || idade || status) {
                assistidas = await assistidasRepository.findTodosComFiltros({ nome, cpf, idade, status });
            } else {
                // Senão, usa o findAll "puro"
                assistidas = await assistidasRepository.findAll();
            }

            res.json({
                success: true,
                data: assistidas.map(as => as.toJSON()),
                total: assistidas.length
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async create(req, res) {
        try {
            const assistida = new Assistida(req.body)
            const errors = assistida.validate()
            if (errors.length > 0) {
                return res.status(404).json({
                    success: false,
                    message: 'dados inválidos',
                    errors
                })
            }

            const newAssistida = await assistidasRepository.create(assistida)

            res.json({
                success: true,
                data: newAssistida.toJSON(),
                message: 'cadastro realizado com sucesso'
            })
        } catch (error) {
            res.status(500).json({
                success: true,
                message: error.message
            })
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params
            const assistidaExistente = await assistidasRepository.findById(id)
            if (!assistidaExistente) {
                return res.status(404).json({
                    success: false,
                    message: 'Assistida não encontrada'
                })
            }

            const assistida = new Assistida({ ...req.body, id })
            const errors = assistida.validate()
            if (errors.length > 0) {
                return res.status(404).json({
                    success: false,
                    message: 'dados inválidos',
                    errors
                })
            }

            const assistidaAtualizada = await assistidasRepository.update(id, req.body);
            res.json({
                success: true,
                data: assistidaAtualizada.toJSON()
            });

        } catch (error) {
            res.status(500).json({
                success: true,
                message: error.message
            })
        }
    }
    async detete(req, res) {
        try {
            const { id } = req.params
            const assistidaExistente = await assistidasRepository.findById(id)
            if (!assistidaExistente) {
                return res.status(404).json({
                    success: false,
                    message: 'Assistida não encontrada'
                })
            }

            const assistidaDeletada = await assistidasRepository.delete(id);

            if (assistidaDeletada) {
                res.json({
                    success: true,
                    message: 'assistida excluida'
                });
            } else {
                res.status(500).json({
                    success: true,
                    message: 'erro ao deletar'
                })
            }

        } catch (error) {
            res.status(500).json({
                success: true,
                message: error.message
            })
        }
    }

    async getById(req, res) {
        try {
            const { id } = req.params
            const assistida = await assistidasRepository.findById(id)
            if (!assistida) {
                return res.status(404).json({
                    success: false,
                    message: 'Equipamento não encontrado'
                })
            }

            res.status(201).json({
                success: true,
                data: assistida.toJSON(),

            })
        } catch (error) {
            res.status(500).json({
                success: true,
                message: error.message
            })
        }
    }

    async estatisticas(req, res) {
        try {
            const filtros = {
                status: req.query.status,
                cidade: req.query.cidade,
                dataInicio: req.query.dataInicio,
                dataFim: req.query.dataFim
            };

            const estatisticas = await assistidasRepository.obterEstatisticas(filtros);

            return res.json({
                success: true,
                data: estatisticas
            });
        } catch (error) {
            console.error('Erro ao obter estatísticas de assistidas:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro ao obter estatísticas',
                error: error.message
            });
        }
    }

}

module.exports = new AssistidaController();
