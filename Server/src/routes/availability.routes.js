const express = require("express");
const router = express.Router();
const availabilityController = require("../controllers/availability.controller");

/**
 * GET /api/availability/:tableId?date=YYYY-MM-DD
 * Get available time slots for a table on a specific date
 * Uses system settings for opening/closing hours
 */
router.get("/:tableId", availabilityController.getAvailableSlots);

module.exports = router;
