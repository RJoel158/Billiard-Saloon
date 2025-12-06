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
 * Cambiar contraseña temporal por una nueva (primera vez después de login)
 * No requiere autenticación previa, solo email y contraseña temporal
 */
async function changeTemporaryPassword(req, res, next) {
  try {
    const { email, temporaryPassword, newPassword, confirmPassword } = req.body;

    // Validar campos requeridos
    if (!email || !temporaryPassword || !newPassword || !confirmPassword) {
      throw new ApiError(400, 'MISSING_FIELDS', 'Todos los campos son requeridos');
    }

    // Validar que las nuevas contraseñas coincidan
    if (newPassword !== confirmPassword) {
      throw new ApiError(400, 'PASSWORDS_MISMATCH', 'Las nuevas contraseñas no coinciden');
    }

    // Validar longitud mínima
    if (newPassword.length < 8) {
      throw new ApiError(400, 'WEAK_PASSWORD', 'La contraseña debe tener al menos 8 caracteres');
    }

    // Buscar usuario por email
    const user = await userService.getUserByEmail(email);
    if (!user) {
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'Email o contraseña incorrectos');
    }

    // Obtener usuario con contraseña
    const userWithPassword = await userService.getUser(user.id);
    if (!userWithPassword) {
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'Email o contraseña incorrectos');
    }

    // Verificar que la contraseña temporal sea correcta
    const isTemporaryPasswordValid = await bcrypt.compare(temporaryPassword, userWithPassword.password_hash);
    if (!isTemporaryPasswordValid) {
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'Contraseña incorrecta');
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña del usuario y establecer password_changed a 1
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

/**
 * Cambiar contraseña (requiere autenticación - para cambios posteriores)
 */
async function changePassword(req, res, next) {
  try {
    const { user_id } = req.user; // Viene del middleware de autenticación
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validar campos requeridos
    if (!currentPassword || !newPassword || !confirmPassword) {
      throw new ApiError(400, 'MISSING_FIELDS', 'Todos los campos son requeridos');
    }

    // Validar que las nuevas contraseñas coincidan
    if (newPassword !== confirmPassword) {
      throw new ApiError(400, 'PASSWORDS_MISMATCH', 'Las nuevas contraseñas no coinciden');
    }

    // Validar longitud mínima
    if (newPassword.length < 8) {
      throw new ApiError(400, 'WEAK_PASSWORD', 'La contraseña debe tener al menos 8 caracteres');
    }

    // Obtener usuario con contraseña
    const userWithPassword = await userService.getUser(user_id);
    if (!userWithPassword) {
      throw new ApiError(401, 'USER_NOT_FOUND', 'Usuario no encontrado');
    }

    // Verificar contraseña actual
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, userWithPassword.password_hash);
    if (!isCurrentPasswordValid) {
      throw new ApiError(401, 'INVALID_PASSWORD', 'La contraseña actual es incorrecta');
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
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
 * Genera un código de 6 dígitos y lo envía por email
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

    // Generar código de 6 dígitos aleatorio
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetCodeExpiry = new Date(Date.now() + 600000); // 10 minutos de expiración

    // Guardar código en la BD (si falla, intentamos de todas formas enviar email)
    try {
      await userService.updateUser(user.id, {
        reset_code: resetCode,
        reset_code_expiry: resetCodeExpiry
      });
    } catch (dbError) {
      console.error('Error guardando código en BD:', dbError.message);
      // Continuamos de todas formas para enviar el email
    }

    // Enviar email con el código (si falla, aún retornamos éxito por seguridad)
    try {
      await emailService.sendPasswordResetEmail(email, resetCode);
    } catch (emailError) {
      console.error('Error enviando email:', emailError.message);
      // No lanzamos error, solo registramos
    }

    res.json({
      success: true,
      message: 'Si el email existe en nuestro sistema, recibirás un correo con instrucciones'
    });

  } catch (err) {
    next(err);
  }
}

/**
 * Verificar código de restablecimiento
 */
async function verifyResetCode(req, res, next) {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      throw new ApiError(400, 'MISSING_FIELDS', 'Email y código son requeridos');
    }

    const user = await userService.getUserByEmail(email);
    if (!user) {
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'Email no encontrado');
    }

    // Obtener usuario con reset_code
    const userWithCode = await userService.getUser(user.id);
    if (!userWithCode) {
      throw new ApiError(401, 'USER_NOT_FOUND', 'Usuario no encontrado');
    }

    if (!userWithCode.reset_code) {
      throw new ApiError(400, 'NO_RESET_REQUEST', 'No hay solicitud de restablecimiento activa. Por favor, solicita un nuevo código.');
    }

    // Verificar que el código no haya expirado
    if (userWithCode.reset_code_expiry) {
      const expiryDate = new Date(userWithCode.reset_code_expiry);
      const now = new Date();
      if (now > expiryDate) {
        throw new ApiError(400, 'EXPIRED_CODE', 'El código de verificación ha expirado. Por favor, solicita uno nuevo.');
      }
    }

    // Verificar que el código sea correcto
    if (userWithCode.reset_code !== code.toString()) {
      throw new ApiError(400, 'INVALID_CODE', 'El código de verificación es incorrecto');
    }

    res.json({
      success: true,
      message: 'Código verificado correctamente',
      data: {
        verified: true
      }
    });

  } catch (err) {
    next(err);
  }
}

/**
 * Restablecer contraseña con código verificado
 */
async function resetPassword(req, res, next) {
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

    // Obtener usuario con reset_code
    const userWithCode = await userService.getUser(user.id);
    if (!userWithCode) {
      throw new ApiError(401, 'USER_NOT_FOUND', 'Usuario no encontrado');
    }

    if (!userWithCode.reset_code) {
      throw new ApiError(400, 'NO_RESET_REQUEST', 'No hay solicitud de restablecimiento activa. Por favor, solicita un nuevo código.');
    }

    // Verificar que el código no haya expirado
    if (userWithCode.reset_code_expiry) {
      const expiryDate = new Date(userWithCode.reset_code_expiry);
      const now = new Date();
      if (now > expiryDate) {
        throw new ApiError(400, 'EXPIRED_CODE', 'El código de verificación ha expirado. Por favor, solicita uno nuevo.');
      }
    }

    // Verificar que el código sea correcto
    if (userWithCode.reset_code !== code.toString()) {
      throw new ApiError(400, 'INVALID_CODE', 'El código de verificación es incorrecto');
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña y limpiar reset_code
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
          role_id: user.role_id,
          password_changed: user.password_changed
        },
        token,
        refreshToken,
        requiresPasswordChange: user.password_changed === 0
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

module.exports = { register, changeTemporaryPassword, changePassword, requestPasswordReset, verifyResetCode, resetPassword, login, refreshTokenEndpoint, logout };
