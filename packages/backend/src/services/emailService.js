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
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    
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
}

module.exports = new EmailService();