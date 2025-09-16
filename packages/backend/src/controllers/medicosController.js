const db = require('../config/database');

// Listar médicos únicos extraídos das consultas existentes
const listar = async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT profissional as nome
      FROM consultas 
      WHERE profissional IS NOT NULL 
        AND profissional != ''
      ORDER BY profissional
    `;
    
    const [rows] = await db.query(query);
    
    // Mapear para formato esperado pelo frontend
    const medicos = rows.map(row => ({
      id: row.nome, // Usando nome como ID já que não há tabela separada
      nome: row.nome
    }));

    res.status(200).json({
      success: true,
      message: 'Médicos listados com sucesso',
      data: medicos
    });
  } catch (error) {
    console.error('Erro ao listar médicos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar médicos',
      errors: [error.message]
    });
  }
};

module.exports = {
  listar
};