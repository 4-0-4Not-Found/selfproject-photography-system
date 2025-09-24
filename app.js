const express = require("express");
const cors = require("cors");
const sequelize = require("./Config/database");

// Import routes
const userRoutes = require("./Routes/userRoutes");

//Import models
require("./Models");

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);

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
