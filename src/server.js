'use strict';

/**
 * server.js — Application Entry Point
 * =====================================
 * This is the ONLY file responsible for:
 *  1. Loading environment variables from .env FIRST (before anything else)
 *  2. Establishing the MongoDB connection
 *  3. Starting the HTTP server on the configured PORT
 *
 * Separation of Concerns:
 *  - server.js  → bootstrapping & starting the server
 *  - app.js     → Express configuration (routes, middleware)
 *  - database.js → MongoDB connection logic
 *
 * This pattern keeps the app testable: tests can import app.js
 * directly without starting the server or connecting to the DB.
 */

// ── Step 1: Load environment variables from .env BEFORE importing anything else
// This ensures process.env.PORT and process.env.MONGODB_URI are available
// to all modules that load after this line.
require('dotenv').config();

const app = require('./app');
const connectDatabase = require('./config/database');

const PORT = process.env.PORT || 3000;

// ──────────────────────────────────────────────────────────────
// Bootstrap Function
// ──────────────────────────────────────────────────────────────
/**
 * Connects to MongoDB first, then starts the HTTP server.
 * If the DB connection fails, the process exits (handled in database.js).
 * Using async/await for Non-Blocking I/O — no callback pyramid.
 */
const startServer = async () => {
  // Connect to MongoDB — await ensures we don't serve before the DB is ready
  await connectDatabase();

  // Start listening only AFTER the database is connected
  app.listen(PORT, () => {
    console.info('═══════════════════════════════════════════════');
    console.info('  🍳  The Global Kitchen API');
    console.info(`  🚀  Server running on http://localhost:${PORT}`);
    console.info(`  🌍  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.info('═══════════════════════════════════════════════');
    console.info('  Available Endpoints:');
    console.info(`  GET    http://localhost:${PORT}/api/health`);
    console.info(`  GET    http://localhost:${PORT}/api/recipes`);
    console.info(`  GET    http://localhost:${PORT}/api/recipes/:id`);
    console.info(`  POST   http://localhost:${PORT}/api/recipes`);
    console.info(`  PATCH  http://localhost:${PORT}/api/recipes/:id`);
    console.info(`  DELETE http://localhost:${PORT}/api/recipes/:id`);
    console.info('═══════════════════════════════════════════════');
  });
};

// ──────────────────────────────────────────────────────────────
// Unhandled Rejection Guard
// ──────────────────────────────────────────────────────────────
// Catches any unhandled promise rejections that escape async/await blocks
process.on('unhandledRejection', (reason) => {
  console.error('[PROCESS] ❌ Unhandled Promise Rejection:', reason);
  process.exit(1);
});

// Catches synchronous errors not caught anywhere else
process.on('uncaughtException', (error) => {
  console.error('[PROCESS] ❌ Uncaught Exception:', error.message);
  process.exit(1);
});

// Start the server
startServer();
