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

// NEW: Upload photos for order (customer)
exports.uploadPhotosForOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const files = req.files; // From multer
    
    // Validate that order exists and belongs to user
    // Add your validation logic here
    
    const photos = [];
    for (const file of files) {
      const photo = await Photo.create({
        original_url: file.path,
        edited_url: null,
        orderId: orderId
      });
      photos.push(photo);
    }
    
    res.status(201).json({ message: "Photos uploaded successfully", photos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// NEW: Upload final edited photos (admin)
exports.uploadFinalPhotosForOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const files = req.files; // From multer
    
    // Find existing photos for this order and update with edited versions
    const existingPhotos = await Photo.findAll({ where: { orderId } });
    
    if (existingPhotos.length !== files.length) {
      return res.status(400).json({ error: "Number of files doesn't match existing photos" });
    }
    
    const updatedPhotos = [];
    for (let i = 0; i < existingPhotos.length; i++) {
      const photo = await existingPhotos[i].update({
        edited_url: files[i].path
      });
      updatedPhotos.push(photo);
    }
    
    res.status(200).json({ message: "Final photos uploaded successfully", photos: updatedPhotos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};