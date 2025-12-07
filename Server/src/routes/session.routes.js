const express = require('express');
const controller = require('../controllers/session.controller');

const router = express.Router();

router.get('/', controller.getAll);
router.get('/active', controller.getActive);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.post('/start', controller.start); // Start a session (walk-in or reservation)
router.post('/:id/finalize', controller.finalize); // Finalize with payment
router.post('/:id/end', controller.end);   // End an active session (simple)
router.put('/:id', controller.update);
router.delete('/:id', controller.deleteSession);

module.exports = router;
