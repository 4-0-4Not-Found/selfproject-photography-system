const express = require("express");
const router = express.Router();
const serviceController = require("../Controllers/serviceController");

// Routes
router.post("/", serviceController.createService);    // Add service
router.get("/", serviceController.getServices);      // Get all services
router.get("/:id", serviceController.getServiceById); // Get one service
router.put("/:id", serviceController.updateService);  // Update service
router.delete("/:id", serviceController.deleteService); // Delete service

module.exports = router;
