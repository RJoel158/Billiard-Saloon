const express = require('express');
const authController = require('../controllers/auth.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/register', authController.register);

router.post('/login', authController.login);

router.post('/change-temporary-password', authController.changeTemporaryPassword);

router.post('/refresh-token', authController.refreshTokenEndpoint);

router.post('/logout', authController.logout);

router.post('/request-password-reset', authController.requestPasswordReset);

router.post('/verify-reset-code', authController.verifyResetCode);

router.post('/reset-password', authController.resetPassword);

module.exports = router;
