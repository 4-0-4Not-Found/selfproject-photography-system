const express = require("express");
const router = express.Router();
const photoController = require("../Controllers/photoController");

router.post("/", photoController.createPhoto);
router.get("/", photoController.getPhotos);
router.get("/orders/:orderId", photoController.getPhotosByOrder);

module.exports = router;
