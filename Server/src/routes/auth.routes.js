const express = require('express');
const authController = require('../controllers/auth.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

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
 * Response: { token, refreshToken, user, requiresPasswordChange }
 */
router.post('/login', authController.login);

/**
 * POST /auth/change-temporary-password
 * Cambiar contraseña temporal por una nueva (primera vez)
 * No requiere autenticación
 * Body: { email, temporaryPassword, newPassword, confirmPassword }
 */
router.post('/change-temporary-password', authController.changeTemporaryPassword);

/**
 * POST /auth/change-password
 * Cambiar contraseña (requiere autenticación - para cambios posteriores)
 * Body: { currentPassword, newPassword, confirmPassword }
 */
router.post('/change-password', authMiddleware, authController.changePassword);

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
 * POST /auth/request-password-reset
 * Solicitar restablecimiento de contraseña (envía código por email)
 * Body: { email }
 */
router.post('/request-password-reset', authController.requestPasswordReset);

/**
 * POST /auth/verify-reset-code
 * Verificar código de restablecimiento
 * Body: { email, code }
 */
router.post('/verify-reset-code', authController.verifyResetCode);

/**
 * POST /auth/reset-password
 * Restablecer contraseña con código verificado
 * Body: { email, code, newPassword, confirmPassword }
 */
router.post('/reset-password', authController.resetPassword);

module.exports = router;
