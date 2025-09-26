// Routes/paymentRoutes.js
const express = require("express");
const router = express.Router();
const paymentController = require("../Controllers/paymentController");
const { authenticate, isAdmin } = require("../Middleware/authMiddleware");

// customer: create payment for own order
router.post("/", authenticate, paymentController.createPayment);

// customer: view their payment for a specific order
router.get("/order/:orderId", authenticate, paymentController.getMyPaymentByOrder);

// admin: view all payments
router.get("/", authenticate, isAdmin, paymentController.getPayments);

// admin: update payment status
router.put("/:id/status", authenticate, isAdmin, paymentController.updatePaymentStatus);

module.exports = router;
