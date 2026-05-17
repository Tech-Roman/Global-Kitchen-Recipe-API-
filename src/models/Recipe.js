'use strict';

/**
 * Recipe.js — MongoDB Schema & Model (Data / Model Layer)
 * ========================================================
 * Defines the BSON schema for the "recipes" collection.
 *
 * Best Practices Applied:
 *  ✔ Explicit BSON types (Number, Date, String, Array)
 *  ✔ Schema-level validation (required, min, enum, trim, minlength)
 *  ✔ Automatic timestamps (createdAt / updatedAt) using real Date types
 *  ✔ Indexing on high-traffic lookup fields (category, title)
 *  ✔ Lean schema design — no unnecessary embedded documents
 */

const mongoose = require('mongoose');

// ──────────────────────────────────────────────────────────────
// Sub-schema: Ingredient
// Keeps each ingredient structured rather than a plain string
// ──────────────────────────────────────────────────────────────
const ingredientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Ingredient name is required.'],
      trim: true,
      minlength: [2, 'Ingredient name must be at least 2 characters.'],
    },
    quantity: {
      type: String,
      required: [true, 'Ingredient quantity is required (e.g., "2 cups").'],
      trim: true,
    },
  },
  { _id: false } // No separate _id for sub-documents — keeps documents lean
);

// ──────────────────────────────────────────────────────────────
// Main Recipe Schema
// ──────────────────────────────────────────────────────────────
const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Recipe title is required.'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long.'],
      maxlength: [100, 'Title cannot exceed 100 characters.'],
    },

    ingredients: {
      type: [ingredientSchema],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: 'A recipe must have at least one ingredient.',
      },
    },

    instructions: {
      type: String,
      required: [true, 'Cooking instructions are required.'],
      trim: true,
      minlength: [20, 'Instructions must be at least 20 characters.'],
    },

    // BSON Explicit Number type — NOT a string — for cooking time
    cookingTime: {
      type: Number,
      required: [true, 'Cooking time (in minutes) is required.'],
      min: [1, 'Cooking time must be a positive number (minimum 1 minute).'],
    },

    difficulty: {
      type: String,
      required: [true, 'Difficulty level is required.'],
      enum: {
        values: ['Easy', 'Medium', 'Hard', 'Expert'],
        message: 'Difficulty must be one of: Easy, Medium, Hard, Expert.',
      },
    },

    category: {
      type: String,
      required: [true, 'Category is required.'],
      trim: true,
      enum: {
        values: [
          'Breakfast',
          'Lunch',
          'Dinner',
          'Dessert',
          'Snack',
          'Appetizer',
          'Beverage',
          'Soup',
          'Salad',
          'Vegan',
          'Vegetarian',
          'Seafood',
          'Baking',
          'Other',
        ],
        message: 'Category must be a valid option.',
      },
    },
  },
  {
    // Automatically adds createdAt and updatedAt fields as real Date types
    timestamps: true,

    // Removes the __v versioning field from query results for cleaner output
    versionKey: false,
  }
);

// ──────────────────────────────────────────────────────────────
// Indexes — Optimization for Heavy Lookup Fields
// ──────────────────────────────────────────────────────────────

// Index on 'category' for fast filtering (GET /recipes?category=...)
recipeSchema.index({ category: 1 });

// Text index on 'title' for fast case-insensitive search queries
recipeSchema.index({ title: 'text' });

// Compound index: searching by category + sorting by cookingTime
recipeSchema.index({ category: 1, cookingTime: 1 });

// ──────────────────────────────────────────────────────────────
// Model Export
// ──────────────────────────────────────────────────────────────
const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;
