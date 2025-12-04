const express = require('express');
const controller = require('../controllers/penalty.controller');
const router = express.Router();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.get('/session/:sessionId', controller.getBySessionId);
router.post('/', controller.create);
router.delete('/:id', controller.deletePenalty);

module.exports = router;
