const { Booking, User, Service } = require("../Models");

// Customer creates booking
exports.createBooking = async (req, res) => {
  try {
    const userId = req.user.id; // from token
    const { date, time, serviceId } = req.body;

    const booking = await Booking.create({ date, time, userId, serviceId });
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Customer gets their own bookings
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { userId: req.user.id },
      include: [Service],
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin: get all bookings
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({ include: [User, Service] });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get booking by ID (admin only, if needed)
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

// Admin updates booking
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

// Admin deletes booking
exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Booking.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ error: "Booking not found" });
    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
