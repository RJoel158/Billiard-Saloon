const jwt = require('jsonwebtoken');

function generateToken(userId, roleId, email) {
  const payload = {
    user_id: userId,
    role_id: roleId,
    email: email
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key-change-in-production', {
    expiresIn: '24h'
  });

  return token;
}

function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    return decoded;
  } catch (error) {
    throw new Error(`Token inválido: ${error.message}`);
  }
}

function generateRefreshToken(userId) {
  const payload = { user_id: userId };
  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET || 'refresh-secret-key', {
    expiresIn: '7d'
  });
  return refreshToken;
}

module.exports = {
  generateToken,
  verifyToken,
  generateRefreshToken
};
