const express = require('express');
const controller = require('../controllers/reservation.controller');

const router = express.Router();

router.get('/', controller.getAll);
router.get('/available-slots', controller.getAvailableSlots); // Must be before /:id
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id/approve', controller.approve);
router.patch('/:id/reject', controller.reject);
router.delete('/:id', controller.deleteReservation);

module.exports = router;
