const express = require('express');
const controller = require('../controllers/reservation.controller');
const { validateReservation } = require('../middlewares/validateReservation');
const upload = require('../middlewares/upload');

const router = express.Router();

router.get('/', controller.getAll);
router.get('/available-slots', controller.getAvailableSlots); // Must be before /:id
router.get('/:id', controller.getById);
router.get('/:id/qr', controller.getQRImage); // Serve QR payment image
router.post('/', upload.single('qr_payment'), validateReservation, controller.create);
router.put('/:id', validateReservation, controller.update);
router.patch('/:id/approve', controller.approve);
router.patch('/:id/reject', controller.reject);
router.delete('/:id', controller.deleteReservation);

module.exports = router;
