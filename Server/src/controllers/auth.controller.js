const bcrypt = require('bcrypt');
const userService = require('../services/user.service');
const emailService = require('../services/email.service');
const authService = require('../services/auth.service');
const ApiError = require('../middlewares/apiError');

function generateTemporaryPassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

async function register(req, res, next) {
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
      status: 1
    };

    const newUser = await userService.createUser(userData);

    await emailService.sendWelcomeEmail(email, first_name, temporaryPassword);

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

async function changeTemporaryPassword(req, res, next) {
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

async function requestPasswordReset(req, res, next) {
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
      message: 'Código verificado correctamente',
      data: {
        verified: true
      }
    });

  } catch (err) {
    next(err);
  }
}

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

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, 'MISSING_FIELDS', 'Email y contraseña son requeridos');
    }

    const user = await userService.getUserByEmail(email);
    if (!user) {
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'Email o contraseña incorrectos');
    }

    const userWithPassword = await userService.getUser(user.id);
    if (!userWithPassword) {
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'Email o contraseña incorrectos');
    }

    const isPasswordValid = await bcrypt.compare(password, userWithPassword.password_hash);
    if (!isPasswordValid) {
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'Email o contraseña incorrectos');
    }

    const token = authService.generateToken(user.id, user.role_id, user.email);
    const refreshToken = authService.generateRefreshToken(user.id);

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

async function refreshTokenEndpoint(req, res, next) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ApiError(400, 'MISSING_REFRESH_TOKEN', 'Refresh token es requerido');
    }

    const decoded = authService.verifyToken(refreshToken);
    
    const user = await userService.getUser(decoded.user_id);
    if (!user) {
      throw new ApiError(401, 'USER_NOT_FOUND', 'Usuario no encontrado');
    }

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

module.exports = { register, changeTemporaryPassword, requestPasswordReset, verifyResetCode, resetPassword, login, refreshTokenEndpoint, logout };
