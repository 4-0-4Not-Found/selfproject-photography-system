const express = require("express");
const cors = require("cors");
const sequelize = require("./Config/database");

// Import routes
const userRoutes = require("./Routes/userRoutes");
const serviceRoutes = require("./Routes/serviceRoutes");
const orderRoutes = require("./Routes/orderRoutes");
const bookingRoutes = require("./Routes/bookingRoutes");
const photoRoutes = require("./Routes/photoRoutes");
const galleryRoutes = require("./Routes/galleryRoutes");
const authRoutes = require("./Routes/authRoutes");

//Import models
require("./Models");

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/photos", photoRoutes);
app.use("/api/gallery",galleryRoutes);
app.use("/api/auth", authRoutes);

// Test DB connection + Sync models
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Connected to Neon Postgres");

    return sequelize.sync(); // Sync all models (creates tables if not exist)
  })
  .then(() => {
    console.log("📦 Models synced with Neon");
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
  });

module.exports = app;
