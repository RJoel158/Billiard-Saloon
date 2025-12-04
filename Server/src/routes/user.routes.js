const express = require('express');
const controller = require('../controllers/user.controller');

const router = express.Router();

router.get('/', controller.getAll);
router.get('/search', controller.search);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.deleteUser);

module.exports = router;
