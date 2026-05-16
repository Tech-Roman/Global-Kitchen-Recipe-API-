'use strict';

/**
 * errorHandler.js — Global Error Handling Middleware
 * ====================================================
 * A centralized error handler that catches ALL errors propagated
 * via next(error) from anywhere in the application.
 *
 * Why a global handler?
 *  - DRY: Error formatting logic is written ONCE, not in every controller
 *  - Safety: Server never crashes due to unhandled promise rejections
 *  - Consistency: Every error returns the same predictable JSON shape
 *
 * Express recognizes a 4-argument function as an error handler:
 *  (err, req, res, next)
 */

/**
 * Normalizes Mongoose validation errors into a readable message.
 *
 * @param {Object} err - A Mongoose ValidationError instance
 * @returns {string} Human-readable validation summary
 */
const formatMongooseValidationError = (err) => {
  return Object.values(err.errors)
    .map((e) => e.message)
    .join(' | ');
};

/**
 * Global error handler middleware.
 * MUST be registered LAST in app.js (after all routes).
 *
 * @param {Error} err   - The error object propagated via next(err)
 * @param {Object} req  - Express request
 * @param {Object} res  - Express response
 * @param {Function} _next - Unused (required for Express to identify as error handler)
 */
// eslint-disable-next-line no-unused-vars
const globalErrorHandler = (err, req, res, _next) => {
  // Default status code: 500 Internal Server Error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'An unexpected internal error occurred.';

  // ── Mongoose: Validation Error (missing required fields, enum mismatch, etc.)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = formatMongooseValidationError(err);
  }

  // ── Mongoose: CastError (invalid ObjectId format slips past middleware)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for field "${err.path}": ${err.value}`;
  }

  // ── MongoDB: Duplicate Key Error (unique index violation)
  if (err.code === 11000) {
    statusCode = 409; // 409 Conflict
    const duplicatedField = Object.keys(err.keyValue)[0];
    message = `A recipe with this ${duplicatedField} already exists.`;
  }

  // Log full error stack in development for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('[ERROR]', err.stack);
  } else {
    // In production, log a minimal message — don't leak stack traces
    console.error(`[ERROR] ${statusCode} — ${message}`);
  }

  // Every error path ends with res.json() — "Silent End" compliance
  return res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
  });
};

module.exports = globalErrorHandler;
