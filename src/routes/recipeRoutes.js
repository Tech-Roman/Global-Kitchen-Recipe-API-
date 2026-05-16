'use strict';

/**
 * recipeRoutes.js — API Endpoint Definitions (Routes Layer)
 * ===========================================================
 * This file defines all routes for the /api/recipes resource.
 * Routes only define WHAT endpoint exists and WHAT controller handles it.
 * No business logic or database code lives here.
 *
 * Endpoints:
 *  GET    /api/recipes          → getAllRecipes  (supports ?category & ?difficulty filters)
 *  GET    /api/recipes/:id      → getRecipeById
 *  POST   /api/recipes          → createRecipe
 *  PATCH  /api/recipes/:id      → updateRecipe  (partial update — not full replacement)
 *  DELETE /api/recipes/:id      → deleteRecipe
 */

const express = require('express');
const recipeController = require('../controllers/recipeController');
const { validateObjectId } = require('../middlewares/validateObjectId');

const router = express.Router();

// ──────────────────────────────────────────────────────────────
// Collection Routes (no :id param)
// ──────────────────────────────────────────────────────────────
router
  .route('/')
  .get(recipeController.getAllRecipes)   // GET  /api/recipes
  .post(recipeController.createRecipe);  // POST /api/recipes

// ──────────────────────────────────────────────────────────────
// Document Routes (with :id param)
// validateObjectId middleware runs FIRST to check the ID format
// before hitting the database — prevents invalid ObjectId crashes
// ──────────────────────────────────────────────────────────────
router
  .route('/:id')
  .get(validateObjectId, recipeController.getRecipeById)     // GET    /api/recipes/:id
  .patch(validateObjectId, recipeController.updateRecipe)    // PATCH  /api/recipes/:id
  .delete(validateObjectId, recipeController.deleteRecipe);  // DELETE /api/recipes/:id

module.exports = router;
