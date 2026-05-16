'use strict';

/**
 * validateObjectId.js — MongoDB ObjectId Format Middleware
 * =========================================================
 * Validates that the :id route parameter is a valid MongoDB ObjectId
 * BEFORE the request reaches the controller or database.
 *
 * Why this matters:
 *  If we pass a malformed ID (e.g., "abc") directly to Mongoose,
 *  it throws a CastError with a confusing stack trace instead of a
 *  clean 400 Bad Request. This middleware intercepts that early.
 */

const mongoose = require('mongoose');

/**
 * Express middleware that validates the :id route parameter.
 *
 * @param {Object} req  - Express request object
 * @param {Object} res  - Express response object
 * @param {Function} next - Next middleware function
 */
const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    const error = new Error(`"${req.params.id}" is not a valid recipe ID format.`);
    error.statusCode = 400;
    return next(error);
  }
  return next();
};

module.exports = { validateObjectId };
