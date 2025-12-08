/*  movieController.js
* Movie business logic for the REEL movie API
* Uses ESM syntax
* Copyright Dmitri Korotkov 2025
*/

// --- Local Modules (Must be imported/executed) ---
import { Movie } from '../models/models.js';
import { findMovieByTitle, findGenreByName, findDirectorByName, findMovieStarring } from '../utils/dbHelper.js';
import { toPublicProfile } from '../utils/responseHelper.js';

// ESSENTIAL FEATURES

// 1. Returns the list of all movies (titles only)
export const getMoviesList = async (req, res) => {
  try {
    const movies = await Movie.find();
    res.status(200).json(movies.map((movie) => movie.title));
  } catch (err) {
    res.status(500).send('Error: ' + err);
  }
};

// 2. Returns complete information about all movies
export const getAllMovies = async (req, res) => {
  try {
    const movies = await Movie.find();
    res.status(200).json(movies.map((movie) => toPublicProfile(movie)));
  } catch (err) {
    res.status(500).send('Error: ' + err);
  }
};

// 3. Returns data (description, genre, director, image URL, etc.) about a single movie by title
export const getMovieByTitle = async (req, res) => {
  const { title } = req.params;
  try {
    const movie = await findMovieByTitle(title);
    if (movie) {
      res.status(200).json(toPublicProfile(movie));
    } else {
      res.status(400).send(`Movie ${title} not found`);
    }
  } catch (err) {
    res.status(500).send('Error: ' + err);
  }
};

// 4. Returns data about a genre (description) by name (e.g., "Thriller")
export const getGenreByName = async (req, res) => {
  const { genreName } = req.params;
  try {
    const genre = await findGenreByName(genreName);
    if (genre) {
      res.status(200).json(genre);
    } else {
      res.status(400).send(`Genre ${genreName} not found`);
    }
  } catch (err) {
    res.status(500).send('Error: ' + err);
  }
};

// 5. Returns data about a director (name, bio, birth year, death year) by name
export const getDirectorByName = async (req, res) => {
  const { directorName } = req.params;
  try {
    const director = await findDirectorByName(directorName);
    if (director) {
      res.status(200).json(director);
    } else {
      res.status(400).send(`Director ${directorName} not found`);
    }
  } catch (err) {
    res.status(500).send('Error: ' + err);
  }
};

// OPTIONAL FEATURES

// 12. Returns the list of actors starring in the movie
export const getMovieStarring = async (req, res) => {
  const { title } = req.params;
  try {
    const starring = await findMovieStarring(title);
    if (starring) {
      res.status(200).json(starring);
    } else {
      res.status(400).send(`Movie ${title} not found`);
    }
  } catch (err) {
    res.status(500).send('Error: ' + err);
  }
};
