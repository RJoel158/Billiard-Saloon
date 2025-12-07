const express = require('express');
const controller = require('../controllers/reservation.controller');
const { validateReservation } = require('../middlewares/validateReservation');

const router = express.Router();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', validateReservation, controller.create);
router.put('/:id', validateReservation, controller.update);
router.delete('/:id', controller.deleteReservation);

module.exports = router;
