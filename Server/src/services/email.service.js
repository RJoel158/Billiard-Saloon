const nodemailer = require('nodemailer');

// Configurar el transporte de Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD
  }
});

/**
 * Enviar email de bienvenida con contraseña temporal
 * @param {string} email - Email del usuario
 * @param {string} firstName - Nombre del usuario
 * @param {string} temporaryPassword - Contraseña temporal generada
 */
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

/**
 * Enviar email de restablecimiento de contraseña
 * @param {string} email - Email del usuario
 * @param {string} resetToken - Token para restablecer contraseña
 */
async function sendPasswordResetEmail(email, resetToken) {
  try {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Restablece tu contraseña - Billiard Saloon',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1a472a;">Restablecimiento de contraseña</h2>
          <p>Recibimos una solicitud para restablecer tu contraseña.</p>
          <p>
            <a href="${resetLink}" 
               style="background-color: #1a472a; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Restablecer contraseña
            </a>
          </p>
          <p style="color: #666; font-size: 12px;">
            Este enlace expirará en 1 hora. Si no solicitaste esto, ignora este correo.
          </p>
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
