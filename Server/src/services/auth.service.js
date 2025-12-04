const userRepo = require('../repositories/user.repository');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ApiError = require('../middlewares/apiError');
const config = require('../config');

const JWT_SECRET = config.jwt.secret;
const JWT_EXPIRES_IN = config.jwt.expiresIn;

async function register(data) {
  // Validate required fields
  if (!data.email || !data.password || !data.first_name || !data.last_name) {
    throw new ApiError(400, 'MISSING_FIELDS', 'Email, password, first_name and last_name are required');
  }

  // Check if user already exists
  const existing = await userRepo.findByEmail(data.email);
  if (existing) {
    throw new ApiError(409, 'EMAIL_EXISTS', 'Email already registered');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(data.password, salt);

  // Create user with client role by default (role_id = 2)
  const user = await userRepo.create({
    role_id: data.role_id || 2,
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    password_hash,
    phone: data.phone || null,
  });

  // Generate token
  const token = jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role_id: user.role_id 
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role_id: user.role_id,
      phone: user.phone,
    },
    token,
  };
}

async function login(email, password) {
  // Validate input
  if (!email || !password) {
    throw new ApiError(400, 'MISSING_CREDENTIALS', 'Email and password are required');
  }

  // Find user with password hash
  const rows = await require('../db/db').query(
    'SELECT id, role_id, first_name, last_name, email, password_hash, phone, created_at, status FROM users WHERE email = ?',
    [email]
  );
  const user = rows[0];

  if (!user) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  // Check if user is active
  if (user.status !== 1) {
    throw new ApiError(403, 'ACCOUNT_DISABLED', 'Account is disabled');
  }

  // Verify password
  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  // Generate token
  const token = jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role_id: user.role_id 
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role_id: user.role_id,
      phone: user.phone,
    },
    token,
  };
}

async function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await userRepo.findById(decoded.id);
    if (!user) {
      throw new ApiError(401, 'USER_NOT_FOUND', 'User not found');
    }
    return user;
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      throw new ApiError(401, 'INVALID_TOKEN', 'Invalid token');
    }
    if (err.name === 'TokenExpiredError') {
      throw new ApiError(401, 'TOKEN_EXPIRED', 'Token expired');
    }
    throw err;
  }
}

module.exports = { register, login, verifyToken };
