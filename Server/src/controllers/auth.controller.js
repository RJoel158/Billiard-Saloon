const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query } = require('../db/db');
const ApiError = require('../middlewares/apiError');

const JWT_SECRET = process.env.JWT_SECRET || 'billiard-secret-key-2024';
const JWT_EXPIRES_IN = '7d';

class AuthController {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new ApiError(400, 'Email y contraseña son requeridos');
      }

      // Buscar usuario por email
      const sql = `
        SELECT u.*, r.name as role_name 
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.email = ?
      `;
      const users = await query(sql, [email]);

      if (users.length === 0) {
        throw new ApiError(401, 'Credenciales inválidas');
      }

      const user = users[0];

      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new ApiError(401, 'Credenciales inválidas');
      }

      // Generar token JWT
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email,
          role_id: user.role_id 
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // Remover password de la respuesta
      delete user.password;

      res.json({
        success: true,
        token,
        user,
      });
    } catch (error) {
      next(error);
    }
  }

  async register(req, res, next) {
    try {
      const { email, password, first_name, last_name, role_id = 2 } = req.body;

      if (!email || !password || !first_name || !last_name) {
        throw new ApiError(400, 'Todos los campos son requeridos');
      }

      // Verificar si el email ya existe
      const existingUsers = await query('SELECT id FROM users WHERE email = ?', [email]);
      if (existingUsers.length > 0) {
        throw new ApiError(400, 'El email ya está registrado');
      }

      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crear usuario
      const sql = `
        INSERT INTO users (role_id, first_name, last_name, email, password)
        VALUES (?, ?, ?, ?, ?)
      `;
      const result = await query(sql, [role_id, first_name, last_name, email, hashedPassword]);

      // Generar token
      const token = jwt.sign(
        { 
          id: result.insertId, 
          email,
          role_id 
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      res.status(201).json({
        success: true,
        token,
        user: {
          id: result.insertId,
          email,
          first_name,
          last_name,
          role_id,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async me(req, res, next) {
    try {
      const userId = req.user.id;

      const sql = `
        SELECT u.*, r.name as role_name 
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.id = ?
      `;
      const users = await query(sql, [userId]);

      if (users.length === 0) {
        throw new ApiError(404, 'Usuario no encontrado');
      }

      const user = users[0];
      delete user.password;

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
