const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD
  }
});

async function sendWelcomeEmail(email, firstName, temporaryPassword) {
  try {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: '¡Bienvenido a Billiard Saloon! - Tu contraseña temporal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: #1a472a; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">🎱 Billiard Saloon</h1>
            <p style="margin: 10px 0 0 0;">Bienvenido a nuestro sistema</p>
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1a472a; margin-top: 0;">¡Hola ${firstName}!</h2>
            
            <p style="color: #333; line-height: 1.6;">
              Tu cuenta ha sido creada exitosamente en <strong>Billiard Saloon</strong>. 
              A continuación encontrarás tu contraseña temporal para ingresar al sistema.
            </p>
            
            <div style="background-color: #f9f9f9; border-left: 4px solid #1a472a; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #666;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 10px 0 0 0; color: #666;">
                <strong>Contraseña temporal:</strong> 
                <span style="font-family: monospace; background-color: #e8e8e8; padding: 5px 10px; border-radius: 3px;">
                  ${temporaryPassword}
                </span>
              </p>
            </div>
            
            <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 5px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #856404;">
                <strong>⚠️ Importante:</strong> Por favor, cambia tu contraseña en el primer inicio de sesión 
                para mayor seguridad de tu cuenta.
              </p>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin: 20px 0;">
              Si no creaste esta cuenta o tienes alguna pregunta, 
              por favor contacta con nuestro equipo de soporte.
            </p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                © 2025 Billiard Saloon. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Email enviado correctamente' };
  } catch (error) {
    console.error('Error enviando email:', error);
    throw new Error(`Error al enviar email: ${error.message}`);
  }
}

async function sendPasswordResetEmail(email, resetCode) {
  try {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Código de restablecimiento de contraseña - Billiard Saloon',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: #1a472a; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">🎱 Billiard Saloon</h1>
            <p style="margin: 10px 0 0 0;">Restablecimiento de contraseña</p>
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1a472a; margin-top: 0;">Solicitud de restablecimiento</h2>
            
            <p style="color: #333; line-height: 1.6;">
              Recibimos una solicitud para restablecer tu contraseña. 
              Usa el siguiente código de verificación para continuar:
            </p>
            
            <div style="background-color: #f9f9f9; border-left: 4px solid #1a472a; padding: 20px; margin: 20px 0; text-align: center;">
              <p style="margin: 0; color: #666; font-size: 14px;"><strong>Tu código de verificación:</strong></p>
              <p style="margin: 15px 0 0 0; color: #1a472a; font-size: 32px; font-weight: bold; letter-spacing: 5px; font-family: monospace;">
                ${resetCode}
              </p>
            </div>
            
            <div style="background-color: #ffe8e8; border: 1px solid #ff6b6b; border-radius: 5px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #c92a2a;">
                <strong>⏱️ Importante:</strong> Este código expirará en 10 minutos. 
                No compartas este código con nadie.
              </p>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin: 20px 0;">
              Si no solicitaste restablecer tu contraseña, por favor ignora este correo. 
              Tu cuenta seguirá siendo segura.
            </p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                © 2025 Billiard Saloon. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Email de restablecimiento enviado' };
  } catch (error) {
    console.error('Error enviando email:', error);
    throw new Error(`Error al enviar email: ${error.message}`);
  }
}

module.exports = { sendWelcomeEmail, sendPasswordResetEmail };
