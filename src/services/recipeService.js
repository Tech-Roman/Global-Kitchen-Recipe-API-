'use strict';

/**
 * recipeService.js — Business Logic Layer (Service Layer)
 * =========================================================
 * This layer contains all business rules and data-access logic.
 * Controllers call services; services call the Model.
 *
 * Responsibilities:
 *  - Validate business rules (e.g., cookingTime must be positive)
 *  - Interact with the MongoDB model using async/await
 *  - Throw descriptive errors that the controller/error handler can catch
 *
 * What does NOT belong here:
 *  - res.json() / res.send() — that belongs in Controllers
 *  - Route definitions — that belongs in Routes
 */

const Recipe = require('../models/Recipe');

// ──────────────────────────────────────────────────────────────
// Helper: Validate incoming recipe payload
// Called before create or update operations (DRY principle)
// ──────────────────────────────────────────────────────────────
/**
 * Validates business-level rules on a recipe payload.
 * Mongoose handles schema-level validation, but this function
 * catches logical constraints before even touching the database.
 *
 * @param {Object} data - The recipe payload to validate
 * @throws {Error} If any business rule is violated
 */
const validateRecipePayload = (data) => {
  // Business rule: cookingTime must be an explicit positive number
  if (data.cookingTime !== undefined) {
    const cookingTimeAsNumber = Number(data.cookingTime);
    if (!Number.isFinite(cookingTimeAsNumber) || cookingTimeAsNumber <= 0) {
      const error = new Error('cookingTime must be a positive number (in minutes).');
      error.statusCode = 400;
      throw error;
    }
  }

  // Business rule: ingredients array must not be empty on creation
  if (data.ingredients !== undefined) {
    if (!Array.isArray(data.ingredients) || data.ingredients.length === 0) {
      const error = new Error('ingredients must be a non-empty array.');
      error.statusCode = 400;
      throw error;
    }
  }
};

// ──────────────────────────────────────────────────────────────
// Service: Get All Recipes (with optional category filter)
// ──────────────────────────────────────────────────────────────
/**
 * Retrieves all recipes. Supports optional category filtering
 * via a query parameter, implemented as a MongoDB match filter.
 *
 * @param {Object} filters - Query filters (e.g., { category: 'Dessert' })
 * @returns {Promise<Array>} Array of recipe documents
 */
const getAllRecipes = async (filters = {}) => {
  // Build a dynamic query object — only add fields that exist
  const query = {};

  if (filters.category) {
    // Case-insensitive match using regex for a better user experience
    query.category = new RegExp(`^${filters.category}$`, 'i');
  }

  if (filters.difficulty) {
    query.difficulty = new RegExp(`^${filters.difficulty}$`, 'i');
  }

  // .lean() returns plain JS objects (not Mongoose docs) — faster for read-only
  const recipes = await Recipe.find(query).sort({ createdAt: -1 }).lean();
  return recipes;
};

// ──────────────────────────────────────────────────────────────
// Service: Get a Single Recipe by ID
// ──────────────────────────────────────────────────────────────
/**
 * Retrieves a single recipe by its MongoDB ObjectId.
 *
 * @param {string} id - The recipe's MongoDB _id
 * @returns {Promise<Object>} The recipe document
 * @throws {Error} 404 if not found, 400 if ID format is invalid
 */
const getRecipeById = async (id) => {
  const recipe = await Recipe.findById(id).lean();

  if (!recipe) {
    const error = new Error(`No recipe found with ID: ${id}`);
    error.statusCode = 404;
    throw error;
  }

  return recipe;
};

// ──────────────────────────────────────────────────────────────
// Service: Create a New Recipe
// ──────────────────────────────────────────────────────────────
/**
 * Creates and persists a new recipe after validating business rules.
 *
 * @param {Object} recipeData - The recipe fields from the request body
 * @returns {Promise<Object>} The newly created recipe document
 * @throws {Error} If validation fails at business or schema level
 */
const createRecipe = async (recipeData) => {
  // Apply business-level validation before hitting the DB
  validateRecipePayload(recipeData);

  const newRecipe = new Recipe(recipeData);

  // Mongoose schema-level validation runs here (required, min, enum, etc.)
  // save() is async — Non-Blocking I/O — awaited properly
  const savedRecipe = await newRecipe.save();
  return savedRecipe;
};

// ──────────────────────────────────────────────────────────────
// Service: Update Specific Fields of a Recipe (PATCH)
// ──────────────────────────────────────────────────────────────
/**
 * Updates only the provided fields of an existing recipe.
 * Uses findByIdAndUpdate with { new: true, runValidators: true }
 * so Mongoose re-validates the entire updated document.
 *
 * @param {string} id - The recipe's MongoDB _id
 * @param {Object} updateData - Only the fields to update
 * @returns {Promise<Object>} The updated recipe document
 * @throws {Error} 404 if not found
 */
const updateRecipe = async (id, updateData) => {
  // Validate business rules on the partial payload
  validateRecipePayload(updateData);

  const updatedRecipe = await Recipe.findByIdAndUpdate(
    id,
    updateData,
    {
      new: true,          // Return the updated document (not the old one)
      runValidators: true, // Re-run schema validators on the updated fields
    }
  ).lean();

  if (!updatedRecipe) {
    const error = new Error(`No recipe found with ID: ${id}`);
    error.statusCode = 404;
    throw error;
  }

  return updatedRecipe;
};

// ──────────────────────────────────────────────────────────────
// Service: Delete a Recipe
// ──────────────────────────────────────────────────────────────
/**
 * Permanently removes a recipe from the collection.
 *
 * @param {string} id - The recipe's MongoDB _id
 * @returns {Promise<Object>} The deleted recipe document
 * @throws {Error} 404 if not found
 */
const deleteRecipe = async (id) => {
  const deletedRecipe = await Recipe.findByIdAndDelete(id).lean();

  if (!deletedRecipe) {
    const error = new Error(`No recipe found with ID: ${id}`);
    error.statusCode = 404;
    throw error;
  }

  return deletedRecipe;
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
