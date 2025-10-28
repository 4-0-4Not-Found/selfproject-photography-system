const express = require("express");
const router = express.Router();
const userController = require("../Controllers/userController");
const { authenticate, isAdmin } = require("../Middleware/authMiddleware");

// Public routes
router.post("/register", userController.register);
router.post("/login", userController.login);

// ADMIN ROUTES - ADD THESE
router.get("/", authenticate, isAdmin, userController.getAllUsers);
router.get("/:id", authenticate, isAdmin, userController.getUserById);
router.patch("/:id/role", authenticate, isAdmin, userController.updateUserRole);

module.exports = router;