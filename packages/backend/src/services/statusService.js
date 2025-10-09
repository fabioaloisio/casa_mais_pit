const UsuarioRepository = require('../repository/usuarioRepository');
const db = require('../config/database');

class StatusService {
  constructor() {
    this.usuarioRepository = new UsuarioRepository();
  }

  // Validações de transição de status
  isValidStatusTransition(statusAtual, novoStatus) {
    const transicoes = {
      'pendente': ['aprovado', 'rejeitado'],
      'aprovado': ['ativo'],
      'ativo': ['bloqueado', 'suspenso', 'inativo'],
      'rejeitado': ['pendente'], // Pode reenviar para aprovação
      'bloqueado': ['ativo'], // Pode ser desbloqueado
      'suspenso': ['ativo', 'bloqueado'], // Pode ser reativado ou bloqueado permanentemente
      'inativo': ['ativo'] // Pode ser reativado
    };

    return transicoes[statusAtual]?.includes(novoStatus) || false;
  }

  // Aprovar usuário
  async approveUser(usuarioId, aprovadoPor) {
    const usuario = await this.usuarioRepository.findById(usuarioId);

    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    if (usuario.status !== 'pendente') {
      throw new Error(`Não é possível aprovar usuário com status ${usuario.status}`);
    }

    // Gerar token de ativação
    const token = this.generateActivationToken();

    await this.usuarioRepository.updateApprovalStatus(
      usuarioId,
      'aprovado',
      token,
      aprovadoPor
    );

    // Registrar no log de aprovações
    await this.usuarioRepository.logApprovalAction(
      usuarioId,
      'aprovado',
      aprovadoPor,
      'Usuário aprovado para ativação'
    );

    return {
      success: true,
      usuario,
      token
    };
  }

  // Rejeitar usuário
  async rejectUser(usuarioId, rejeitadoPor, motivo) {
    const usuario = await this.usuarioRepository.findById(usuarioId);

    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    if (usuario.status !== 'pendente') {
      throw new Error(`Não é possível rejeitar usuário com status ${usuario.status}`);
    }

    await this.usuarioRepository.updateUserStatus(
      usuarioId,
      'rejeitado',
      rejeitadoPor,
      motivo
    );

    // Registrar no log de aprovações
    await this.usuarioRepository.logApprovalAction(
      usuarioId,
      'rejeitado',
      rejeitadoPor,
      motivo
    );

    return {
      success: true,
      usuario
    };
  }

  // Bloquear usuário
  async blockUser(usuarioId, bloqueadoPor, motivo) {
    const usuario = await this.usuarioRepository.findById(usuarioId);

    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    if (!['ativo', 'suspenso'].includes(usuario.status)) {
      throw new Error(`Não é possível bloquear usuário com status ${usuario.status}`);
    }

    const usuarioBloqueado = await this.usuarioRepository.blockUser(
      usuarioId,
      motivo,
      bloqueadoPor
    );

    return {
      success: true,
      usuario: usuarioBloqueado
    };
  }

  // Desbloquear usuário
  async unblockUser(usuarioId, desbloqueadoPor) {
    const usuario = await this.usuarioRepository.findById(usuarioId);

    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    if (usuario.status !== 'bloqueado') {
      throw new Error(`Não é possível desbloquear usuário com status ${usuario.status}`);
    }

    const usuarioDesbloqueado = await this.usuarioRepository.unblockUser(
      usuarioId,
      desbloqueadoPor
    );

    return {
      success: true,
      usuario: usuarioDesbloqueado
    };
  }

  // Suspender usuário
  async suspendUser(usuarioId, suspensoPor, dataFim, motivo) {
    const usuario = await this.usuarioRepository.findById(usuarioId);

    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    if (usuario.status !== 'ativo') {
      throw new Error(`Não é possível suspender usuário com status ${usuario.status}`);
    }

    const usuarioSuspenso = await this.usuarioRepository.suspendUser(
      usuarioId,
      dataFim,
      motivo,
      suspensoPor
    );

    return {
      success: true,
      usuario: usuarioSuspenso
    };
  }

  // Reativar usuário suspenso
  async reactivateSuspendedUser(usuarioId, reativadoPor) {
    const usuario = await this.usuarioRepository.findById(usuarioId);

    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    if (usuario.status !== 'suspenso') {
      throw new Error(`Não é possível reativar usuário com status ${usuario.status}`);
    }

    const usuarioReativado = await this.usuarioRepository.reactivateUser(
      usuarioId,
      reativadoPor
    );

    return {
      success: true,
      usuario: usuarioReativado
    };
  }

  // Marcar usuário como inativo
  async markAsInactive(usuarioId, marcadoPor) {
    const usuario = await this.usuarioRepository.findById(usuarioId);

    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    if (usuario.status !== 'ativo') {
      throw new Error(`Não é possível marcar como inativo usuário com status ${usuario.status}`);
    }

    const usuarioInativo = await this.usuarioRepository.updateUserStatus(
      usuarioId,
      'inativo',
      marcadoPor,
      'Usuário marcado como inativo por inatividade'
    );

    return {
      success: true,
      usuario: usuarioInativo
    };
  }

  // Reativar usuário inativo
  async reactivateInactiveUser(usuarioId, reativadoPor) {
    const usuario = await this.usuarioRepository.findById(usuarioId);

    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    if (usuario.status !== 'inativo') {
      throw new Error(`Não é possível reativar usuário com status ${usuario.status}`);
    }

    const usuarioReativado = await this.usuarioRepository.updateUserStatus(
      usuarioId,
      'ativo',
      reativadoPor,
      'Usuário reativado manualmente'
    );

    return {
      success: true,
      usuario: usuarioReativado
    };
  }

  // Processar suspensões expiradas (para ser executado por um cron job)
  async processExpiredSuspensions() {
    const usuariosSuspensos = await this.usuarioRepository.findSuspendedToReactivate();
    const resultados = [];

    for (const usuario of usuariosSuspensos) {
      try {
        await this.usuarioRepository.reactivateUser(usuario.id, null); // null = sistema
        resultados.push({
          id: usuario.id,
          nome: usuario.nome,
          status: 'reativado',
          erro: null
        });
      } catch (error) {
        resultados.push({
          id: usuario.id,
          nome: usuario.nome,
          status: 'erro',
          erro: error.message
        });
      }
    }

    return resultados;
  }

  // Processar usuários inativos (para ser executado por um cron job)
  async processInactiveUsers(diasInatividade = 90) {
    const usuariosInativos = await this.usuarioRepository.findInactiveUsers(diasInatividade);
    const resultados = [];

    for (const usuario of usuariosInativos) {
      try {
        await this.usuarioRepository.updateUserStatus(
          usuario.id,
          'inativo',
          null, // null = sistema
          `Usuário inativo há mais de ${diasInatividade} dias`
        );

        resultados.push({
          id: usuario.id,
          nome: usuario.nome,
          status: 'marcado_inativo',
          erro: null
        });
      } catch (error) {
        resultados.push({
          id: usuario.id,
          nome: usuario.nome,
          status: 'erro',
          erro: error.message
        });
      }
    }

    return resultados;
  }

  // Obter histórico de status
  async getUserStatusHistory(usuarioId, limit = 10) {
    return await this.usuarioRepository.getStatusHistory(usuarioId, limit);
  }

  // Obter estatísticas de status
  async getStatusStatistics() {
    const usuarios = await this.usuarioRepository.getAllWithStatusDetails();

    const estatisticas = {
      total: usuarios.length,
      por_status: {
        pendente: 0,
        aprovado: 0,
        ativo: 0,
        rejeitado: 0,
        bloqueado: 0,
        suspenso: 0,
        inativo: 0
      },
      por_tipo: {
        Administrador: 0,
        Colaborador: 0
      }
    };

    usuarios.forEach(usuario => {
      if (estatisticas.por_status.hasOwnProperty(usuario.status)) {
        estatisticas.por_status[usuario.status]++;
      }
      if (estatisticas.por_tipo.hasOwnProperty(usuario.tipo)) {
        estatisticas.por_tipo[usuario.tipo]++;
      }
    });

    return estatisticas;
  }

  // Gerar token de ativação
  generateActivationToken() {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  }

  // Ativar conta de usuário aprovado
  async activateUserAccount(token, senhaHash) {
    const usuario = await this.usuarioRepository.findByActivationToken(token);

    if (!usuario) {
      throw new Error('Token de ativação inválido ou expirado');
    }

    if (usuario.status !== 'aprovado') {
      throw new Error(`Não é possível ativar usuário com status ${usuario.status}`);
    }

    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      // Ativar conta
      await connection.execute(
        `UPDATE usuarios
         SET status = 'ativo',
             senha = ?,
             token_ativacao = NULL,
             data_ativacao = NOW(),
             data_atualizacao = NOW()
         WHERE id = ?`,
        [senhaHash, usuario.id]
      );

      // Registrar no histórico
      await connection.execute(
        `INSERT INTO usuarios_status_historico
         (usuario_id, status_anterior, status_novo, alterado_por, observacoes)
         VALUES (?, 'aprovado', 'ativo', ?, 'Conta ativada pelo usuário')`,
        [usuario.id, usuario.id]
      );

      await connection.commit();

      return {
        success: true,
        usuario: await this.usuarioRepository.findById(usuario.id)
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Validar token de ativação
  async validateActivationToken(token) {
    const usuario = await this.usuarioRepository.findByActivationToken(token);

    if (!usuario) {
      return {
        valid: false,
        message: 'Token de ativação inválido ou expirado'
      };
    }

    if (usuario.status !== 'aprovado') {
      return {
        valid: false,
        message: 'Usuário não está aguardando ativação'
      };
    }

    return {
      valid: true,
      usuario: usuario.toJSON()
    };
  }

  // Verificar permissão para ação
  canPerformAction(usuarioExecutor, acao) {
    // Regras de permissão
    const permissoes = {
      'aprovar': ['Administrador'],
      'rejeitar': ['Administrador'],
      'bloquear': ['Administrador'],
      'desbloquear': ['Administrador'],
      'suspender': ['Administrador'],
      'reativar': ['Administrador']
    };

    return permissoes[acao]?.includes(usuarioExecutor.tipo) || false;
  }
}

module.exports = StatusService;