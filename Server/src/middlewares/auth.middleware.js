const authService = require('../services/auth.service');
const ApiError = require('./apiError');

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'MISSING_TOKEN', 'Token no proporcionado. Use: Authorization: Bearer <token>');
    }

    const token = authHeader.substring(7);

    const decoded = authService.verifyToken(token);
    req.user = decoded; // Agregar usuario al request

    next();
  } catch (err) {
    next(new ApiError(401, 'INVALID_TOKEN', err.message || 'Token inválido'));
  }
}

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
