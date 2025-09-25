const { Photo } = require("../Models");

// Upload new photo for an order
exports.createPhoto = async (req, res) => {
  try {
    const { original_url, edited_url, orderId } = req.body;
    const photo = await Photo.create({ original_url, edited_url, orderId });
    res.status(201).json(photo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all photos
exports.getPhotos = async (req, res) => {
  try {
    const photos = await Photo.findAll();
    res.json(photos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get photos by order
exports.getPhotosByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const photos = await Photo.findAll({ where: { orderId } });
    res.json(photos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
