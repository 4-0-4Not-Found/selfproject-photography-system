const { Order, User, Service, Photo, Payment } = require("../Models");

// Customer creates order
exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
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

// Customer gets their orders - EXCLUDE user-deleted records
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { 
        userId: req.user.id,
        deletedByUser: false // PROFESSIONAL: Exclude user-deleted records
      },
      include: [Service, Photo, Payment],
      order: [['createdAt', 'DESC']] // Show newest first
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Customer cancels order (business logic - changes status)
exports.cancelMyOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({ 
      where: { id, userId, deletedByUser: false } 
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found or already deleted" });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ error: "Can only cancel pending orders" });
    }

    await order.update({ status: 'canceled' });
    res.json({ message: "Order canceled successfully", order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Customer "deletes" order (soft delete - hides from user view)
exports.deleteMyOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({ 
      where: { id, userId } 
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // FIXED: Allow deletion of completed AND canceled orders
    if (!['delivered', 'picked_up', 'canceled'].includes(order.status)) {
      return res.status(400).json({ error: "Can only delete completed or canceled orders" });
    }

    // PROFESSIONAL SOFT DELETE: Mark as deleted by user with timestamp
    await order.update({ 
      deletedByUser: true,
      userDeletedAt: new Date()
    });

    res.json({ 
      message: "Order removed from your view successfully",
      deletedAt: new Date()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin: get all orders (INCLUDES user-deleted records)
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [User, Service, Photo, Payment],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin: restore user-deleted order
exports.restoreOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    await order.update({ 
      deletedByUser: false,
      userDeletedAt: null
    });

    res.json({ message: "Order restored successfully", order });
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

// Admin deletes order (permanent delete - removes photos too)
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First delete associated photos
    await Photo.destroy({ where: { orderId: id } });
    
    // Then delete the order
    const deleted = await Order.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ error: "Order not found" });
    
    res.json({ message: "Order and associated photos permanently deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// BATCH DELETE (SOFT/PERMANENT DELETE)

// Customer batch deletes their orders
exports.batchDeleteMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderIds } = req.body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ error: "No orders selected for deletion" });
    }

    // Verify all orders belong to the user and are deletable
    const orders = await Order.findAll({
      where: { 
        id: orderIds,
        userId: userId
      }
    });

    if (orders.length !== orderIds.length) {
      return res.status(403).json({ error: "Some orders not found or access denied" });
    }

    // Check if all selected orders are deletable
    const invalidOrders = orders.filter(order => 
      !['delivered', 'picked_up', 'canceled'].includes(order.status)
    );

    if (invalidOrders.length > 0) {
      return res.status(400).json({ 
        error: "Can only delete completed or canceled orders",
        invalidOrders: invalidOrders.map(o => ({ id: o.id, status: o.status }))
      });
    }

    // Perform batch soft delete
    await Order.update(
      { 
        deletedByUser: true,
        userDeletedAt: new Date()
      },
      { 
        where: { 
          id: orderIds,
          userId: userId
        }
      }
    );

    res.json({ 
      message: `${orderIds.length} order(s) removed from your view successfully`,
      deletedCount: orderIds.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin batch deletes orders (permanent delete - including photos)
exports.batchDeleteOrders = async (req, res) => {
  try {
    const { orderIds } = req.body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ error: "No orders selected for deletion" });
    }

    // First delete associated photos
    await Photo.destroy({
      where: { orderId: orderIds }
    });

    // Then delete the orders
    const deletedCount = await Order.destroy({
      where: { id: orderIds }
    });

    res.json({ 
      message: `${deletedCount} order(s) and associated photos permanently deleted`,
      deletedCount: deletedCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};