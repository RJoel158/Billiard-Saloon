const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth");

router.post("/login", authController.login);
router.post("/register", authController.register);
router.get("/me", authMiddleware, authController.me);

module.exports = router;
