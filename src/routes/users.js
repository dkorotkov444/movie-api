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

// 1. Returns a list of all users
router.get('/users', authenticateJWT, requireAdmin, userController.getUsers);

// 2. Registers new user
router.post('/users', registerValidation, userController.registerUser);

// 3. Updates existing user info (username, password, email, date of birth)
router.patch(
  '/users/:username',
  updateUserValidation,
  authenticateJWT,
  requireOwnerOrAdmin,
  userController.updateUser
);

// 4. Deregisters (deletes) user with provided username
router.delete(
  '/users/:username',
  deleteUserValidation,
  authenticateJWT,
  requireOwnerOrAdmin,
  userController.deleteUser
);

// OPTIONAL FEATURES

// 5. Adds a movie to a user's favorites by username and movie ID
router.patch(
  '/users/:username/:movieId',
  favoriteValidation,
  authenticateJWT,
  requireFavoriteOwner,
  userController.addFavorite
);

// 6. Removes a movie from user's favorites by username and movie ID
router.delete(
  '/users/:username/:movieId',
  favoriteValidation,
  authenticateJWT,
  requireFavoriteOwner,
  userController.removeFavorite
);

export default router;