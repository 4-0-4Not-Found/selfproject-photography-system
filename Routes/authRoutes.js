// Routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../Controllers/authController");
const { authenticate } = require("../Middleware/authMiddleware");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", authenticate, authController.me);

module.exports = router;
