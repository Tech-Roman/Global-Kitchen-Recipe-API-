'use strict';

/**
 * database.js — Single Database Connection Module (DRY Principle)
 * ================================================================
 * This module establishes ONE connection to MongoDB and exports it.
 * It is imported wherever DB access is needed, ensuring we never
 * reconnect on every request (which would exhaust connection pools).
 *
 * Pattern: Singleton — Mongoose handles connection pooling internally.
 */

const mongoose = require('mongoose');

/**
 * Connects to MongoDB using the URI from environment variables.
 * Uses async/await for Non-Blocking I/O — no callback hell.
 *
 * @returns {Promise<void>}
 */
const connectDatabase = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('[DB] MONGODB_URI is not defined in the .env file. Exiting.');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.info(`[DB] ✅ Connected to MongoDB: ${mongoose.connection.host}`);
  } catch (error) {
    console.error('[DB] ❌ MongoDB connection failed:', error.message);
    // Exit the process so the server doesn't silently run without a database
    process.exit(1);
  }
};

// Listen for unexpected disconnections after initial connection
mongoose.connection.on('disconnected', () => {
  console.warn('[DB] ⚠️  MongoDB disconnected.');
});

mongoose.connection.on('reconnected', () => {
  console.info('[DB] 🔄 MongoDB reconnected.');
});

module.exports = connectDatabase;
