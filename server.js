// server.js
const app = require("./app");
const sequelize = require("./Config/database");

const PORT = process.env.PORT || 3000;

console.log('🔴 STARTING SERVER...');

async function startServer() {
  try {
    console.log('🔄 Testing database connection...');
    await sequelize.authenticate();
    console.log("✅ Connected to Neon Postgres");

    await sequelize.sync();
    console.log("📦 Models synced with Neon");

    // ✅ FIX: Remove '127.0.0.1' to bind to all interfaces
    const server = app.listen(PORT, () => {
      console.log(`✅ SERVER RUNNING on port ${PORT}`);
      console.log(`🌐 Available at: http://localhost:${PORT}`);
      console.log(`🌐 Also available at: http://127.0.0.1:${PORT}`);
      console.log('🛑 Press Ctrl+C to stop the server');
    });

    server.on('error', (err) => {
      console.log('❌ SERVER ERROR:', err.code, err.message);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();