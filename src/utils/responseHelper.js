/*  responseHelper.js
* Response sanitization helper for the REEL movie API
* Uses ESM syntax
* Copyright Dmitri Korotkov 2025
*/

const SENSITIVE_FIELDS = ['password', 'tokenInvalidBefore'];

/**
 * Converts Mongoose document to plain object and removes sensitive fields
 * @param {Object|Array} doc - Mongoose document(s)
 * @param {Array<String>} fieldsToOmit - Additional fields to exclude
 * @returns {Object|Array} Sanitized plain object(s)
 */
export const toPublicProfile = (doc, fieldsToOmit = []) => {
  const fieldsToRemove = [...SENSITIVE_FIELDS, ...fieldsToOmit];

  if (Array.isArray(doc)) {
    return doc.map((d) => sanitizeObject(d, fieldsToRemove));
  }

  return sanitizeObject(doc, fieldsToRemove);
};

/**
 * Helper to sanitize a single object
 * @private
 */
const sanitizeObject = (obj, fieldsToRemove) => {
  if (!obj) return null;

  const plainObj = obj.toObject ? obj.toObject() : obj;
  const sanitized = { ...plainObj };

  fieldsToRemove.forEach((field) => {
    delete sanitized[field];
  });

  return sanitized;
};
