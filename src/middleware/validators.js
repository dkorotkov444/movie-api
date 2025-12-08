/**
 * @file src/middleware/validators.js
 * @fileoverview Input validation rules for the REEL movie API
 * @module middleware/validators
 * @requires express-validator
 * @author Dmitri Korotkov
 * @copyright Dmitri Korotkov 2025
 */

// --- Third-Party Frameworks & Utilities ---
import { check, param } from 'express-validator';

/**
 * Validation rules for user registration
 * @type {Array}
 */
export const registerValidation = [
  check('username')
    .isString().withMessage('Username must be a string')
    .isLength({ min: 5 }).withMessage('Username must be at least 5 characters long')
    .isAlphanumeric().withMessage('Username must contain only letters and numbers'),
  check('password')
    .not()
    .isEmpty()
    .withMessage('Password is required')
    .isString()
    .withMessage('Password must be a string')
    .custom((value) => {
      if (typeof value !== 'string') return false;
      if (value.includes(' ')) throw new Error('Password must not contain spaces');
      return true;
    })
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  check('email').isEmail().withMessage('Invalid email format'),
  check('birth_date').optional({ values: 'falsy' }).isDate().withMessage('Invalid date format'),
];

/**
 * Validation rules for user update
 * @type {Array}
 */
export const updateUserValidation = [
  check('newUsername')
    .optional()
    .isString().withMessage('Username must be a string')
    .isLength({ min: 5 }).withMessage('Username must be at least 5 characters long')
    .isAlphanumeric().withMessage('Username must contain only letters and numbers'),
  check('newPassword')
    .optional()
    .isString().withMessage('Password must be a string')
    .custom((value) => {
      if (typeof value !== 'string') return false;
      if (value.includes(' ')) throw new Error('Password must not contain spaces');
      return true;
    })
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  check('newEmail').optional().isEmail().withMessage('Invalid email format'),
  check('newBirthDate').optional().isDate().withMessage('Invalid date format'),
  param('username')
    .isString().withMessage('Username must be a string')
    .isLength({ min: 5 }).withMessage('Username must be at least 5 characters long')
    .isAlphanumeric().withMessage('Username must contain only letters and numbers'),
];

/**
 * Validation rules for user deletion
 * @type {Array}
 */
export const deleteUserValidation = [
  param('username')
    .isString().withMessage('Username must be a string')
    .isLength({ min: 5 }).withMessage('Username must be at least 5 characters long')
    .isAlphanumeric().withMessage('Username must contain only letters and numbers'),
];

/**
 * Validation rules for favorite operations
 * @type {Array}
 */
export const favoriteValidation = [
  param('username')
    .isString().withMessage('Username must be a string')
    .isLength({ min: 5 }).withMessage('Username must be at least 5 characters long')
    .isAlphanumeric().withMessage('Username must contain only letters and numbers'),
  param('movieId').isMongoId().withMessage('Movie ID must be a valid MongoDB ObjectID'),
];
