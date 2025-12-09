const express = require("express");
const controller = require("../controllers/billiard-table.controller");

const router = express.Router();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.deleteTable);
router.patch("/:id/occupy", controller.markAsOccupied);
router.patch("/:id/reserve", controller.markAsReserved);

module.exports = router;
