/**
 * @file src/routes/users.js
 * @fileoverview User routes for the REEL movie API
 * @module routes/users
 * @requires express
 * @requires express-validator
 * @requires controllers/userController
 * @requires middleware/validators
 * @requires middleware/auth
 * @author Dmitri Korotkov
 * @copyright Dmitri Korotkov 2025
 */

// --- Third-Party Frameworks & Utilities ---
import { Router } from 'express';
import { validationResult } from 'express-validator';
// --- Local Modules (Must be imported/executed) ---
import * as userController from '../controllers/userController.js';
import {
  registerValidation,
  updateUserValidation,
  deleteUserValidation,
  favoriteValidation,
} from '../middleware/validators.js';
import { authenticateJWT, requireAdmin, requireOwnerOrAdmin, requireFavoriteOwner } from '../middleware/auth.js';


const router = Router();

// ESSENTIAL FEATURES

/**
 * GET /users
 * Returns a list of all users (admin only)
 */
router.get('/users', authenticateJWT, requireAdmin, userController.getUsers);

/**
 * POST /users
 * Registers new user
 */
router.post('/users', registerValidation, userController.registerUser);

/**
 * PATCH /users/:username
 * Updates existing user info (username, password, email, date of birth)
 * @param {string} username - Current username
 */
router.patch(
  '/users/:username',
  updateUserValidation,
  authenticateJWT,
  requireOwnerOrAdmin,
  userController.updateUser
);

/**
 * DELETE /users/:username
 * Deregisters (deletes) user with provided username
 * @param {string} username - Username to delete
 */
router.delete(
  '/users/:username',
  deleteUserValidation,
  authenticateJWT,
  requireOwnerOrAdmin,
  userController.deleteUser
);

// OPTIONAL FEATURES

/**
 * PATCH /users/:username/:movieId
 * Adds a movie to a user's favorites by username and movie ID
 * @param {string} username - Username
 * @param {string} movieId - Movie ID
 */
router.patch(
  '/users/:username/:movieId',
  favoriteValidation,
  authenticateJWT,
  requireFavoriteOwner,
  userController.addFavorite
);

/**
 * DELETE /users/:username/:movieId
 * Removes a movie from user's favorites by username and movie ID
 * @param {string} username - Username
 * @param {string} movieId - Movie ID
 */
router.delete(
  '/users/:username/:movieId',
  favoriteValidation,
  authenticateJWT,
  requireFavoriteOwner,
  userController.removeFavorite
);

export default router;