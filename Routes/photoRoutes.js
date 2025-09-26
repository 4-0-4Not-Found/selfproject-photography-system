const express = require("express");
const router = express.Router();
const photoController = require("../Controllers/photoController");
const upload = require("../Middleware/upload"); // your multer config
const { authenticate, isAdmin } = require("../Middleware/authMiddleware");

// customer uploads files for their order
router.post("/order/:orderId/upload", authenticate, upload.array("photos", 12), photoController.uploadPhotosForOrder);

// get photos for order (auth check so customers can only access their own)
router.get("/order/:orderId", authenticate, photoController.getPhotosByOrder);

// admin can upload final edited photos (admin-only)
router.post("/order/:orderId/final", authenticate, isAdmin, upload.array("photos", 12), photoController.uploadFinalPhotosForOrder);

module.exports = router;
