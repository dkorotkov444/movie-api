/**
 * @file src/middleware/errorHandler.js
 * @fileoverview Centralized error handling middleware for the REEL movie API
 * @module middleware/errorHandler
 * @author Dmitri Korotkov
 * @copyright Dmitri Korotkov 2025
 */

/**
 * Middleware to handle MongoDB duplicate key errors
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
export const handleDuplicateKeyError = (err, req, res, next) => {
  if (err && err.code === 11000) {
    const duplicateKey = err.keyValue ? Object.keys(err.keyValue)[0] : null;
    
    if (duplicateKey === 'username') {
      return res.status(409).send('Error: Username already exists. Please choose a different username.');
    }
    if (duplicateKey === 'email') {
      return res.status(409).send('Error: Email already exists. Please use a different email address.');
    }
    
    return res.status(409).send('Error: Duplicate key error.');
  }

  next();
};

/**
 * Middleware to handle validation errors
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
export const handleValidationError = (err, req, res, next) => {
  if (err.validation) {
    return res.status(422).json({ errors: err.validation });
  }

  next();
};

/**
 * Global error handler (should be last middleware)
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
export const globalErrorHandler = (err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  res.status(err.status || 500).send({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Helper function to send error responses consistently
 * @param {Object} res - Express response object
 * @param {number} status - HTTP status code
 * @param {string} message - Error message
 * @returns {void}
 */
export const sendErrorResponse = (res, status, message) => {
  res.status(status).send(message);
};
