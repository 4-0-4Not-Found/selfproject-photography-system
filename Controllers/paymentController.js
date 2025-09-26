// Controllers/paymentController.js
const { Payment, Order } = require("../Models");

// Customer creates a payment for their order
exports.createPayment = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware
    const { amount, method, orderId } = req.body;

    if (!amount || !method || !orderId) {
      return res.status(400).json({ error: "amount, method, and orderId are required" });
    }

    // Check if order belongs to this user
    const order = await Order.findByPk(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.userId !== userId) {
      return res.status(403).json({ error: "Not allowed to pay for this order" });
    }

    // Create payment with pending status
    const payment = await Payment.create({
      amount,
      method,
      orderId,
      status: method === "cash" ? "pending" : "pending", // can auto-complete cash later
    });

    res.status(201).json({ message: "Payment created", data: payment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Customer can view their own payment for an order
exports.getMyPaymentByOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;

    const order = await Order.findByPk(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.userId !== userId) {
      return res.status(403).json({ error: "Not allowed to view this payment" });
    }

    const payment = await Payment.findOne({ where: { orderId } });
    if (!payment) return res.status(404).json({ error: "No payment found for this order" });

    res.json({ message: "Payment fetched", data: payment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin: view all payments
exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.findAll();
    res.json({ message: "Payments fetched", data: payments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin: update payment status (completed/failed)
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "completed", "failed"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const payment = await Payment.findByPk(id);
    if (!payment) return res.status(404).json({ error: "Payment not found" });

    payment.status = status;
    await payment.save();

    res.json({ message: "Payment status updated", data: payment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
