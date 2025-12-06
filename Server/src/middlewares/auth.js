const jwt = require('jsonwebtoken');
const ApiError = require('./apiError');

const JWT_SECRET = process.env.JWT_SECRET || 'billiard-secret-key-2024';

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Token no proporcionado');
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(new ApiError(401, 'Token inválido'));
    } else if (error.name === 'TokenExpiredError') {
      next(new ApiError(401, 'Token expirado'));
    } else {
      next(error);
    }
  }
};

module.exports = authMiddleware;
