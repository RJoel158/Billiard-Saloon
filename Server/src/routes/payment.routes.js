const express = require('express');
const controller = require('../controllers/payment.controller');

const router = express.Router();

router.get('/:id', controller.getById);
router.post('/', controller.create);

module.exports = router;
