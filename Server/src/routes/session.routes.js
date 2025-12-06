const express = require('express');
const controller = require('../controllers/session.controller');

const router = express.Router();

router.get('/', controller.getAll);
router.get('/active', controller.getActive);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.post('/:id/finalize', controller.finalize);
router.put('/:id', controller.update);
router.delete('/:id', controller.deleteSession);

module.exports = router;
