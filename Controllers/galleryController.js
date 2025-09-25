const Gallery = require("../Models/gallery");

exports.addGalleryPhoto = async (req, res) => {
  try {
    const { title, imageUrl } = req.body;
    const galleryItem = await Gallery.create({ title, imageUrl });
    res.status(201).json(galleryItem);
  } catch (err) {
    res.status(500).json({ message: "Error adding gallery photo", error: err.message });
  }
};

exports.getGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findAll();
    res.json(gallery);
  } catch (err) {
    res.status(500).json({ message: "Error fetching gallery", error: err.message });
  }
};
