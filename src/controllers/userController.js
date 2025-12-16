/**
 * @file src/controllers/userController.js
 * @fileoverview User business logic for the REEL movie API
 * @module controllers/userController
 * @requires express-validator
 * @requires models/models
 * @author Dmitri Korotkov
 * @copyright Dmitri Korotkov 2025
 */

// --- Third-Party Frameworks & Utilities ---
import { validationResult } from 'express-validator';
// --- Local Modules (Must be imported/executed) ---
import { User, Movie } from '../models/models.js';

// ESSENTIAL FEATURES

/**
 * Returns a list of all users (admin only)
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).send('Error: ' + err);
  }
};

/**
 * Registers new user
 * @async
 * @param {Object} req - Express request object
 * @param {string} req.body.username - Username (5+ chars, alphanumeric)
 * @param {string} req.body.password - Password (8+ chars, no spaces)
 * @param {string} req.body.email - Email address
 * @param {string} [req.body.birth_date] - Optional birth date
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const newUser = req.body;
  const { username, password, email, birth_date } = newUser;

  if (!newUser || !username || !password || !email) {
    return res.status(400).send('Missing required fields (username, password, email) in request body');
  }

  try {
    const existingUser = await User.findOne({ username: username });
    if (existingUser) {
      return res.status(409).send('Username already exists');
    }

    const hashedPassword = await User.hashPassword(password);

    const createdUser = await User.create({
      username: username,
      password: hashedPassword,
      email: email,
      ...(birth_date && { birth_date: birth_date }),
    });

    const { password: _, tokenInvalidBefore: __, ...publicProfile } = createdUser.toObject();
    res.status(201).json(publicProfile);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).send('Username or email already exists.');
    }
    res.status(500).send('Error: ' + err.message);
  }
};

/**
 * Updates existing user info (username, password, email, date of birth)
 * @async
 * @param {Object} req - Express request object
 * @param {string} req.params.username - Current username
 * @param {string} [req.body.newUsername] - New username (optional)
 * @param {string} [req.body.newPassword] - New password (optional)
 * @param {string} [req.body.newEmail] - New email (optional)
 * @param {string} [req.body.newBirthDate] - New birth date (optional)
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const updateUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { username } = req.params;
  const { newUsername, newPassword, newEmail, newBirthDate } = req.body;

  try {
    const currentUser = req.user;

    if (newUsername !== undefined && newUsername !== currentUser.username) {
      const existingUser = await User.findOne({ username: newUsername });
      if (existingUser && existingUser._id.toString() !== currentUser._id.toString()) {
        return res.status(409).send('Username already exists');
      }
    }

    if (newEmail !== undefined && newEmail !== currentUser.email) {
      const existingEmailUser = await User.findOne({ email: newEmail });
      if (existingEmailUser && existingEmailUser._id.toString() !== currentUser._id.toString()) {
        return res.status(409).send('Email already exists');
      }
    }

    const updateFields = {};
    if (newUsername !== undefined) updateFields.username = newUsername;
    if (newPassword !== undefined) {
      const hashedNewPassword = await User.hashPassword(newPassword);
      updateFields.password = hashedNewPassword;
    }
    if (newEmail !== undefined) updateFields.email = newEmail;
    if (newBirthDate !== undefined) updateFields.birth_date = newBirthDate;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).send('No fields provided for update.');
    }

    const shouldRevoke = newUsername !== undefined || newPassword !== undefined;
    const updateDoc = shouldRevoke
      ? { $set: { ...updateFields, tokenInvalidBefore: new Date() } }
      : { $set: updateFields };

    const updatedUser = await User.findByIdAndUpdate(currentUser._id, updateDoc, { new: true });

    if (!updatedUser) {
      return res.status(404).send(`User ${username} not found`);
    }

    const { password: _, tokenInvalidBefore: __, ...publicProfile } = updatedUser.toObject();
    return res.status(200).json(publicProfile);
  } catch (err) {
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

    res.status(500).send('Error: ' + err.message);
  }
};

/**
 * Deregisters (deletes) user with provided username
 * @async
 * @param {Object} req - Express request object
 * @param {string} req.params.username - Username to delete
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const deleteUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { username } = req.params;

  try {
    const user = await User.findOneAndDelete({ username: username });
    if (user) {
      res.status(200).send(`User ${username} was deregistered`);
    } else {
      res.status(404).send(`User ${username} not found`);
    }
  } catch (err) {
    res.status(500).send('Error: ' + err);
  }
};

// OPTIONAL FEATURES

/**
 * Adds a movie to a user's favorites by username and movie ID
 * @async
 * @param {Object} req - Express request object
 * @param {string} req.params.username - Username
 * @param {string} req.params.movieId - Movie ID
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const addFavorite = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { username, movieId } = req.params;

  try {
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).send(`Movie with ID ${movieId} not found.`);
    }

    const updatedUser = await User.findOneAndUpdate(
      { username: username },
      { $addToSet: { favorites: movieId } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).send(`User ${username} not found.`);
    }

    const { password: _, tokenInvalidBefore: __, ...publicProfile } = updatedUser.toObject();
    res.status(200).json(publicProfile);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: ' + err.message);
  }
};

/**
 * Removes a movie from user's favorites by username and movie ID
 * @async
 * @param {Object} req - Express request object
 * @param {string} req.params.username - Username
 * @param {string} req.params.movieId - Movie ID
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const removeFavorite = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { username, movieId } = req.params;

  try {
    const movie = await Movie.findById(movieId).select('_id');
    if (!movie) {
      return res.status(404).send(`Movie with ID ${movieId} not found.`);
    }

    const updatedUser = await User.findOneAndUpdate(
      { username: username },
      { $pull: { favorites: movieId } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).send(`User ${username} not found.`);
    }

    const { password: _, tokenInvalidBefore: __, ...publicProfile } = updatedUser.toObject();
    res.status(200).json(publicProfile);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: ' + err.message);
  }
};
