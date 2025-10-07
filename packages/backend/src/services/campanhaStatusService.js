const pool = require('../config/database');

class CampanhaStatusService {
  /**
   * Atualiza automaticamente o status das campanhas baseado nas datas
   * Deve ser executado periodicamente (cron job ou ao iniciar o servidor)
   */
  async atualizarStatusCampanhas() {
    const connection = await pool.getConnection();

    try {
      console.log(`[${new Date().toISOString()}] Atualizando status das campanhas...`);

      // 1. Campanhas planejadas que devem ficar ativas
      // (data_inicio <= hoje AND status = 'planejada')
      const [ativarResult] = await connection.execute(`
        UPDATE campanhas
        SET status = 'ativa',
            atualizado_em = NOW()
        WHERE status = 'planejada'
          AND data_inicio <= CURDATE()
          AND (data_fim IS NULL OR data_fim >= CURDATE())
      `);

      if (ativarResult.affectedRows > 0) {
        console.log(`✅ ${ativarResult.affectedRows} campanha(s) ativada(s)`);
      }

      // 2. Campanhas ativas que devem ser encerradas
      // (data_fim < hoje AND status = 'ativa')
      const [encerrarResult] = await connection.execute(`
        UPDATE campanhas
        SET status = 'encerrada',
            atualizado_em = NOW()
        WHERE status = 'ativa'
          AND data_fim IS NOT NULL
          AND data_fim < CURDATE()
      `);

      if (encerrarResult.affectedRows > 0) {
        console.log(`🏁 ${encerrarResult.affectedRows} campanha(s) encerrada(s)`);
      }

      // 3. Log do status atual
      const [statusCount] = await connection.execute(`
        SELECT
          status,
          COUNT(*) as total
        FROM campanhas
        GROUP BY status
      `);

      console.log('📊 Status atual das campanhas:');
      statusCount.forEach(row => {
        console.log(`   ${row.status}: ${row.total}`);
      });

      return {
        ativadas: ativarResult.affectedRows,
        encerradas: encerrarResult.affectedRows,
        resumo: statusCount
      };

    } catch (error) {
      console.error('❌ Erro ao atualizar status das campanhas:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Verifica se uma campanha específica precisa ter o status atualizado
   */
  async verificarStatusCampanha(campanhaId) {
    const connection = await pool.getConnection();

    try {
      const [campanha] = await connection.execute(
        'SELECT * FROM campanhas WHERE id = ?',
        [campanhaId]
      );

      if (campanha.length === 0) {
        throw new Error('Campanha não encontrada');
      }

      const camp = campanha[0];
      const hoje = new Date();
      const dataInicio = new Date(camp.data_inicio);
      const dataFim = camp.data_fim ? new Date(camp.data_fim) : null;

      let novoStatus = camp.status;

      // Determinar o status correto baseado nas datas
      if (camp.status !== 'cancelada') {
        if (dataInicio > hoje) {
          novoStatus = 'planejada';
        } else if (!dataFim || dataFim >= hoje) {
          novoStatus = 'ativa';
        } else {
          novoStatus = 'encerrada';
        }
      }

      // Atualizar se necessário
      if (novoStatus !== camp.status) {
        await connection.execute(
          'UPDATE campanhas SET status = ? WHERE id = ?',
          [novoStatus, campanhaId]
        );

        console.log(`📝 Campanha ${campanhaId}: ${camp.status} → ${novoStatus}`);
        return { atualizado: true, statusAnterior: camp.status, novoStatus };
      }

      return { atualizado: false, status: camp.status };

    } finally {
      connection.release();
    }
  }

  /**
   * Permite encerrar manualmente uma campanha
   */
  async encerrarCampanhaManualmente(campanhaId, motivo = null) {
    const connection = await pool.getConnection();

    try {
      const [result] = await connection.execute(`
        UPDATE campanhas
        SET status = 'encerrada',
            data_fim = CURDATE(),
            atualizado_em = NOW()
        WHERE id = ?
          AND status IN ('ativa', 'planejada')
      `, [campanhaId]);

      if (result.affectedRows > 0) {
        console.log(`🏁 Campanha ${campanhaId} encerrada manualmente. Motivo: ${motivo || 'Não especificado'}`);
        return true;
      }

      return false;
    } finally {
      connection.release();
    }
  }

  /**
   * Permite cancelar uma campanha
   */
  async cancelarCampanha(campanhaId, motivo = null) {
    const connection = await pool.getConnection();

    try {
      const [result] = await connection.execute(`
        UPDATE campanhas
        SET status = 'cancelada',
            atualizado_em = NOW()
        WHERE id = ?
          AND status IN ('ativa', 'planejada')
      `, [campanhaId]);

      if (result.affectedRows > 0) {
        console.log(`❌ Campanha ${campanhaId} cancelada. Motivo: ${motivo || 'Não especificado'}`);
        return true;
      }

      return false;
    } finally {
      connection.release();
    }
  }

  /**
   * Reativar uma campanha cancelada ou encerrada
   */
  async reativarCampanha(campanhaId) {
    const connection = await pool.getConnection();

    try {
      // Verificar as datas para definir o status correto
      const [campanha] = await connection.execute(
        'SELECT data_inicio, data_fim FROM campanhas WHERE id = ?',
        [campanhaId]
      );

      if (campanha.length === 0) {
        throw new Error('Campanha não encontrada');
      }

      const hoje = new Date();
      const dataInicio = new Date(campanha[0].data_inicio);
      const dataFim = campanha[0].data_fim ? new Date(campanha[0].data_fim) : null;

      let novoStatus = 'planejada';

      if (dataInicio <= hoje && (!dataFim || dataFim >= hoje)) {
        novoStatus = 'ativa';
      } else if (dataFim && dataFim < hoje) {
        throw new Error('Não é possível reativar uma campanha com data de fim no passado');
      }

      const [result] = await connection.execute(`
        UPDATE campanhas
        SET status = ?,
            atualizado_em = NOW()
        WHERE id = ?
          AND status IN ('cancelada', 'encerrada')
      `, [novoStatus, campanhaId]);

      if (result.affectedRows > 0) {
        console.log(`✅ Campanha ${campanhaId} reativada com status: ${novoStatus}`);
        return true;
      }

      return false;
    } finally {
      connection.release();
    }
  }
}

module.exports = new CampanhaStatusService();