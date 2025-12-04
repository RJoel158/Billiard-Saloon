const authService = require('../services/auth.service');
const ApiError = require('./apiError');

/**
 * Middleware para verificar JWT token
 * Extrae el token del header Authorization y lo valida
 */
async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'MISSING_TOKEN', 'Token no proporcionado. Use: Authorization: Bearer <token>');
    }

    const token = authHeader.substring(7); // Remover "Bearer " del inicio

    const decoded = authService.verifyToken(token);
    req.user = decoded; // Agregar usuario al request

    next();
  } catch (err) {
    next(new ApiError(401, 'INVALID_TOKEN', err.message || 'Token inválido'));
  }
}

/**
 * Middleware para verificar que el usuario sea admin
 */
async function adminMiddleware(req, res, next) {
  try {
    if (!req.user) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Usuario no autenticado');
    }

    if (req.user.role_id !== 1) {
      throw new ApiError(403, 'FORBIDDEN', 'Acceso denegado. Se requieren permisos de administrador');
    }

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { authMiddleware, adminMiddleware };
