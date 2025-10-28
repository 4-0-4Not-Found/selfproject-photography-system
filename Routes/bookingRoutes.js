const express = require("express");
const router = express.Router();
const bookingController = require("../Controllers/bookingController");
const { authenticate, isAdmin } = require("../Middleware/authMiddleware");

// customer creates booking
router.post("/", authenticate, bookingController.createBooking);

// customer sees own bookings
router.get("/my", authenticate, bookingController.getMyBookings);

// customer cancels booking (pending only)
router.delete("/my/:id", authenticate, bookingController.cancelMyBooking);

// customer deletes booking (completed/canceled only)
router.delete("/my/:id/delete", authenticate, bookingController.deleteMyBooking);

// customer batch deletes bookings
router.post("/my/batch-delete", authenticate, bookingController.batchDeleteMyBookings);

// admin: get all / update / delete / restore
router.get("/", authenticate, isAdmin, bookingController.getBookings);
router.put("/:id", authenticate, isAdmin, bookingController.updateBooking);
router.delete("/:id", authenticate, isAdmin, bookingController.deleteBooking);
// RESTORE ROUTE:
router.patch("/:id/restore", authenticate, isAdmin, bookingController.restoreBooking);

// admin batch deletes bookings
router.post("/batch-delete", authenticate, isAdmin, bookingController.batchDeleteBookings);

module.exports = router;