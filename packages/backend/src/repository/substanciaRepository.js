const pool = require('../config/database'); // conexão com o banco
const Substancia = require('../models/substancia');

class SubstanciaRepository {
    // Buscar todas
    async findAll() {
        const [rows] = await pool.query('SELECT * FROM substancias');
        return rows.map(row => new Substancia(row));
    }

    // Buscar por filtros
    async findTodosComFiltros(filtros = {}) {
        const { nome, categoria } = filtros;
        let sql = 'SELECT * FROM substancias WHERE 1=1';
        const params = [];

        if (nome) {
            sql += ' AND nome LIKE ?';
            params.push(`%${nome}%`);
        }
        if (categoria) {
            sql += ' AND categoria LIKE ?';
            params.push(`%${categoria}%`);
        }

        const [rows] = await pool.query(sql, params);
        return rows.map(row => new Substancia(row));
    }

    // Criar
    async create(substancia) {
        const { nome, categoria, descricao } = substancia;
        const [result] = await pool.query(
            'INSERT INTO substancias (nome, categoria, descricao) VALUES (?, ?, ?)',
            [nome, categoria, descricao]
        );
        return new Substancia({ id: result.insertId, nome, categoria, descricao });
    }

    // Atualizar
    async update(id, substancia) {
        const { nome, categoria, descricao } = substancia;
        await pool.query(
            'UPDATE substancias SET nome=?, categoria=?, descricao=? WHERE id=?',
            [nome, categoria, descricao, id]
        );
        return new Substancia({ id, nome, categoria, descricao });
    }

    // Deletar
    async delete(id) {
        const [result] = await pool.query('DELETE FROM substancias WHERE id=?', [id]);
        return result.affectedRows > 0;
    }

    // Buscar por ID
    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM substancias WHERE id=?', [id]);
        if (rows.length === 0) return null;
        return new Substancia(rows[0]);
    }

    // Estatísticas simples (exemplo: total por categoria)
    async obterEstatisticas() {
        const [rows] = await pool.query(
            'SELECT categoria, COUNT(*) as total FROM substancias GROUP BY categoria'
        );
        return rows;
    }
}

module.exports = new SubstanciaRepository();
