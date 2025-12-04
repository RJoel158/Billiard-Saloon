const express = require('express');
const controller = require('../controllers/dashboard.controller');

const router = express.Router();

router.get('/stats', controller.getStats);
router.get('/revenue', controller.getRevenueReport);
router.get('/table-usage', controller.getTableUsage);
router.get('/payment-methods', controller.getPaymentMethods);
router.get('/peak-hours', controller.getPeakHours);

module.exports = router;
