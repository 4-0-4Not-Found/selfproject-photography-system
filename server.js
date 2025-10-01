// server.js
const app = require("./app");
const sequelize = require("./Config/database");

const PORT = process.env.PORT || 3000;

console.log('🔴 STARTING SERVER...');

// PREVENT PROCESS FROM EXITING
process.stdin.resume(); // Keep stdin open
process.on('SIGINT', () => {
  console.log('Received SIGINT. Shutting down gracefully...');
  process.exit(0);
});
process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Shutting down gracefully...');
  process.exit(0);
});

// Keep the event loop busy
const keepAlive = setInterval(() => {
  // This keeps the process running
}, 1000);

async function startServer() {
  try {
    console.log('🔄 Testing database connection...');
    await sequelize.authenticate();
    console.log("✅ Connected to Neon Postgres");

    await sequelize.sync();
    console.log("📦 Models synced with Neon");

    const server = app.listen(PORT, '127.0.0.1', () => {
      console.log(`✅ SERVER RUNNING: http://127.0.0.1:${PORT}`);
      console.log('📡 Server.address():', server.address());
      console.log('💓 Process will stay alive until manually stopped');
      console.log('🛑 Press Ctrl+C to stop the server');
    });

    server.on('error', (err) => {
      console.log('❌ SERVER ERROR:', err.code, err.message);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    clearInterval(keepAlive);
    process.exit(1);
  }
}

startServer();