const express = require("express");
const orderController = require("../Controllers/orderController"); // import everything

const router = express.Router();

router.post("/", orderController.createOrder);   // Create order
router.get("/", orderController.getOrders);     // Get all orders
router.get("/:id", orderController.getOrderById); // Get by ID

module.exports = router;
