const express = require("express");
const router = express.Router();
const orderController = require("../Controllers/orderController");
const { authenticate, isAdmin } = require("../Middleware/authMiddleware");

// customer creates an order
router.post("/", authenticate, orderController.createOrder);

// customer gets their orders
router.get("/my", authenticate, orderController.getMyOrders);

// customer cancels their order (pending only)
router.patch("/my/:id/cancel", authenticate, orderController.cancelMyOrder);

// customer deletes order (completed/canceled only)
router.delete("/my/:id/delete", authenticate, orderController.deleteMyOrder);

// customer batch deletes orders
router.post("/my/batch-delete", authenticate, orderController.batchDeleteMyOrders);

// admin manages orders
router.get("/", authenticate, isAdmin, orderController.getOrders);
router.put("/:id", authenticate, isAdmin, orderController.updateOrder);
router.delete("/:id", authenticate, isAdmin, orderController.deleteOrder);
// RESTORE ROUTE:
router.patch("/:id/restore", authenticate, isAdmin, orderController.restoreOrder);

// admin batch deletes orders
router.post("/batch-delete", authenticate, isAdmin, orderController.batchDeleteOrders);

module.exports = router;