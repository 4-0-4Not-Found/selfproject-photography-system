const express = require("express");
const cors = require("cors");
const sequelize = require("./Config/database");
const path = require("path");

// Import routes
const userRoutes = require("./Routes/userRoutes");
const serviceRoutes = require("./Routes/serviceRoutes");
const orderRoutes = require("./Routes/orderRoutes");
const bookingRoutes = require("./Routes/bookingRoutes");
const photoRoutes = require("./Routes/photoRoutes");
const galleryRoutes = require("./Routes/galleryRoutes");
const authRoutes = require("./Routes/authRoutes");
const paymentRoutes = require("./Routes/paymentRoutes");

// Import models
require("./Models");

const app = express();
app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"] // ADD PATCH method
}));
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test Routes
app.get("/", (req, res) => {
  res.json({ message: "Photography System API is running" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.get("/api/test", (req, res) => {
  console.log("TEST ROUTE HIT");
  res.json({ message: "Backend is working!" });
});

// ✅ ALL YOUR ROUTES ARE PROPERLY MOUNTED - THIS IS CORRECT
app.use("/api/users", userRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/orders", orderRoutes);        // ✅ Batch delete routes exist here
app.use("/api/bookings", bookingRoutes);    // ✅ Batch delete routes exist here  
app.use("/api/photos", photoRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);

module.exports = app;