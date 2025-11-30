const express = require('express');
const controller = require('../controllers/payment.controller');

const router = express.Router();

router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.delete('/:id', controller.del);

module.exports = router;
