const db = require('../config/database');
const BaseRepository = require('../../../shared/repository/BaseRepository');
const { Assistida, DrogaUtilizada, Internacao, MedicamentoUtilizado } = require('../models/assistida');

class AssistidaRepository extends BaseRepository {
    constructor() {
        super('assistidas', 'a');
    }
    async findAll() {
        try {
            // Usa método do BaseRepository
            const assistidasRaw = await super.findAll();

            // Para cada assistida, buscar internações e medicamentos (removendo drogas)
            const assistidas = await Promise.all(
                assistidasRaw.map(async (row) => {
                    const internacoes = await this.findInternacoesByAssistidaId(row.id);
                    const medicamentos = await this.findMedicamentosByAssistidaId(row.id);

                    return new Assistida({
                        ...row,
                        drogas: [], // Lista vazia para drogas
                        internacoes,
                        medicamentos
                    });
                })
            );

            return assistidas;
        } catch (error) {
            throw new Error(`Erro ao buscar assistidas: ${error.message}`);
        }

    }

    async create(assistidaData) {
        const {
            drogas = [], internacoes = [], medicamentos = [],
            nome, cpf, rg, idade, data_nascimento, nacionalidade,
            estado_civil, profissao, escolaridade, status,
            logradouro, bairro, numero, cep, estado, cidade,
            telefone, telefone_contato
        } = assistidaData;

        const conn = await db.getConnection(); // usar transação
        try {
            await conn.beginTransaction();

            const [result] = await conn.execute(`
      INSERT INTO assistidas (
        nome, cpf, rg, idade, data_nascimento, nacionalidade,
        estado_civil, profissao, escolaridade, status,
        logradouro, bairro, numero, cep, estado, cidade,
        telefone, telefone_contato
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
                nome, cpf, rg, idade, data_nascimento, nacionalidade,
                estado_civil, profissao, escolaridade, status,
                logradouro, bairro, numero, cep, estado, cidade,
                telefone, telefone_contato,
            ]);

            const assistidaId = result.insertId;


            // Inserir internações
            for (const internacao of internacoes) {
                await conn.execute(
                    'INSERT INTO internacoes (assistida_id, local, duracao, data) VALUES (?, ?, ?, ?)',
                    [assistidaId, internacao.local, internacao.duracao, internacao.data]
                );
            }

            // Inserir medicamentos
            for (const medicamento of medicamentos) {
                await conn.execute(
                    'INSERT INTO medicamentos_utilizados (assistida_id, nome, dosagem, frequencia) VALUES (?, ?, ?, ?)',
                    [assistidaId, medicamento.nome, medicamento.dosagem, medicamento.frequencia]
                );
            }

            await conn.commit();
            return await this.findById(assistidaId);

        } catch (error) {
            await conn.rollback();
            throw new Error(`Erro ao criar assistida: ${error.message}`);
        } finally {
            conn.release();
        }
    }

    async update(id, assistidaData) {
        const {
            nome, cpf, rg, idade, data_nascimento, nacionalidade,
            estado_civil, profissao, escolaridade, status,
            logradouro, bairro, numero, cep, estado, cidade,
            telefone, telefone_contato,
        } = assistidaData;

        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();

            // 1. Atualiza dados principais
            await conn.execute(`
      UPDATE assistidas SET
        nome = ?, cpf = ?, rg = ?, idade = ?, data_nascimento = ?, nacionalidade = ?,
        estado_civil = ?, profissao = ?, escolaridade = ?, status = ?,
        logradouro = ?, bairro = ?, numero = ?, cep = ?, estado = ?, cidade = ?,
        telefone = ?, telefone_contato = ?
      WHERE id = ?
    `, [
                nome, cpf, rg, idade, data_nascimento, nacionalidade,
                estado_civil, profissao, escolaridade, status,
                logradouro, bairro, numero, cep, estado, cidade,
                telefone, telefone_contato, id
            ]);

            await conn.commit();
            return await this.findById(id);

        } catch (error) {
            await conn.rollback();
            throw new Error(`Erro ao atualizar assistida: ${error.message}`);
        } finally {
            conn.release();
        }
    }

    async delete(id) {
        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();

            // Verifica se a assistida existe
            const [rows] = await conn.execute('SELECT * FROM assistidas WHERE id = ?', [id]);
            if (rows.length === 0) {
                throw new Error('Assistida não encontrada');
            }

            // A remoção das drogas, internações e medicamentos ocorre automaticamente com ON DELETE CASCADE
            await conn.execute('DELETE FROM assistidas WHERE id = ?', [id]);

            await conn.commit();
            return { success: true, message: 'Assistida removida com sucesso' };

        } catch (error) {
            await conn.rollback();
            throw new Error(`Erro ao remover assistida: ${error.message}`);
        } finally {
            conn.release();
        }
    }

    async findById(id) {
        try {
            const [rows] = await db.execute('SELECT * FROM assistidas WHERE id = ?', [id]);
            if (rows.length === 0) return null;

            const internacoes = await this.findInternacoesByAssistidaId(id);
            const medicamentos = await this.findMedicamentosByAssistidaId(id);

            return new Assistida({ ...rows[0], drogas: [], internacoes, medicamentos });
        } catch (error) {
            throw new Error(`Erro ao buscar assistida: ${error.message}`);
        }
    }

    async findTodosComFiltros({ nome, cpf, idade, status }) {
        try {
            let query = 'SELECT * FROM assistidas WHERE 1=1';
            const params = [];

            if (nome) {
                query += ' AND nome LIKE ?';
                params.push(`%${nome}%`);
            }
            if (cpf) {
                query += ' AND cpf = ?';
                params.push(cpf);
            }
            if (idade) {
                query += ' AND idade = ?';
                params.push(idade);
            }
            if (status) {
                query += ' AND status = ?';
                params.push(status);
            }

            const [rows] = await db.execute(query, params);

            // Buscar internações, medicamentos (removendo drogas)
            const assistidas = await Promise.all(rows.map(async (row) => {
                const internacoes = await this.findInternacoesByAssistidaId(row.id);
                const medicamentos = await this.findMedicamentosByAssistidaId(row.id);

                return new Assistida({ ...row, drogas: [], internacoes, medicamentos });
            }));

            return assistidas;
        } catch (error) {
            throw new Error(`Erro ao buscar com filtros: ${error.message}`);
        }
    }

    async findInternacoesByAssistidaId(assistidaId) {
        const [rows] = await db.execute(
            'SELECT id, data_entrada, data_saida, motivo, observacoes, status FROM internacoes WHERE assistida_id = ?',
            [assistidaId]
        );
        return rows;
    }

    async findMedicamentosByAssistidaId(assistidaId) {
        const [rows] = await db.execute(
            'SELECT nome, dosagem, frequencia FROM medicamentos_utilizados WHERE assistida_id = ?',
            [assistidaId]
        );
        return rows.map(row => new MedicamentoUtilizado(row));
    }

    async obterEstatisticas(filtros = {}) {
        let queryBase = 'FROM assistidas WHERE 1=1';
        const valores = [];

        if (filtros.status) {
            queryBase += ' AND status = ?';
            valores.push(filtros.status);
        }

        if (filtros.cidade) {
            queryBase += ' AND cidade = ?';
            valores.push(filtros.cidade);
        }

        if (filtros.dataInicio) {
            queryBase += ' AND data_atendimento >= ?';
            valores.push(filtros.dataInicio);
        }

        if (filtros.dataFim) {
            queryBase += ' AND data_atendimento <= ?';
            valores.push(filtros.dataFim);
        }

        // Total geral
        const [totalRows] = await db.execute(
            `SELECT COUNT(*) as total ${queryBase}`,
            valores
        );

        // Total por status
        const [statusRows] = await db.execute(
            `SELECT status, COUNT(*) as quantidade ${queryBase} GROUP BY status`,
            valores
        );

        // Construir resposta
        const stats = {
            total: totalRows[0].total,
            ativas: 0,
            emTratamento: 0,
            inativas: 0
        };

        for (const row of statusRows) {
            if (row.status === 'Ativa') stats.ativas = row.quantidade;
            if (row.status === 'Em Tratamento') stats.emTratamento = row.quantidade;
            if (row.status === 'Inativa') stats.inativas = row.quantidade;
        }

        return stats
    }

}

module.exports = new AssistidaRepository();
