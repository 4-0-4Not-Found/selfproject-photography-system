const express = require("express");
const router = express.Router();
const orderController = require("../Controllers/orderController");
const { authenticate, isAdmin } = require("../Middleware/authMiddleware");

// customer creates an order
router.post("/", authenticate, orderController.createOrder);

// customer gets their orders
router.get("/my", authenticate, orderController.getMyOrders);

// admin manages orders
router.get("/", authenticate, isAdmin, orderController.getOrders);
router.put("/:id", authenticate, isAdmin, orderController.updateOrder);

module.exports = router;
