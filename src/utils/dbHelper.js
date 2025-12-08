/**
 * @file src/utils/dbHelper.js
 * @fileoverview Database query helpers for the REEL movie API
 * @module utils/dbHelper
 * @requires models/models
 * @author Dmitri Korotkov
 * @copyright Dmitri Korotkov 2025
 */

import { Movie } from '../models/models.js';

/**
 * Finds a movie by title
 * @param {String} title - Movie title
 * @returns {Promise<Object|null>} Movie object or null
 */
export const findMovieByTitle = async (title) => {
  return await Movie.findOne({ title });
};

/**
 * Finds a movie by ID
 * @param {String} movieId - Movie ID
 * @returns {Promise<Object|null>} Movie object or null
 */
export const findMovieById = async (movieId) => {
  return await Movie.findById(movieId);
};

/**
 * Finds a genre by name across all movies
 * @param {String} genreName - Genre name
 * @returns {Promise<Object|null>} Genre object or null
 */
export const findGenreByName = async (genreName) => {
  const movie = await Movie.findOne({ 'genre.name': genreName });
  return movie ? movie.genre : null;
};

/**
 * Finds a director by name across all movies
 * @param {String} directorName - Director name
 * @returns {Promise<Object|null>} Director object or null
 */
export const findDirectorByName = async (directorName) => {
  const movie = await Movie.findOne({ 'director.name': directorName });
  return movie ? movie.director : null;
};

/**
 * Gets starring cast for a movie by title
 * @param {String} title - Movie title
 * @returns {Promise<Array|null>} Array of actors or null
 */
export const findMovieStarring = async (title) => {
  const movie = await Movie.findOne({ title });
  return movie ? movie.starring : null;
};
