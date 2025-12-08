/**
 * @file src/routes/movies.js
 * @fileoverview Movie routes for the REEL movie API
 * @module routes/movies
 * @requires express
 * @requires controllers/movieController
 * @requires middleware/auth
 * @author Dmitri Korotkov
 * @copyright Dmitri Korotkov 2025
 */

// --- Third-Party Frameworks & Utilities ---
import { Router } from 'express';
// --- Local Modules (Must be imported/executed) ---
import * as movieController from '../controllers/movieController.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

// ESSENTIAL FEATURES

// 1. Returns the list of all movies (titles only)
router.get('/movies/list', authenticateJWT, movieController.getMoviesList);

// 2. Returns complete information about all movies
router.get('/movies', authenticateJWT, movieController.getAllMovies);

// 3. Returns data (description, genre, director, image URL, etc.) about a single movie by title
router.get('/movies/:title', authenticateJWT, movieController.getMovieByTitle);

// 4. Returns data about a genre (description) by name (e.g., "Thriller")
router.get('/movies/genres/:genreName', authenticateJWT, movieController.getGenreByName);

// 5. Returns data about a director (name, bio, birth year, death year) by name
router.get('/movies/directors/:directorName', authenticateJWT, movieController.getDirectorByName);

// OPTIONAL FEATURES

// 6. Returns the list of actors starring in the movie
router.get('/movies/:title/starring', authenticateJWT, movieController.getMovieStarring);

export default router;