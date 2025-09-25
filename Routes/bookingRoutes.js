const express = require("express");
const { createBooking, getBookings } = require("../Controllers/bookingController");

const router = express.Router();

router.post("/", createBooking);   // Create booking
router.get("/", getBookings);     // Get all bookings

module.exports = router;
