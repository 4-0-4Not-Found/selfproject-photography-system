const express = require("express");
const router = express.Router();
const galleryController = require("../Controllers/galleryController");
const { authenticate, isAdmin } = require("../Middleware/authMiddleware");

router.get("/", galleryController.getGallery); // public
router.post("/", authenticate, isAdmin, galleryController.addGalleryPhoto); // admin-only
module.exports = router;
