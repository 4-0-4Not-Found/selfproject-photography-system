const express = require("express");
const router = express.Router();
const serviceController = require("../Controllers/serviceController");
const { authenticate, isAdmin } = require("../Middleware/authMiddleware");

// public
router.get("/", serviceController.getServices);
router.get("/:id", serviceController.getServiceById);

// admin only
router.post("/", authenticate, isAdmin, serviceController.createService);
router.put("/:id", authenticate, isAdmin, serviceController.updateService);
router.delete("/:id", authenticate, isAdmin, serviceController.deleteService);

module.exports = router;
