'use strict';

/**
 * recipeController.js — Request/Response Cycle Handler (Controller Layer)
 * =========================================================================
 * Controllers sit between Routes and Services.
 *
 * Responsibilities:
 *  - Parse request parameters, body, and query strings
 *  - Call the appropriate service function
 *  - Send back the correct HTTP status code and JSON response
 *  - Pass any caught errors to the global error handler via next(error)
 *
 * What does NOT belong here:
 *  - Business logic — that belongs in Services
 *  - Route definitions — that belongs in Routes
 *  - Database queries — that belongs in Services (via Models)
 *
 * IMPORTANT ("Silent End" rule):
 *  Every code path in every controller MUST end with res.json() or res.send()
 *  so the HTTP response is properly closed. If any path is left without a
 *  response call, the client will hang indefinitely.
 */

const recipeService = require('../services/recipeService');

// ──────────────────────────────────────────────────────────────
// GET /recipes
// ──────────────────────────────────────────────────────────────
/**
 * Retrieves all recipes. Supports optional query filters:
 *   ?category=Dessert
 *   ?difficulty=Easy
 *
 * @route  GET /api/recipes
 * @access Public
 */
const getAllRecipes = async (req, res, next) => {
  try {
    const filters = {
      category: req.query.category,
      difficulty: req.query.difficulty,
    };

    const recipes = await recipeService.getAllRecipes(filters);

    // Always end with res.json() — "Silent End" compliance
    return res.status(200).json({
      status: 'success',
      results: recipes.length,
      data: { recipes },
    });
  } catch (error) {
    // Pass to the global error handler — never crash the server
    return next(error);
  }
};

// ──────────────────────────────────────────────────────────────
// GET /recipes/:id
// ──────────────────────────────────────────────────────────────
/**
 * Retrieves a single recipe by its MongoDB _id.
 *
 * @route  GET /api/recipes/:id
 * @access Public
 */
const getRecipeById = async (req, res, next) => {
  try {
    const recipe = await recipeService.getRecipeById(req.params.id);

    return res.status(200).json({
      status: 'success',
      data: { recipe },
    });
  } catch (error) {
    return next(error);
  }
};

// ──────────────────────────────────────────────────────────────
// POST /recipes
// ──────────────────────────────────────────────────────────────
/**
 * Creates a new recipe from the request body.
 * Returns 201 Created on success.
 *
 * @route  POST /api/recipes
 * @access Public
 */
const createRecipe = async (req, res, next) => {
  try {
    const newRecipe = await recipeService.createRecipe(req.body);

    return res.status(201).json({
      status: 'success',
      message: 'Recipe created successfully.',
      data: { recipe: newRecipe },
    });
  } catch (error) {
    return next(error);
  }
};

// ──────────────────────────────────────────────────────────────
// PATCH /recipes/:id
// ──────────────────────────────────────────────────────────────
/**
 * Partially updates an existing recipe.
 * Only the provided fields are updated — other fields remain unchanged.
 *
 * @route  PATCH /api/recipes/:id
 * @access Public
 */
const updateRecipe = async (req, res, next) => {
  try {
    const updatedRecipe = await recipeService.updateRecipe(req.params.id, req.body);

    return res.status(200).json({
      status: 'success',
      message: 'Recipe updated successfully.',
      data: { recipe: updatedRecipe },
    });
  } catch (error) {
    return next(error);
  }
};

// ──────────────────────────────────────────────────────────────
// DELETE /recipes/:id
// ──────────────────────────────────────────────────────────────
/**
 * Permanently removes a recipe from the collection.
 * Returns 200 with a confirmation message (or 204 No Content is also valid).
 *
 * @route  DELETE /api/recipes/:id
 * @access Public
 */
const deleteRecipe = async (req, res, next) => {
  try {
    const deletedRecipe = await recipeService.deleteRecipe(req.params.id);

    return res.status(200).json({
      status: 'success',
      message: `Recipe "${deletedRecipe.title}" has been deleted.`,
      data: null,
    });
  } catch (error) {
    return next(error);
  }
};

// ──────────────────────────────────────────────────────────────
// Exports
// ──────────────────────────────────────────────────────────────
module.exports = {
  getAllRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
};
