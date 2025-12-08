/**
 * @file src/middleware/sanitize.js
 * @fileoverview Response sanitization middleware for the REEL movie API
 * @description Removes sensitive fields before sending responses to clients
 * @module middleware/sanitize
 * @author Dmitri Korotkov
 * @copyright Dmitri Korotkov 2025
 */

// Sensitive fields that should never be sent to clients
const SENSITIVE_FIELDS = ['password', 'tokenInvalidBefore'];

/**
 * Sanitizes user objects by removing sensitive fields
 * @param {Object} user - User object or array of users
 * @returns {Object|Array} Sanitized user(s)
 */
export const sanitizeUser = (user) => {
  if (Array.isArray(user)) {
    return user.map((u) => sanitizeUserObject(u));
  }
  
  return sanitizeUserObject(user);
};

/**
 * Helper function to sanitize a single user object
 * @param {Object} user - User object to sanitize
 * @returns {Object} Sanitized user object
 */
const sanitizeUserObject = (user) => {
  if (!user) return null;

  const userObj = user.toObject ? user.toObject() : user;
  const { password, tokenInvalidBefore, ...sanitized } = userObj;
  
  return sanitized;
};

/**
 * Middleware to sanitize response data before sending
 * Wraps res.json to automatically sanitize user data
 */
export const sanitizeResponseMiddleware = (req, res, next) => {
  const originalJson = res.json;

  res.json = function (data) {
    // Sanitize user data if present
    if (data && data.username) {
      // Single user object
      data = sanitizeUser(data);
    } else if (Array.isArray(data) && data.length > 0 && data[0].username) {
      // Array of users
      data = sanitizeUser(data);
    }

    return originalJson.call(this, data);
  };

  next();
};

/**
 * Helper function to check if a field is sensitive
 * @param {String} field - Field name to check
 * @returns {Boolean} True if field is sensitive
 */
export const isSensitiveField = (field) => SENSITIVE_FIELDS.includes(field);
