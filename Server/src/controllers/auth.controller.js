const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query } = require('../db/db');
const ApiError = require('../middlewares/apiError');
const userService = require('../services/user.service');
const emailService = require('../services/email.service');

const JWT_SECRET = process.env.JWT_SECRET || 'billiard-secret-key-2024';
const JWT_EXPIRES_IN = '7d';

function generateTemporaryPassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

class AuthController {
  // Registro de nuevo usuario (admin)
  async register(req, res, next) {
    try {
      const { first_name, last_name, email } = req.body;

      if (!first_name || !last_name || !email) {
        throw new ApiError(400, 'MISSING_FIELDS', 'Faltan campos requeridos: first_name, last_name, email');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new ApiError(400, 'INVALID_EMAIL', 'El email no es válido');
      }

      const existingUser = await userService.getUserByEmail(email);
      if (existingUser) {
        throw new ApiError(409, 'EMAIL_EXISTS', 'El email ya está registrado');
      }

      const temporaryPassword = generateTemporaryPassword();
      const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

      const userData = {
        first_name,
        last_name,
        email,
        password_hash: hashedPassword,
        role_id: 2,
        password_changed: 0
      };

      const newUser = await userService.createUser(userData);

      try {
        await emailService.sendWelcomeEmail(email, first_name, temporaryPassword);
      } catch (emailError) {
        console.error('Error enviando email:', emailError.message);
      }

      const { password_hash, ...userWithoutPassword } = newUser;
      
      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente. Revisa tu email para la contraseña temporal.',
        data: userWithoutPassword
      });

    } catch (err) {
      next(err);
    }
  }

  // Cambiar contraseña temporal en primer login
  async changeTemporaryPassword(req, res, next) {
    try {
      const { email, temporaryPassword, newPassword, confirmPassword } = req.body;

      if (!email || !temporaryPassword || !newPassword || !confirmPassword) {
        throw new ApiError(400, 'MISSING_FIELDS', 'Todos los campos son requeridos');
      }

      if (newPassword !== confirmPassword) {
        throw new ApiError(400, 'PASSWORDS_MISMATCH', 'Las nuevas contraseñas no coinciden');
      }

      if (newPassword.length < 8) {
        throw new ApiError(400, 'WEAK_PASSWORD', 'La contraseña debe tener al menos 8 caracteres');
      }

      const user = await userService.getUserByEmail(email);
      if (!user) {
        throw new ApiError(401, 'INVALID_CREDENTIALS', 'Email o contraseña incorrectos');
      }

      const userWithPassword = await userService.getUser(user.id);
      if (!userWithPassword) {
        throw new ApiError(401, 'INVALID_CREDENTIALS', 'Email o contraseña incorrectos');
      }

      const isTemporaryPasswordValid = await bcrypt.compare(temporaryPassword, userWithPassword.password_hash);
      if (!isTemporaryPasswordValid) {
        throw new ApiError(401, 'INVALID_CREDENTIALS', 'Email o contraseña incorrectos');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const updatedUser = await userService.updateUser(user.id, {
        password_hash: hashedPassword,
        password_changed: 1
      });

      const { password_hash, ...userWithoutPassword } = updatedUser;

      res.json({
        success: true,
        message: 'Contraseña actualizada exitosamente',
        data: userWithoutPassword
      });

    } catch (err) {
      next(err);
    }
  }

  // Solicitar restablecimiento de contraseña
  async requestPasswordReset(req, res, next) {
    try {
      const { email } = req.body;

      if (!email) {
        throw new ApiError(400, 'EMAIL_REQUIRED', 'El email es requerido');
      }

      const user = await userService.getUserByEmail(email);
      
      if (!user) {
        return res.json({
          success: true,
          message: 'Si el email existe en nuestro sistema, recibirás un correo con instrucciones'
        });
      }

      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      const resetCodeExpiry = new Date(Date.now() + 600000);

      try {
        await userService.updateUser(user.id, {
          reset_code: resetCode,
          reset_code_expiry: resetCodeExpiry
        });
      } catch (dbError) {
        console.error('Error guardando código en BD:', dbError.message);
      }

      try {
        await emailService.sendPasswordResetEmail(email, resetCode);
      } catch (emailError) {
        console.error('Error enviando email:', emailError.message);
      }

      res.json({
        success: true,
        message: 'Si el email existe en nuestro sistema, recibirás un correo con instrucciones'
      });

    } catch (err) {
      next(err);
    }
  }

  // Verificar código de restablecimiento
  async verifyResetCode(req, res, next) {
    try {
      const { email, code } = req.body;

      if (!email || !code) {
        throw new ApiError(400, 'MISSING_FIELDS', 'Email y código son requeridos');
      }

      const user = await userService.getUserByEmail(email);
      if (!user) {
        throw new ApiError(401, 'INVALID_CREDENTIALS', 'Email no encontrado');
      }

      const userWithCode = await userService.getUser(user.id);
      if (!userWithCode) {
        throw new ApiError(401, 'USER_NOT_FOUND', 'Usuario no encontrado');
      }

      if (!userWithCode.reset_code) {
        throw new ApiError(400, 'NO_RESET_REQUEST', 'No hay solicitud de restablecimiento activa. Por favor, solicita un nuevo código.');
      }

      if (userWithCode.reset_code_expiry) {
        const expiryDate = new Date(userWithCode.reset_code_expiry);
        const now = new Date();
        if (now > expiryDate) {
          throw new ApiError(400, 'EXPIRED_CODE', 'El código de verificación ha expirado. Por favor, solicita uno nuevo.');
        }
      }

      if (userWithCode.reset_code !== code.toString()) {
        throw new ApiError(400, 'INVALID_CODE', 'El código de verificación es incorrecto');
      }

      res.json({
        success: true,
        message: 'Código verificado correctamente'
      });

    } catch (err) {
      next(err);
    }
  }

  // Restablecer contraseña
  async resetPassword(req, res, next) {
    try {
      const { email, code, newPassword, confirmPassword } = req.body;

      if (!email || !code || !newPassword || !confirmPassword) {
        throw new ApiError(400, 'MISSING_FIELDS', 'Todos los campos son requeridos');
      }

      if (newPassword !== confirmPassword) {
        throw new ApiError(400, 'PASSWORDS_MISMATCH', 'Las contraseñas no coinciden');
      }

      if (newPassword.length < 8) {
        throw new ApiError(400, 'WEAK_PASSWORD', 'La contraseña debe tener al menos 8 caracteres');
      }

      const user = await userService.getUserByEmail(email);
      if (!user) {
        throw new ApiError(401, 'INVALID_CREDENTIALS', 'Email no encontrado');
      }

      const userWithCode = await userService.getUser(user.id);
      if (!userWithCode) {
        throw new ApiError(401, 'USER_NOT_FOUND', 'Usuario no encontrado');
      }

      if (!userWithCode.reset_code) {
        throw new ApiError(400, 'NO_RESET_REQUEST', 'No hay solicitud de restablecimiento activa. Por favor, solicita un nuevo código.');
      }

      if (userWithCode.reset_code_expiry) {
        const expiryDate = new Date(userWithCode.reset_code_expiry);
        const now = new Date();
        if (now > expiryDate) {
          throw new ApiError(400, 'EXPIRED_CODE', 'El código de verificación ha expirado. Por favor, solicita uno nuevo.');
        }
      }

      if (userWithCode.reset_code !== code.toString()) {
        throw new ApiError(400, 'INVALID_CODE', 'El código de verificación es incorrecto');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const updatedUser = await userService.updateUser(user.id, {
        password_hash: hashedPassword,
        reset_code: null,
        reset_code_expiry: null
      });

      const { password_hash, reset_code, reset_code_expiry, ...userWithoutSensitive } = updatedUser;

      res.json({
        success: true,
        message: 'Contraseña restablecida exitosamente',
        data: userWithoutSensitive
      });

    } catch (err) {
      next(err);
    }
  }

  // Login de usuario
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new ApiError(400, 'MISSING_FIELDS', 'Email y contraseña son requeridos');
      }

      const sql = `
        SELECT u.*, r.name as role_name 
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.email = ?
      `;
      const users = await query(sql, [email]);

      if (users.length === 0) {
        throw new ApiError(401, 'INVALID_CREDENTIALS', 'Credenciales inválidas');
      }

      const user = users[0];

      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        throw new ApiError(401, 'INVALID_CREDENTIALS', 'Credenciales inválidas');
      }

      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email,
          role_id: user.role_id 
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      delete user.password_hash;

      res.json({
        success: true,
        token,
        user,
        requiresPasswordChange: user.password_changed === 0
      });

    } catch (error) {
      next(error);
    }
  }

  // Obtener datos del usuario autenticado
  async me(req, res, next) {
    try {
      const userId = req.user.id;

      const sql = `
        SELECT u.*, r.name as role_name 
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.id = ?
      `;
      const users = await query(sql, [userId]);

      if (users.length === 0) {
        throw new ApiError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
      }

      const user = users[0];
      delete user.password_hash;

      res.json({
        success: true,
        data: user
      });

    } catch (error) {
      next(error);
    }
  }

  // Logout
  async logout(req, res, next) {
    try {
      res.json({
        success: true,
        message: 'Sesión cerrada correctamente'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
