'use strict';

/**
 * app.js — Express Application Configuration
 * ============================================
 * This file configures the Express app: registers middleware,
 * mounts route handlers, and defines fallback/error handlers.
 *
 * It does NOT start the HTTP server — that responsibility
 * belongs to server.js (Separation of Concerns).
 * This separation also makes the app easier to test in isolation.
 */

const express = require('express');

// Route imports
const recipeRoutes = require('./routes/recipeRoutes');

// Middleware imports
const globalErrorHandler = require('./middlewares/errorHandler');

const path = require('path');
const app = express();

// ──────────────────────────────────────────────────────────────
// Built-in Middleware
// ──────────────────────────────────────────────────────────────

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../public')));

// Parse incoming JSON request bodies
app.use(express.json());

// Parse URL-encoded bodies (for form submissions, if needed)
app.use(express.urlencoded({ extended: true }));

// ──────────────────────────────────────────────────────────────
// API Health Check Route
// ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  return res.status(200).json({
    status: 'success',
    message: '🍳 The Global Kitchen API is up and running!',
    timestamp: new Date().toISOString(),
  });
});

// ──────────────────────────────────────────────────────────────
// Mount API Routes
// All recipe endpoints will be prefixed with /api/recipes
// ──────────────────────────────────────────────────────────────
app.use('/api/recipes', recipeRoutes);

// ──────────────────────────────────────────────────────────────
// 404 Handler — Catch-all for undefined routes
// Must come AFTER all valid route definitions
// ──────────────────────────────────────────────────────────────
app.all('/{*path}', (req, _res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// ──────────────────────────────────────────────────────────────
// Global Error Handler — MUST be the LAST middleware registered
// Express identifies it as an error handler via its 4 arguments
// ──────────────────────────────────────────────────────────────
app.use(globalErrorHandler);

module.exports = app;
