const bcrypt = require('bcrypt');
const StatusService = require('../services/statusService');

const statusService = new StatusService();
const SALT_ROUNDS = 10;

class ActivationController {
  // Validar token de ativação
  async validateToken(req, res) {
    try {
      const { token } = req.params;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Token de ativação é obrigatório',
          errors: ['Token não fornecido']
        });
      }

      const resultado = await statusService.validateActivationToken(token);

      if (!resultado.valid) {
        return res.status(400).json({
          success: false,
          message: resultado.message,
          errors: [resultado.message]
        });
      }

      res.json({
        success: true,
        message: 'Token válido',
        data: {
          usuario: resultado.usuario
        }
      });
    } catch (error) {
      console.error('Erro ao validar token:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        errors: ['Erro ao validar token de ativação']
      });
    }
  }

  // Ativar conta
  async activateAccount(req, res) {
    try {
      const { token } = req.params;
      const { senha, confirmSenha } = req.body;

      // Validações
      const errors = [];

      if (!token) errors.push('Token de ativação é obrigatório');
      if (!senha) errors.push('Senha é obrigatória');
      if (!confirmSenha) errors.push('Confirmação de senha é obrigatória');

      if (senha && senha.length < 6) {
        errors.push('Senha deve ter pelo menos 6 caracteres');
      }

      if (senha !== confirmSenha) {
        errors.push('Senhas não coincidem');
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors
        });
      }

      // Hash da senha
      const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);

      // Ativar conta usando StatusService
      const resultado = await statusService.activateUserAccount(token, senhaHash);

      res.json({
        success: true,
        message: 'Conta ativada com sucesso! Você já pode fazer login.',
        data: resultado
      });
    } catch (error) {
      console.error('Erro ao ativar conta:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Erro ao ativar conta',
        errors: [error.message || 'Erro interno do servidor']
      });
    }
  }
}

module.exports = new ActivationController();