const { Booking, User, Service } = require("../Models");

// Customer creates booking
exports.createBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date, time, serviceId, location, customDescription } = req.body;

    const booking = await Booking.create({ 
      date, time, location, userId, serviceId, customDescription 
    });
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Customer gets their bookings - EXCLUDE user-deleted records
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { 
        userId: req.user.id,
        deletedByUser: false // PROFESSIONAL: Exclude user-deleted records
      },
      include: [Service],
      order: [['createdAt', 'DESC']] // Show newest first
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Customer cancels booking (business logic - changes status)
exports.cancelMyBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const booking = await Booking.findOne({ 
      where: { id, userId, deletedByUser: false } 
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found or already deleted" });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ error: "Can only cancel pending bookings" });
    }

    await booking.update({ status: 'canceled' });
    res.json({ message: "Booking canceled successfully", booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Customer "deletes" booking (soft delete - hides from user view)
exports.deleteMyBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const booking = await Booking.findOne({ 
      where: { id, userId } 
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Only allow "deletion" of completed or canceled bookings
    if (!['completed', 'canceled'].includes(booking.status)) {
      return res.status(400).json({ error: "Can only delete completed or canceled bookings" });
    }

    // PROFESSIONAL SOFT DELETE: Mark as deleted by user with timestamp
    await booking.update({ 
      deletedByUser: true,
      userDeletedAt: new Date()
    });

    res.json({ 
      message: "Booking removed from your view successfully",
      deletedAt: new Date()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin: get all bookings (INCLUDES user-deleted records)
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({ 
      include: [User, Service],
      order: [['createdAt', 'DESC']]
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin: restore user-deleted booking
exports.restoreBooking = async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await Booking.findByPk(id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    await booking.update({ 
      deletedByUser: false,
      userDeletedAt: null
    });

    res.json({ message: "Booking restored successfully", booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Keep other admin functions the same...
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [User, Service],
    });
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Booking.update(req.body, { where: { id } });
    if (!updated) return res.status(404).json({ error: "Booking not found" });
    const updatedBooking = await Booking.findByPk(id);
    res.json(updatedBooking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Booking.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ error: "Booking not found" });
    res.json({ message: "Booking permanently deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// BATCH DELETE (SOFT/PERMANENT DELETE)

// Customer batch deletes their bookings
exports.batchDeleteMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookingIds } = req.body;

    if (!bookingIds || !Array.isArray(bookingIds) || bookingIds.length === 0) {
      return res.status(400).json({ error: "No bookings selected for deletion" });
    }

    // Verify all bookings belong to the user and are deletable
    const bookings = await Booking.findAll({
      where: { 
        id: bookingIds,
        userId: userId
      }
    });

    if (bookings.length !== bookingIds.length) {
      return res.status(403).json({ error: "Some bookings not found or access denied" });
    }

    // Check if all selected bookings are deletable (completed or canceled)
    const invalidBookings = bookings.filter(booking => 
      !['completed', 'canceled'].includes(booking.status)
    );

    if (invalidBookings.length > 0) {
      return res.status(400).json({ 
        error: "Can only delete completed or canceled bookings",
        invalidBookings: invalidBookings.map(b => ({ id: b.id, status: b.status }))
      });
    }

    // Perform batch soft delete
    await Booking.update(
      { 
        deletedByUser: true,
        userDeletedAt: new Date()
      },
      { 
        where: { 
          id: bookingIds,
          userId: userId
        }
      }
    );

    res.json({ 
      message: `${bookingIds.length} booking(s) removed from your view successfully`,
      deletedCount: bookingIds.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin batch deletes bookings (permanent delete)
exports.batchDeleteBookings = async (req, res) => {
  try {
    const { bookingIds } = req.body;

    if (!bookingIds || !Array.isArray(bookingIds) || bookingIds.length === 0) {
      return res.status(400).json({ error: "No bookings selected for deletion" });
    }

    // Perform batch permanent delete
    const deletedCount = await Booking.destroy({
      where: { id: bookingIds }
    });

    res.json({ 
      message: `${deletedCount} booking(s) permanently deleted`,
      deletedCount: deletedCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};