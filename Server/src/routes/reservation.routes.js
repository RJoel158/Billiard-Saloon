const express = require('express');
const controller = require('../controllers/reservation.controller');
const { authenticate } = require('../middlewares/authenticate');

const router = express.Router();

router.get('/', controller.getAll);
router.get('/pending', controller.getPending);
router.get('/my-reservations', authenticate, controller.getUserReservations);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.post('/:id/confirm', controller.confirm);
router.post('/:id/cancel', controller.cancel);
router.put('/:id', controller.update);
router.delete('/:id', controller.deleteReservation);

module.exports = router;
