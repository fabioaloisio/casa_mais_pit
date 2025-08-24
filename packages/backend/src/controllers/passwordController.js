const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const UsuarioRepository = require('../repository/usuarioRepository');
const PasswordResetRepository = require('../repository/passwordResetRepository');
const emailService = require('../services/emailService');

const usuarioRepository = new UsuarioRepository();
const passwordResetRepository = new PasswordResetRepository();
const SALT_ROUNDS = 10;

class PasswordController {
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      if (!email?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Email é obrigatório',
          errors: ['Email é obrigatório']
        });
      }

      if (!/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Email inválido',
          errors: ['Formato de email inválido']
        });
      }

      // Buscar usuário por email
      const usuario = await usuarioRepository.findByEmail(email.trim().toLowerCase());
      
      // Por segurança, sempre responder com sucesso mesmo que email não exista
      if (!usuario) {
        return res.json({
          success: true,
          message: 'Se o email estiver cadastrado, você receberá as instruções de recuperação'
        });
      }

      // Verificar se há muitos tokens ativos (rate limiting)
      const activeTokens = await passwordResetRepository.countActiveTokensForUser(usuario.id);
      if (activeTokens >= 3) {
        return res.status(429).json({
          success: false,
          message: 'Muitas tentativas de recuperação',
          errors: ['Aguarde antes de solicitar um novo link de recuperação']
        });
      }

      // Gerar token único
      const resetToken = uuidv4();
      const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 horas

      // Salvar token no banco
      await passwordResetRepository.createResetToken(usuario.id, resetToken, expiresAt);

      // Enviar email
      try {
        const emailResult = await emailService.sendPasswordResetEmail(
          usuario.email,
          usuario.nome,
          resetToken
        );

        res.json({
          success: true,
          message: 'Se o email estiver cadastrado, você receberá as instruções de recuperação',
          ...(process.env.NODE_ENV !== 'production' && emailResult.resetUrl && {
            dev_reset_url: emailResult.resetUrl
          })
        });

      } catch (emailError) {
        console.error('Erro ao enviar email de recuperação:', emailError);
        
        // Em produção, não revelar erro de email
        if (process.env.NODE_ENV === 'production') {
          return res.json({
            success: true,
            message: 'Se o email estiver cadastrado, você receberá as instruções de recuperação'
          });
        }

        return res.status(500).json({
          success: false,
          message: 'Erro ao enviar email de recuperação',
          errors: ['Erro interno no serviço de email']
        });
      }

    } catch (error) {
      console.error('Erro em forgotPassword:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        errors: ['Erro interno do servidor']
      });
    }
  }

  async resetPassword(req, res) {
    try {
      const { token, novaSenha, confirmSenha } = req.body;

      // Validações básicas
      const errors = [];
      
      if (!token?.trim()) errors.push('Token é obrigatório');
      if (!novaSenha?.trim()) errors.push('Nova senha é obrigatória');
      if (!confirmSenha?.trim()) errors.push('Confirmação de senha é obrigatória');
      
      if (novaSenha && novaSenha.length < 6) {
        errors.push('Nova senha deve ter pelo menos 6 caracteres');
      }
      
      if (novaSenha !== confirmSenha) {
        errors.push('Senhas não conferem');
      }

      // Validação de força da senha
      if (novaSenha && novaSenha.length >= 6) {
        const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/;
        if (!senhaRegex.test(novaSenha)) {
          errors.push('A senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula e 1 número');
        }
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors
        });
      }

      // Verificar se token é válido
      const tokenData = await passwordResetRepository.findValidToken(token);
      
      if (!tokenData) {
        return res.status(400).json({
          success: false,
          message: 'Token inválido ou expirado',
          errors: ['Link de recuperação inválido ou expirado. Solicite um novo link.']
        });
      }

      // Hash da nova senha
      const senhaHash = await bcrypt.hash(novaSenha, SALT_ROUNDS);

      // Atualizar senha do usuário
      await usuarioRepository.update(tokenData.usuario_id, { 
        senha: senhaHash 
      });

      // Marcar token como usado
      await passwordResetRepository.markTokenAsUsed(tokenData.id);

      // Invalidar outros tokens do usuário
      await passwordResetRepository.invalidateUserTokens(tokenData.usuario_id);

      // Enviar notificação de alteração
      try {
        await emailService.sendPasswordChangeNotification(
          tokenData.email,
          tokenData.nome
        );
      } catch (emailError) {
        console.error('Erro ao enviar notificação de alteração:', emailError);
        // Não falhar se não conseguir enviar notificação
      }

      res.json({
        success: true,
        message: 'Senha alterada com sucesso! Você já pode fazer login com a nova senha.'
      });

    } catch (error) {
      console.error('Erro em resetPassword:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        errors: ['Erro interno do servidor']
      });
    }
  }

  async changePassword(req, res) {
    try {
      const { senhaAtual, novaSenha, confirmSenha } = req.body;
      const usuarioId = req.user.id;

      // Validações básicas
      const errors = [];
      
      if (!senhaAtual?.trim()) errors.push('Senha atual é obrigatória');
      if (!novaSenha?.trim()) errors.push('Nova senha é obrigatória');
      if (!confirmSenha?.trim()) errors.push('Confirmação de senha é obrigatória');
      
      if (novaSenha && novaSenha.length < 6) {
        errors.push('Nova senha deve ter pelo menos 6 caracteres');
      }
      
      if (novaSenha !== confirmSenha) {
        errors.push('Senhas não conferem');
      }

      if (senhaAtual === novaSenha) {
        errors.push('A nova senha deve ser diferente da senha atual');
      }

      // Validação de força da senha
      if (novaSenha && novaSenha.length >= 6) {
        const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/;
        if (!senhaRegex.test(novaSenha)) {
          errors.push('A senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula e 1 número');
        }
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors
        });
      }

      // Buscar usuário atual
      const usuario = await usuarioRepository.findById(usuarioId);
      
      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado',
          errors: ['Usuário não encontrado']
        });
      }

      // Verificar senha atual
      const senhaAtualValida = await bcrypt.compare(senhaAtual, usuario.senha);
      
      if (!senhaAtualValida) {
        return res.status(400).json({
          success: false,
          message: 'Senha atual incorreta',
          errors: ['A senha atual está incorreta']
        });
      }

      // Hash da nova senha
      const senhaHash = await bcrypt.hash(novaSenha, SALT_ROUNDS);

      // Atualizar senha
      await usuarioRepository.update(usuarioId, { 
        senha: senhaHash 
      });

      // Invalidar tokens de reset existentes
      await passwordResetRepository.invalidateUserTokens(usuarioId);

      // Enviar notificação de alteração
      try {
        await emailService.sendPasswordChangeNotification(
          usuario.email,
          usuario.nome
        );
      } catch (emailError) {
        console.error('Erro ao enviar notificação de alteração:', emailError);
        // Não falhar se não conseguir enviar notificação
      }

      res.json({
        success: true,
        message: 'Senha alterada com sucesso!'
      });

    } catch (error) {
      console.error('Erro em changePassword:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        errors: ['Erro interno do servidor']
      });
    }
  }

  // Endpoint para validar token (verificar se ainda é válido)
  async validateResetToken(req, res) {
    try {
      const { token } = req.params;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Token é obrigatório',
          errors: ['Token é obrigatório']
        });
      }

      const tokenData = await passwordResetRepository.findValidToken(token);
      
      if (!tokenData) {
        return res.status(400).json({
          success: false,
          message: 'Token inválido ou expirado',
          errors: ['Link de recuperação inválido ou expirado']
        });
      }

      res.json({
        success: true,
        message: 'Token válido',
        data: {
          email: tokenData.email,
          nome: tokenData.nome,
          expires_at: tokenData.expires_at
        }
      });

    } catch (error) {
      console.error('Erro em validateResetToken:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        errors: ['Erro interno do servidor']
      });
    }
  }
}

module.exports = new PasswordController();