/*  users.js
* User routes for the REEL movie API
* Uses ESM syntax
* Copyright Dmitri Korotkov 2025
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

// 6. Returns a list of all users
router.get('/users', authenticateJWT, requireAdmin, userController.getUsers);

// 7. Registers new user
router.post('/users', registerValidation, userController.registerUser);

// 8. Updates existing user info (username, password, email, date of birth)
router.patch(
  '/users/:username',
  updateUserValidation,
  authenticateJWT,
  requireOwnerOrAdmin,
  userController.updateUser
);

// 9. Deregisters (deletes) user with provided username
router.delete(
  '/users/:username',
  deleteUserValidation,
  authenticateJWT,
  requireOwnerOrAdmin,
  userController.deleteUser
);

// 10. Adds a movie to a user's favorites by username and movie ID
router.patch(
  '/users/:username/:movieId',
  favoriteValidation,
  authenticateJWT,
  requireFavoriteOwner,
  userController.addFavorite
);

// 11. Removes a movie from user's favorites by username and movie ID
router.delete(
  '/users/:username/:movieId',
  favoriteValidation,
  authenticateJWT,
  requireFavoriteOwner,
  userController.removeFavorite
);

export default router;