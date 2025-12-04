const bcrypt = require('bcrypt');
const userService = require('../services/user.service');
const emailService = require('../services/email.service');
const authService = require('../services/auth.service');
const ApiError = require('../middlewares/apiError');

/**
 * Generar una contraseña temporal aleatoria
 * @returns {string} Contraseña temporal
 */
function generateTemporaryPassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/**
 * Registrar un nuevo usuario y enviar email con contraseña temporal
 */
async function register(req, res, next) {
  try {
    const { first_name, last_name, email } = req.body;

    // Validar datos requeridos
    if (!first_name || !last_name || !email) {
      throw new ApiError(400, 'MISSING_FIELDS', 'Faltan campos requeridos: first_name, last_name, email');
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ApiError(400, 'INVALID_EMAIL', 'El email no es válido');
    }

    // Verificar si el email ya existe
    const existingUser = await userService.getUserByEmail(email);
    if (existingUser) {
      throw new ApiError(409, 'EMAIL_EXISTS', 'El email ya está registrado');
    }

    // Generar contraseña temporal
    const temporaryPassword = generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    // Crear usuario con rol de cliente (role_id = 2)
    const userData = {
      first_name,
      last_name,
      email,
      password_hash: hashedPassword,
      role_id: 2, // Cliente
      status: 1 // Activo
    };

    const newUser = await userService.createUser(userData);

    // Enviar email con contraseña temporal
    await emailService.sendWelcomeEmail(email, first_name, temporaryPassword);

    // Responder sin incluir la contraseña
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

/**
 * Cambiar contraseña temporal por una nueva (en primer login)
 */
async function changeTemporaryPassword(req, res, next) {
  try {
    const { user_id } = req.user; // Asumiendo que viene del middleware de autenticación
    const { newPassword, confirmPassword } = req.body;

    // Validar que las contraseñas coincidan
    if (newPassword !== confirmPassword) {
      throw new ApiError(400, 'PASSWORDS_MISMATCH', 'Las contraseñas no coinciden');
    }

    // Validar longitud mínima
    if (newPassword.length < 8) {
      throw new ApiError(400, 'WEAK_PASSWORD', 'La contraseña debe tener al menos 8 caracteres');
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña del usuario
    const updatedUser = await userService.updateUser(user_id, {
      password_hash: hashedPassword
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

/**
 * Solicitar restablecimiento de contraseña
 */
async function requestPasswordReset(req, res, next) {
  try {
    const { email } = req.body;

    if (!email) {
      throw new ApiError(400, 'EMAIL_REQUIRED', 'El email es requerido');
    }

    const user = await userService.getUserByEmail(email);
    
    // No revelar si el email existe o no por seguridad
    if (!user) {
      return res.json({
        success: true,
        message: 'Si el email existe en nuestro sistema, recibirás un correo con instrucciones'
      });
    }

    // Generar token de restablecimiento (en producción usar JWT o similar)
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

    // Guardar token en la BD (necesitarías agregar columnas reset_token y reset_token_expiry)
    await userService.updateUser(user.id, {
      reset_token: resetToken,
      reset_token_expiry: resetTokenExpiry
    });

    // Enviar email
    await emailService.sendPasswordResetEmail(email, resetToken);

    res.json({
      success: true,
      message: 'Si el email existe en nuestro sistema, recibirás un correo con instrucciones'
    });

  } catch (err) {
    next(err);
  }
}

/**
 * Login de usuario con email y contraseña
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Validar campos requeridos
    if (!email || !password) {
      throw new ApiError(400, 'MISSING_FIELDS', 'Email y contraseña son requeridos');
    }

    // Buscar usuario por email
    const user = await userService.getUserByEmail(email);
    if (!user) {
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'Email o contraseña incorrectos');
    }

    // Obtener usuario con contraseña para validación
    const userWithPassword = await userService.getUser(user.id);
    if (!userWithPassword) {
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'Email o contraseña incorrectos');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, userWithPassword.password_hash);
    if (!isPasswordValid) {
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'Email o contraseña incorrectos');
    }

    // Generar tokens
    const token = authService.generateToken(user.id, user.role_id, user.email);
    const refreshToken = authService.generateRefreshToken(user.id);

    // Responder con datos del usuario y tokens
    res.json({
      success: true,
      message: 'Autenticación exitosa',
      data: {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role_id: user.role_id
        },
        token,
        refreshToken
      }
    });

  } catch (err) {
    next(err);
  }
}

/**
 * Renovar token usando refresh token
 */
async function refreshTokenEndpoint(req, res, next) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ApiError(400, 'MISSING_REFRESH_TOKEN', 'Refresh token es requerido');
    }

    // Verificar refresh token
    const decoded = authService.verifyToken(refreshToken);
    
    // Obtener usuario
    const user = await userService.getUser(decoded.user_id);
    if (!user) {
      throw new ApiError(401, 'USER_NOT_FOUND', 'Usuario no encontrado');
    }

    // Generar nuevo token
    const newToken = authService.generateToken(user.id, user.role_id, user.email);

    res.json({
      success: true,
      message: 'Token renovado',
      data: {
        token: newToken,
        refreshToken: authService.generateRefreshToken(user.id)
      }
    });

  } catch (err) {
    next(err);
  }
}

/**
 * Logout (solo limpia el token en el cliente)
 */
async function logout(req, res, next) {
  try {
    res.json({
      success: true,
      message: 'Sesión cerrada correctamente'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, changeTemporaryPassword, requestPasswordReset, login, refreshTokenEndpoint, logout };
