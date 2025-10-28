const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.init();
  }

  async init() {
    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false, // true para porta 465, false para outras portas
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      // Verificar conexão
      if (process.env.NODE_ENV !== 'production') {
        await this.transporter.verify();
        console.log('✅ Serviço de email configurado com sucesso');
      }
    } catch (error) {
      console.error('❌ Erro ao configurar serviço de email:', error.message);
      // Em desenvolvimento, usar apenas logs
      if (process.env.NODE_ENV !== 'production') {
        console.warn('⚠️ Usando modo de desenvolvimento sem email real');
      }
    }
  }

  async sendPasswordResetEmail(userEmail, userName, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5174'}/reset-password?token=${resetToken}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Recuperação de Senha - Casa Mais</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏠 Casa Mais</h1>
            <h2>Recuperação de Senha</h2>
          </div>
          <div class="content">
            <p>Olá <strong>${userName}</strong>,</p>
            
            <p>Recebemos uma solicitação para redefinir a senha da sua conta na Casa Mais.</p>
            
            <p>Para criar uma nova senha, clique no botão abaixo:</p>
            
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Redefinir Senha</a>
            </p>
            
            <p>Ou copie e cole este link no seu navegador:</p>
            <p style="word-break: break-all; background: #fff; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
              ${resetUrl}
            </p>
            
            <div class="warning">
              <strong>⚠️ Importante:</strong>
              <ul>
                <li>Este link é válido por apenas <strong>2 horas</strong></li>
                <li>Se você não solicitou esta alteração, ignore este email</li>
                <li>Sua senha atual permanecerá inalterada</li>
              </ul>
            </div>
            
            <p>Se você continuar com problemas, entre em contato conosco.</p>
            
            <p>Atenciosamente,<br>
            <strong>Equipe Casa Mais</strong></p>
          </div>
          <div class="footer">
            <p>Este é um email automático, não responda.</p>
            <p>Casa de Lázaro de Betânia - Casa Mais</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Casa Mais <noreply@casamais.org>',
      to: userEmail,
      subject: 'Recuperação de Senha - Casa Mais',
      html: htmlContent,
      text: `
        Olá ${userName},
        
        Recebemos uma solicitação para redefinir a senha da sua conta na Casa Mais.
        
        Para criar uma nova senha, acesse este link:
        ${resetUrl}
        
        IMPORTANTE: Este link é válido por apenas 2 horas.
        
        Se você não solicitou esta alteração, ignore este email.
        
        Atenciosamente,
        Equipe Casa Mais
      `
    };

    try {
      if (!this.transporter) {
        throw new Error('Transporter de email não inicializado');
      }

      const info = await this.transporter.sendMail(mailOptions);
      
      console.log(`📧 Email de recuperação enviado para: ${userEmail}`);
      console.log(`📝 Message ID: ${info.messageId}`);
      
      return {
        success: true,
        messageId: info.messageId
      };
      
    } catch (error) {
      console.error('❌ Erro ao enviar email:', error);
      
      // Em desenvolvimento, apenas log sem falhar
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔗 Link de recuperação (modo dev):', resetUrl);
        return {
          success: true,
          messageId: 'dev-mode',
          resetUrl // Retornar URL em modo dev
        };
      }
      
      throw error;
    }
  }

  async sendNewUserNotification(adminEmail, adminName, newUser) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Novo Cadastro - Casa Mais</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2196F3; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .user-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px; }
          .button-reject { background: #f44336; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Novo Cadastro Pendente</h1>
            <h2>Aguardando Aprovação</h2>
          </div>
          <div class="content">
            <p>Olá <strong>${adminName}</strong>,</p>
            
            <p>Um novo usuário se cadastrou no sistema Casa Mais e está aguardando sua aprovação:</p>
            
            <div class="user-info">
              <h3>Dados do Solicitante:</h3>
              <p><strong>Nome:</strong> ${newUser.nome}</p>
              <p><strong>Email:</strong> ${newUser.email}</p>
              <p><strong>Data do Cadastro:</strong> ${new Date().toLocaleString('pt-BR')}</p>
            </div>
            
            <p>Para aprovar ou rejeitar este cadastro, acesse o painel administrativo:</p>
            
            <p style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5174'}/dashboard" class="button">
                Acessar Dashboard
              </a>
            </p>
            
            <p><strong>Importante:</strong> O usuário só terá acesso ao sistema após sua aprovação.</p>
            
            <p>Atenciosamente,<br>
            <strong>Sistema Casa Mais</strong></p>
          </div>
          <div class="footer">
            <p>Este é um email automático, não responda.</p>
            <p>Casa de Lázaro de Betânia - Casa Mais</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Casa Mais <noreply@casamais.org>',
      to: adminEmail,
      subject: '🔔 Novo Cadastro Pendente - Casa Mais',
      html: htmlContent,
      text: `
        Olá ${adminName},
        
        Um novo usuário se cadastrou no sistema Casa Mais:
        
        Nome: ${newUser.nome}
        Email: ${newUser.email}
        Data: ${new Date().toLocaleString('pt-BR')}
        
        Para aprovar ou rejeitar, acesse o painel administrativo.
        
        Atenciosamente,
        Sistema Casa Mais
      `
    };

    try {
      if (this.transporter) {
        await this.transporter.sendMail(mailOptions);
        console.log(`📧 Notificação de novo usuário enviada para: ${adminEmail}`);
      }
    } catch (error) {
      console.error('❌ Erro ao enviar notificação:', error);
      if (process.env.NODE_ENV !== 'production') {
        console.log('📝 Novo usuário pendente:', newUser);
      }
    }
  }

  async sendApprovalEmail(userEmail, userName, activationToken) {
    const activationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5174'}/activate/${activationToken}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Conta Aprovada - Casa Mais</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4CAF50; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #2196F3; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Conta Aprovada!</h1>
            <h2>Bem-vindo(a) ao Casa Mais</h2>
          </div>
          <div class="content">
            <p>Olá <strong>${userName}</strong>,</p>
            
            <p>Temos o prazer de informar que sua conta foi aprovada pelo administrador!</p>
            
            <p>Para ativar sua conta e definir sua senha, clique no botão abaixo:</p>
            
            <p style="text-align: center;">
              <a href="${activationUrl}" class="button">Ativar Minha Conta</a>
            </p>
            
            <p>Ou copie e cole este link no seu navegador:</p>
            <p style="word-break: break-all; background: #fff; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
              ${activationUrl}
            </p>
            
            <div class="warning">
              <strong>⚠️ Importante:</strong>
              <ul>
                <li>Este link é válido por <strong>7 dias</strong></li>
                <li>Após este período, será necessário solicitar um novo link ao administrador</li>
                <li>Guarde este email até concluir a ativação</li>
              </ul>
            </div>
            
            <p>Estamos felizes em tê-lo(a) conosco!</p>
            
            <p>Atenciosamente,<br>
            <strong>Equipe Casa Mais</strong></p>
          </div>
          <div class="footer">
            <p>Este é um email automático, não responda.</p>
            <p>Casa de Lázaro de Betânia - Casa Mais</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Casa Mais <noreply@casamais.org>',
      to: userEmail,
      subject: '✅ Sua Conta Foi Aprovada - Casa Mais',
      html: htmlContent,
      text: `
        Olá ${userName},
        
        Sua conta foi aprovada pelo administrador!
        
        Para ativar sua conta e definir sua senha, acesse:
        ${activationUrl}
        
        IMPORTANTE: Este link é válido por 7 dias.
        
        Atenciosamente,
        Equipe Casa Mais
      `
    };

    try {
      if (!this.transporter) {
        throw new Error('Transporter de email não inicializado');
      }

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`📧 Email de aprovação enviado para: ${userEmail}`);
      
      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      console.error('❌ Erro ao enviar email de aprovação:', error);
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔗 Link de ativação (modo dev):', activationUrl);
        return {
          success: true,
          messageId: 'dev-mode',
          activationUrl
        };
      }
      
      throw error;
    }
  }

  async sendRejectionEmail(userEmail, userName, motivo) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Cadastro Não Aprovado - Casa Mais</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f44336; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          .info-box { background: #fff; padding: 15px; border-left: 4px solid #2196F3; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Cadastro Não Aprovado</h1>
          </div>
          <div class="content">
            <p>Olá <strong>${userName}</strong>,</p>
            
            <p>Infelizmente, seu cadastro no sistema Casa Mais não foi aprovado neste momento.</p>
            
            ${motivo ? `
            <div class="info-box">
              <strong>Motivo:</strong>
              <p>${motivo}</p>
            </div>
            ` : ''}
            
            <p>Se você acredita que houve algum engano ou deseja obter mais informações, 
            entre em contato com a administração.</p>
            
            <p>Agradecemos seu interesse.</p>
            
            <p>Atenciosamente,<br>
            <strong>Equipe Casa Mais</strong></p>
          </div>
          <div class="footer">
            <p>Este é um email automático, não responda.</p>
            <p>Casa de Lázaro de Betânia - Casa Mais</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Casa Mais <noreply@casamais.org>',
      to: userEmail,
      subject: 'Cadastro Não Aprovado - Casa Mais',
      html: htmlContent,
      text: `
        Olá ${userName},
        
        Infelizmente, seu cadastro no sistema Casa Mais não foi aprovado neste momento.
        
        ${motivo ? `Motivo: ${motivo}` : ''}
        
        Se você acredita que houve algum engano, entre em contato com a administração.
        
        Atenciosamente,
        Equipe Casa Mais
      `
    };

    try {
      if (this.transporter) {
        await this.transporter.sendMail(mailOptions);
        console.log(`📧 Email de rejeição enviado para: ${userEmail}`);
      }
    } catch (error) {
      console.error('❌ Erro ao enviar email de rejeição:', error);
    }
  }

  async sendWelcomeEmail(userEmail, userName) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Bem-vindo - Casa Mais</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Bem-vindo(a)!</h1>
            <h2>Sua conta está ativa</h2>
          </div>
          <div class="content">
            <p>Olá <strong>${userName}</strong>,</p>
            
            <p>Sua conta foi ativada com sucesso! Agora você tem acesso completo ao sistema Casa Mais.</p>
            
            <p>Você já pode fazer login com seu email e a senha que acabou de definir.</p>
            
            <p style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5174'}/login" class="button">
                Acessar o Sistema
              </a>
            </p>
            
            <p>Se tiver alguma dúvida, não hesite em entrar em contato com a administração.</p>
            
            <p>Seja bem-vindo(a) à equipe!</p>
            
            <p>Atenciosamente,<br>
            <strong>Equipe Casa Mais</strong></p>
          </div>
          <div class="footer">
            <p>Este é um email automático, não responda.</p>
            <p>Casa de Lázaro de Betânia - Casa Mais</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Casa Mais <noreply@casamais.org>',
      to: userEmail,
      subject: '🎉 Bem-vindo ao Casa Mais!',
      html: htmlContent,
      text: `
        Olá ${userName},
        
        Sua conta foi ativada com sucesso!
        
        Agora você pode fazer login com seu email e senha em:
        ${process.env.FRONTEND_URL || 'http://localhost:5174'}/login
        
        Seja bem-vindo(a) à equipe!
        
        Atenciosamente,
        Equipe Casa Mais
      `
    };

    try {
      if (this.transporter) {
        await this.transporter.sendMail(mailOptions);
        console.log(`📧 Email de boas-vindas enviado para: ${userEmail}`);
      }
    } catch (error) {
      console.error('❌ Erro ao enviar email de boas-vindas:', error);
    }
  }

  async sendPasswordChangeNotification(userEmail, userName) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Senha Alterada - Casa Mais</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #28a745; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 Senha Alterada</h1>
          </div>
          <div class="content">
            <p>Olá <strong>${userName}</strong>,</p>

            <p>Sua senha foi alterada com sucesso em <strong>${new Date().toLocaleString('pt-BR')}</strong>.</p>

            <p>Se você não fez esta alteração, entre em contato conosco imediatamente.</p>

            <p>Atenciosamente,<br>
            <strong>Equipe Casa Mais</strong></p>
          </div>
          <div class="footer">
            <p>Este é um email automático, não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Casa Mais <noreply@casamais.org>',
      to: userEmail,
      subject: 'Senha Alterada - Casa Mais',
      html: htmlContent
    };

    try {
      if (this.transporter) {
        await this.transporter.sendMail(mailOptions);
        console.log(`📧 Notificação de alteração de senha enviada para: ${userEmail}`);
      }
    } catch (error) {
      console.error('❌ Erro ao enviar notificação de alteração:', error);
      // Não falhar se não conseguir enviar notificação
    }
  }

  async sendAccountCreatedEmail(userEmail, userName, userType) {
    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5174'}/login`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Conta Criada - Casa Mais</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: #e3f2fd; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Sua Conta Foi Criada!</h1>
            <h2>Bem-vindo ao Casa Mais</h2>
          </div>
          <div class="content">
            <p>Olá <strong>${userName}</strong>,</p>

            <p>Sua conta foi criada com sucesso por um administrador no sistema Casa Mais!</p>

            <div class="info-box">
              <h3>📋 Informações da Sua Conta:</h3>
              <p><strong>Email:</strong> ${userEmail}</p>
              <p><strong>Tipo de Usuário:</strong> ${userType}</p>
              <p><strong>Status:</strong> Ativo ✅</p>
            </div>

            <div class="warning">
              <strong>🔐 Sobre Sua Senha:</strong>
              <p>O administrador que criou sua conta definiu uma senha inicial. Entre em contato com o administrador para obter suas credenciais de acesso.</p>
            </div>

            <p>Após receber sua senha, você pode fazer login no sistema:</p>

            <p style="text-align: center;">
              <a href="${loginUrl}" class="button">Acessar o Sistema</a>
            </p>

            <p><strong>💡 Dica:</strong> Após o primeiro login, recomendamos que você altere sua senha nas configurações da sua conta.</p>

            <p>Se tiver alguma dúvida, não hesite em entrar em contato com a administração.</p>

            <p>Seja bem-vindo(a) à equipe!</p>

            <p>Atenciosamente,<br>
            <strong>Equipe Casa Mais</strong></p>
          </div>
          <div class="footer">
            <p>Este é um email automático, não responda.</p>
            <p>Casa de Lázaro de Betânia - Casa Mais</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Casa Mais <noreply@casamais.org>',
      to: userEmail,
      subject: '🎉 Sua Conta Foi Criada - Casa Mais',
      html: htmlContent,
      text: `
        Olá ${userName},

        Sua conta foi criada com sucesso no sistema Casa Mais!

        Informações da Sua Conta:
        - Email: ${userEmail}
        - Tipo: ${userType}
        - Status: Ativo

        O administrador definiu uma senha inicial para você.
        Entre em contato com o administrador para obter suas credenciais.

        Após receber sua senha, acesse o sistema em:
        ${loginUrl}

        Recomendamos que você altere sua senha após o primeiro login.

        Atenciosamente,
        Equipe Casa Mais
      `
    };

    try {
      if (!this.transporter) {
        throw new Error('Transporter de email não inicializado');
      }

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`📧 Email de conta criada enviado para: ${userEmail}`);

      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      console.error('❌ Erro ao enviar email de conta criada:', error);

      if (process.env.NODE_ENV !== 'production') {
        console.log('📝 Conta criada para:', userEmail, '- Tipo:', userType);
        return {
          success: true,
          messageId: 'dev-mode'
        };
      }

      throw error;
    }
  }
}

module.exports = new EmailService();