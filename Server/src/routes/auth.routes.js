const express = require('express');
const authController = require('../controllers/auth.controller');

const router = express.Router();

/**
 * POST /auth/register
 * Registrar nuevo usuario con email y contraseña temporal
 * Body: { first_name, last_name, email }
 */
router.post('/register', authController.register);

/**
 * POST /auth/login
 * Login con email y contraseña
 * Body: { email, password }
 * Response: { token, refreshToken, user }
 */
router.post('/login', authController.login);

/**
 * POST /auth/refresh-token
 * Renovar token usando refresh token
 * Body: { refreshToken }
 */
router.post('/refresh-token', authController.refreshTokenEndpoint);

/**
 * POST /auth/logout
 * Cerrar sesión
 */
router.post('/logout', authController.logout);

/**
 * POST /auth/change-temporary-password
 * Cambiar contraseña temporal por una nueva (requiere autenticación)
 * Body: { newPassword, confirmPassword }
 */
router.post('/change-temporary-password', authController.changeTemporaryPassword);

/**
 * POST /auth/request-password-reset
 * Solicitar restablecimiento de contraseña
 * Body: { email }
 */
router.post('/request-password-reset', authController.requestPasswordReset);

module.exports = router;
