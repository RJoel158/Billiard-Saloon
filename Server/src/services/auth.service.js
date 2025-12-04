const jwt = require('jsonwebtoken');

/**
 * Generar JWT token
 * @param {number} userId - ID del usuario
 * @param {number} roleId - ID del rol
 * @param {string} email - Email del usuario
 * @returns {string} JWT Token
 */
function generateToken(userId, roleId, email) {
  const payload = {
    user_id: userId,
    role_id: roleId,
    email: email
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key-change-in-production', {
    expiresIn: '24h' // Token válido por 24 horas
  });

  return token;
}

/**
 * Verificar JWT token
 * @param {string} token - JWT Token
 * @returns {object} Payload decodificado
 */
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    return decoded;
  } catch (error) {
    throw new Error(`Token inválido: ${error.message}`);
  }
}

/**
 * Generar Refresh Token (válido por más tiempo)
 * @param {number} userId - ID del usuario
 * @returns {string} Refresh Token
 */
function generateRefreshToken(userId) {
  const payload = { user_id: userId };
  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET || 'refresh-secret-key', {
    expiresIn: '7d' // Válido por 7 días
  });
  return refreshToken;
}

module.exports = {
  generateToken,
  verifyToken,
  generateRefreshToken
};
