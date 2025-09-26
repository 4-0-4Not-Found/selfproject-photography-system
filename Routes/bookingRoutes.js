const express = require("express");
const router = express.Router();
const bookingController = require("../Controllers/bookingController");
const { authenticate, isAdmin } = require("../Middleware/authMiddleware");

// customer creates booking
router.post("/", authenticate, bookingController.createBooking);

// customer sees own bookings (implement in controller to use req.user.id)
router.get("/my", authenticate, bookingController.getMyBookings);

// admin: get all / update / approve
router.get("/", authenticate, isAdmin, bookingController.getBookings);
router.put("/:id", authenticate, isAdmin, bookingController.updateBooking);

module.exports = router;
