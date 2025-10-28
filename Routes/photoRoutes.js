const express = require("express");
const router = express.Router();
const photoController = require("../Controllers/photoController");
const { authenticate, isAdmin } = require("../Middleware/authMiddleware");
const upload = require("../Middleware/upload");

// Get all photos (admin only)
router.get("/", authenticate, isAdmin, photoController.getPhotos);

// Get photos by order ID
router.get("/order/:orderId", authenticate, isAdmin, photoController.getPhotosByOrder);

// Upload photos for order (customer)
router.post("/order/:orderId", authenticate, upload.array("photos", 10), photoController.uploadPhotosForOrder);

// Upload final edited photos (admin)
router.post("/order/:orderId/final", authenticate, isAdmin, upload.array("photos", 10), photoController.uploadFinalPhotosForOrder);

module.exports = router;