const { Order, User, Service, Photo, Payment } = require("../Models");

// Customer creates order
exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id; // from token
    const { serviceId, deliveryMethod, deliveryAddress } = req.body;

    const order = await Order.create({
      userId,
      serviceId,
      deliveryMethod, 
      deliveryAddress,
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Customer gets their orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [Service, Photo, Payment],
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Customer Cancellation
exports.cancelMyOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find the order and verify it belongs to the user
    const order = await Order.findOne({ 
      where: { id, userId } 
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found or you don't have permission" });
    }

    // Only allow cancellation of pending orders (like bookings)
    if (order.status !== 'pending') {
      return res.status(400).json({ error: "Can only cancel pending orders" });
    }

    // Update status to canceled
    order.status = 'canceled';
    await order.save();

    res.json({ message: "Order canceled successfully", order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin: get all orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [User, Service, Photo, Payment],
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get order by ID (admin only)
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [User, Service, Photo, Payment],
    });
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin updates order
exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Order.update(req.body, { where: { id } });
    if (!updated) return res.status(404).json({ error: "Order not found" });
    const updatedOrder = await Order.findByPk(id);
    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin deletes order
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Order.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ error: "Order not found" });
    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
