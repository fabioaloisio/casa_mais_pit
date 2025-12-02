const db = require('../config/database');

// Listar especialidades únicas extraídas das consultas existentes
const listar = async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT especialidade as nome
      FROM medicos 
      WHERE especialidade IS NOT NULL 
        AND especialidade != ''
      ORDER BY especialidade
    `;
    
    const [rows] = await db.query(query);
    
    // Mapear para formato esperado pelo frontend
    const especialidades = rows.map(row => ({
      id: row.nome, // Usando nome como ID já que não há tabela separada
      nome: row.nome
    }));

    res.status(200).json({
      success: true,
      message: 'Especialidades listadas com sucesso',
      data: especialidades
    });
  } catch (error) {
    console.error('Erro ao listar especialidades:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar especialidades',
      errors: [error.message]
    });
  }
};

module.exports = {
  listar
};