/**
 * @file src/controllers/movieController.js
 * @fileoverview Movie business logic for the REEL movie API
 * @module controllers/movieController
 * @requires models/models
 * @requires utils/dbHelper
 * @requires utils/responseHelper
 * @author Dmitri Korotkov
 * @copyright Dmitri Korotkov 2025
 */

// --- Local Modules (Must be imported/executed) ---
import { Movie } from '../models/models.js';
import { findMovieByTitle, findGenreByName, findDirectorByName, findMovieStarring } from '../utils/dbHelper.js';
import { toPublicProfile } from '../utils/responseHelper.js';

// ESSENTIAL FEATURES

/**
 * Returns the list of all movies (titles only)
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const getMoviesList = async (req, res) => {
  try {
    const movies = await Movie.find();
    res.status(200).json(movies.map((movie) => movie.title));
  } catch (err) {
    res.status(500).json({ error: 'Error: ' + err });
  }
};

/**
 * Returns complete information about all movies
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const getAllMovies = async (req, res) => {
  try {
    const movies = await Movie.find();
    res.status(200).json(movies.map((movie) => toPublicProfile(movie)));
  } catch (err) {
    res.status(500).json({ error: 'Error: ' + err });
  }
};

/**
 * Returns data (description, genre, director, image URL, etc.) about a single movie by title
 * @async
 * @param {Object} req - Express request object
 * @param {string} req.params.title - Movie title
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const getMovieByTitle = async (req, res) => {
  const { title } = req.params;
  try {
    const movie = await findMovieByTitle(title);
    if (movie) {
      res.status(200).json(toPublicProfile(movie));
    } else {
      res.status(400).json({ error: `Movie ${title} not found` });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error: ' + err });
  }
};

/**
 * Returns data about a genre (description) by name (e.g., "Thriller")
 * @async
 * @param {Object} req - Express request object
 * @param {string} req.params.genreName - Genre name
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const getGenreByName = async (req, res) => {
  const { genreName } = req.params;
  try {
    const genre = await findGenreByName(genreName);
    if (genre) {
      res.status(200).json(genre);
    } else {
      res.status(400).json({ error: `Genre ${genreName} not found` });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error: ' + err });
  }
};

/**
 * Returns data about a director (name, bio, birth year, death year) by name
 * @async
 * @param {Object} req - Express request object
 * @param {string} req.params.directorName - Director name
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const getDirectorByName = async (req, res) => {
  const { directorName } = req.params;
  try {
    const director = await findDirectorByName(directorName);
    if (director) {
      res.status(200).json(director);
    } else {
      res.status(400).json({ error: `Director ${directorName} not found` });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error: ' + err });
  }
};

// OPTIONAL FEATURES

/**
 * Returns the list of actors starring in the movie
 * @async
 * @param {Object} req - Express request object
 * @param {string} req.params.title - Movie title
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const getMovieStarring = async (req, res) => {
  const { title } = req.params;
  try {
    const starring = await findMovieStarring(title);
    if (starring) {
      res.status(200).json(starring);
    } else {
      res.status(400).json({ error: `Movie ${title} not found` });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error: ' + err });
  }
};
