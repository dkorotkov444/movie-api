/**
 * @file src/middleware/auth.js
 * @fileoverview Authentication and authorization middleware for the REEL movie API
 * @module middleware/auth
 * @requires passport
 * @author Dmitri Korotkov
 * @copyright Dmitri Korotkov 2025
 */

// --- Third-Party Frameworks & Utilities ---
import passport from 'passport';

/**
 * Middleware to authenticate JWT token
 * @type {Function}
 */
export const authenticateJWT = passport.authenticate('jwt', { session: false });

/**
 * Middleware to check if user is admin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
export const requireAdmin = (req, res, next) => {
  const { ADMIN_USERNAME } = process.env;
  
  if (!req.user || req.user.username !== ADMIN_USERNAME) {
    return res.status(403).send('Permission denied: only admin can access this resource.');
  }
  
  next();
};

/**
 * Middleware to check if user is accessing their own profile or is admin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
export const requireOwnerOrAdmin = (req, res, next) => {
  const { ADMIN_USERNAME } = process.env;
  const { username } = req.params;

  if (req.user.username !== username && req.user.username !== ADMIN_USERNAME) {
    return res.status(403).send('Permission denied: you can only access your own profile.');
  }

  next();
};

/**
 * Middleware to check if user can modify their own favorites
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
export const requireFavoriteOwner = (req, res, next) => {
  const { username } = req.params;

  if (req.user.username !== username) {
    return res.status(403).send('Permission denied: you can only update your own favorites list.');
  }

  next();
};
