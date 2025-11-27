const express = require('express');
const controller = require('../controllers/user.controller');

const router = express.Router();

// Solo crear usuario
router.post('/', controller.create);

module.exports = router;
