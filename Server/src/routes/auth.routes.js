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
