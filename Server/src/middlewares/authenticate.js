const authService = require('../services/auth.service');
const ApiError = require('./apiError');

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'NO_TOKEN', 'No token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const user = await authService.verifyToken(token);
    
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'UNAUTHORIZED', 'Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role_id)) {
      return next(new ApiError(403, 'FORBIDDEN', 'Insufficient permissions'));
    }

    next();
  };
}

module.exports = { authenticate, requireRole };
