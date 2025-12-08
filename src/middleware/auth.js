/*  auth.js
* Authentication and authorization middleware for the REEL movie API
* Uses ESM syntax
* Copyright Dmitri Korotkov 2025
*/

// --- Third-Party Frameworks & Utilities ---
import passport from 'passport';

// Middleware to authenticate JWT token
export const authenticateJWT = passport.authenticate('jwt', { session: false });

// Middleware to check if user is admin
export const requireAdmin = (req, res, next) => {
  const { ADMIN_USERNAME } = process.env;
  
  if (!req.user || req.user.username !== ADMIN_USERNAME) {
    return res.status(403).send('Permission denied: only admin can access this resource.');
  }
  
  next();
};

// Middleware to check if user is accessing their own profile
export const requireOwnerOrAdmin = (req, res, next) => {
  const { ADMIN_USERNAME } = process.env;
  const { username } = req.params;

  if (req.user.username !== username && req.user.username !== ADMIN_USERNAME) {
    return res.status(403).send('Permission denied: you can only access your own profile.');
  }

  next();
};

// Middleware to check if user can modify their own favorites
export const requireFavoriteOwner = (req, res, next) => {
  const { username } = req.params;

  if (req.user.username !== username) {
    return res.status(403).send('Permission denied: you can only update your own favorites list.');
  }

  next();
};
