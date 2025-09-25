const Service = require("../Models/service");

// Create a new service (Admin)
exports.createService = async (req, res) => {
  try {
    const { name, description, price } = req.body;

    const service = await Service.create({ name, description, price });
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all services (Public)
exports.getServices = async (req, res) => {
  try {
    const services = await Service.findAll();
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single service by ID (Public)
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);

    if (!service) return res.status(404).json({ message: "Service not found" });

    res.json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update service (Admin)
exports.updateService = async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const service = await Service.findByPk(req.params.id);

    if (!service) return res.status(404).json({ message: "Service not found" });

    service.name = name || service.name;
    service.description = description || service.description;
    service.price = price || service.price;

    await service.save();
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete service (Admin)
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);

    if (!service) return res.status(404).json({ message: "Service not found" });

    await service.destroy();
    res.json({ message: "Service deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
