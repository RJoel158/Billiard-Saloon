const express = require('express');
const controller = require('../controllers/user.controller');

const router = express.Router();

router.get('/:id', controller.getById);
router.post('/', controller.create);

module.exports = router;
