const express = require("express");
const router = express.Router();
const { addGalleryPhoto, getGallery } = require("../Controllers/galleryController");

// Add photo to gallery (Admin only later with JWT middleware)
router.post("/", addGalleryPhoto);

// Public: Get all gallery photos
router.get("/", getGallery);

module.exports = router;
