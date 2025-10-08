/*  index.js
* Main JavaScript file of the REEL movie API
* Uses ESM syntax
*/

// --- IMPORTS ---
// --- Core Node.js Modules ---
// import fs from 'fs';                        // Import filesystem module
// import path from 'path';                    // Import path module
// import { fileURLToPath } from 'url';        // Import fileURLToPath from the url module
// --- Third-Party Frameworks & Utilities ---
import dotenv from 'dotenv';                // Import dotenv to manage environment variables
import express from 'express';              // Import Express framework
import morgan from 'morgan';                // Import Morgan logging library
import mongoose from 'mongoose';            // Import Mongoose ODM
import passport from 'passport';            // Import passport authentication module
import cors from 'cors';                    // Import CORS to manage cross-origin requests
import { check, param, validationResult } from 'express-validator'; // Import express-validator for input validation
// --- Local Modules (Must be imported/executed) ---
import { User, Movie } from './models/models.js';  // Import User and Movie models
import './config/passport.js';                     // Import passport strategies (runs passport.js) 
import authRouter from './routes/auth.js';         // Imports Router function from auth.js


// --- ENVIRONMENT CONFIGURATION ---
dotenv.config();                            // Load environment variables from .env file
const { ADMIN_USERNAME, DB_URI, LOCAL_PORT } = process.env; // Destructure environment variables

// --- APPLICATION CONSTANTS ---

// Get the directory name for the current module in ESM
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// Define at which port runs the web server (1. Heroku PORT, 2. .env LOCAL_PORT, 3. default 8080)
const myPort = process.env.PORT || LOCAL_PORT || 8080;
// const allowedOrigins = [`http://localhost:${myPort}`]; // Define allowed origins for CORS


// --- CONNECT TO MongoDB DATABASE ---
// Start server ONLY after successful DB connection
mongoose.connect(DB_URI)
  .then(() => {
    console.log('Connected to MongoDB.');
    app.listen(myPort, '0.0.0.0', () => {
        console.log(`REEL app listening on port ${myPort}.`);
    });
  })
  .catch(err => {
    console.error('DB connection failed. Server not started.', err);
    process.exit(1); 
  });

// Create an Express application
const app = express();

// Create a local write stream (in append mode) into a 'logs/access.log' file
// const accessLogStream = fs.createWriteStream(path.join(__dirname, 'logs', 'access.log'), { flags: 'a' });

// --- INVOKE MIDDLEWARE ---
app.use(cors());                           // Enable CORS for all origins (for development purposes only; restrict in production)
/*
// Security/External Access (CORS)
app.use(cors({
  origin: (origin, callback) => {
    // Allows requests with no origin (like mobile apps or curl requests)
    if(!origin) return callback(null, true); 
    
    // Check if the requesting origin is in our allowed list
    if(allowedOrigins.indexOf(origin) === -1){
      let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
      return callback(new Error(message), false); // Deny access
    }
    
    // Allow access
    return callback(null, true); 
  }}));
*/
// app.use(morgan('common', {stream: accessLogStream}));  // Use Morgan logging in standard format (before express.static to log files return)
app.use(morgan('common'));  // Use Morgan logging directly to stdout, which Heroku's Logplex captures
app.use(express.json());  // Parse JSON
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies (as sent by HTML forms)
app.use ('/', authRouter);  // Use the auth.js file for all requests to root URL (login)


// --- API ENDPOINTS ---

// Receive user input
app.get('/', (req,res) => {
  res.send(`User detected in the root at the port ${myPort}`);
});

// ESSENTIAL FEATURES

// 1. Returns the list of all movies (titles only)
app.get('/movies/list', passport.authenticate('jwt', { session: false }), async(req,res) => {
  await Movie.find()
    .then(movies => res.status(200).json(movies.map(movie => movie.title)))
    .catch(err => res.status(500).send('Error: ' + err));
});

// 2. Returns complete information about all movies
app.get('/movies', passport.authenticate('jwt', { session: false }), async(req,res) => {
  await Movie.find()
    .then(movies => res.status(200).json(movies))
    .catch(err => res.status(500).send('Error: ' + err));
});

// 3. Returns data (description, genre, director, image URL, etc.) about a single movie by title
app.get('/movies/:title', passport.authenticate('jwt', { session: false }), async(req,res) => {
  const { title } = req.params;
  await Movie.findOne({ title: title })
    .then(movie => {
      if (movie) {
        res.status(200).json(movie)
      } else {
        res.status(400).send(`Movie ${title} not found`)
      }
    })
    .catch(err => res.status(500).send('Error: ' + err));
});

// 4. Returns data about a genre (description) by name (e.g., “Thriller”) 
app.get('/movies/genres/:genreName', passport.authenticate('jwt', { session: false }), async (req,res) => {
  const { genreName } = req.params;
  await Movie.findOne({ 'genre.name': genreName })
    .then(movie => {
      if (movie) {
        res.status(200).json(movie.genre);
      } else {
        res.status(400).send(`Genre ${genreName} not found`);
      }
    })
    .catch(err => res.status(500).send('Error: ' + err));
});

// 5. Returns data about a director (name, bio, birth year, death year) by name
app.get('/movies/directors/:directorName', passport.authenticate('jwt', { session: false }), async (req,res) => {
  const { directorName } = req.params;
  await Movie.findOne({ 'director.name': directorName })
    .then(movie => {
      if (movie) {
        res.status(200).json(movie.director);
      } else {
        res.status(400).send(`Director ${directorName} not found`);
      }
    })
    .catch(err => res.status(500).send('Error: ' + err));
});

// 6. Returns a list of all users
app.get('/users', passport.authenticate('jwt', { session: false }), async (req,res) => {

  // Validate that only "admin" user can access the list of users
  if (req.user.username !== ADMIN_USERNAME) {
    return res.status(403).send('Permission denied: only admin can access this resource.');
  }

  await User.find()
    .then(users => res.status(200).json(users))
    .catch(err => res.status(500).send('Error: ' + err));
});

// 7. Registers new user
app.post('/users', 
  [ check('username')
      .isString().withMessage('Username must be a string')
      .isLength({ min: 5 }).withMessage('Username must be at least 5 characters long')
      .isAlphanumeric().withMessage('Username must contain only letters and numbers'),
    check('password')
      .not().isEmpty().withMessage('Password is required')
      .isString().withMessage('Password must be a string')
      .custom(value => {
        if (typeof value !== 'string') return false;
        if (value.includes(' ')) throw new Error('Password must not contain spaces');
        return true;
      })
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    check('email').isEmail().withMessage('Invalid email format'),
    check('birth_date').isDate().withMessage('Invalid date format'),
  ], 
  async (req,res) => {

    // Check the validation object for errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    // Extract the user info from the JSON request body
    const newUser = req.body;
    const { username, password, email, birth_date, favorites } = newUser;
    
    // Check if required fields are provided
    if (!newUser || !username || !password || !email) {
      return res.status(400).send('Missing required fields (username, password, email) in request body');
    }

    try {
      // Check if username already exists
      const existingUser = await User.findOne({ username: username });
      if (existingUser) {
        return res.status(409).send('Username already exists'); // Stop processing and return error
      }

      // Hash the password
      const hashedPassword = await User.hashPassword(password);

      // Create and save the new user
      const createdUser = await User.create({
        username: username,
        password: hashedPassword, // Store the hashed password
        email: email,
        birth_date: birth_date,
        favorites: favorites || [] // Default to empty array if not provided
      });

      // Strip Mongoose properties and exclude password from the response
      const { password: _, ...publicProfile } = createdUser.toObject(); // Use throwaway variable to exclude password
      res.status(201).json(publicProfile);  // Return the public profile without password

    } catch (err) {
      // Catch all async errors
      console.error(err);
      // Handle Mongoose unique index violation error (e.g., if email already exists)
      if (err.code === 11000) {
          return res.status(409).send('Username or email already exists.');
      }
      // Catch all other server/databaseerrors (including potential hashing errors)
      res.status(500).send('Error: ' + err.message);
    }
});

// 8. Updates existing user info (username, password, email, date of birth)
app.patch('/users/:username', 
  [ check('newUsername')
      .optional()
      .isString().withMessage('Username must be a string')
      .isLength({ min: 5 }).withMessage('Username must be at least 5 characters long')
      .isAlphanumeric().withMessage('Username must contain only letters and numbers'),
    check('newPassword')
      .optional()
      .isString().withMessage('Password must be a string')
      .custom(value => {
        if (typeof value !== 'string') return false;
        if (value.includes(' ')) throw new Error('Password must not contain spaces');
        return true;
      })
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    check('newEmail')
      .optional()
      .isEmail().withMessage('Invalid email format'),
    check('newBirthDate')
      .optional()
      .isDate().withMessage('Invalid date format'),
    param('username')
      .isString().withMessage('Username must be a string')
      .isLength({ min: 5 }).withMessage('Username must be at least 5 characters long')
      .isAlphanumeric().withMessage('Username must contain only letters and numbers'),
  ],
  passport.authenticate('jwt', { session: false }), async (req, res) => {

    // Check the validation object for errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    } 

    // Extract the username from the URL and new user info from the request body
    const { username } = req.params;
    const { newUsername, newPassword, newEmail, newBirthDate } = req.body;

    // Validate that user updates own profile by checking if the authenticated user's username matches the username in the URL
    if (req.user.username !== username) {
      return res.status(403).send('Permission denied: you can only update your own profile.');
    }

    // Hash the new password
    const hashedNewPassword = await User.hashPassword(newPassword);

    try {
      // Build the update object with only the properties that exist in the request body
      const updateFields = {};
      if (newUsername !== undefined) updateFields.username = newUsername;
      if (newPassword !== undefined) updateFields.password = hashedNewPassword;
      if (newEmail !== undefined) updateFields.email = newEmail;
      if (newBirthDate !== undefined) updateFields.birth_date = newBirthDate;

      // Check if there are any fields to update
      if (Object.keys(updateFields).length === 0) {
        return res.status(400).send('No fields provided for update.');
      }
      // Use findOneAndUpdate to find and update the user document
      const updatedUser = await User.findOneAndUpdate(
        { username: username },
        { $set: updateFields },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).send(`User ${username} not found`);
      }

      // Strip Mongoose properties and exclude password from the response
      const { password, ...publicProfile } = updatedUser.toObject();
      res.status(200).json(publicProfile);

    } catch (err) {
      console.error(err);
      res.status(500).send('Error: ' + err.message);
    }
});

// 9. Deregisters (deletes) user with provided username
app.delete('/users/:username', 
  [ param('username')
      .isString().withMessage('Username must be a string')
      .isLength({ min: 5 }).withMessage('Username must be at least 5 characters long')
      .isAlphanumeric().withMessage('Username must contain only letters and numbers'),
  ],
  passport.authenticate('jwt', { session: false }), async (req,res) => {

    // Check the validation object for errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    // Extract the username from the URL
    const {username} = req.params;
    
    // Validate that user deletes own profile by checking if the authenticated user's username matches the username in the URL
    if (req.user.username !== username) {
      return res.status(403).send('Permission denied: you can only delete your own profile.');
    }

    await User.findOneAndDelete({ username: username })
      .then(user => {
        if (user) {
          res.status(200).send(`User ${username} was deregistered`);
        } else {
          res.status(404).send(`User ${username} not found`);
        }
      })
      .catch(err => res.status(500).send('Error: ' + err));
});

// 10. Adds a movie to a user's favorites by username and movie title
app.patch('/users/:username/:movieTitle', 
  [ param('username')
      .isString().withMessage('Username must be a string')
      .isLength({ min: 5 }).withMessage('Username must be at least 5 characters long')
      .isAlphanumeric().withMessage('Username must contain only letters and numbers'),
    param('movieTitle')
      .isString().withMessage('Movie title must be a string')
      .isLength({ min: 2 }).withMessage('Movie title must be at least 2 characters long')
      .isAlphanumeric().withMessage('Movie title must contain only letters and numbers and spaces') // Note: Adjust this validation if needed to allow special characters in movie titles
  ],
  passport.authenticate('jwt', { session: false }), async (req, res) => {

    // Check the validation object for errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    
    // Extract the username and movie title from the URL
    const { username, movieTitle } = req.params;
    
    // Validate that user updates own favorites by checking if the authenticated user's username matches the username in the URL
    if (req.user.username !== username) {
      return res.status(403).send('Permission denied: you can only update your own favorites list.');
    }

    try {
      // Find the movie document to get its _id
      const movie = await Movie.findOne({ title: movieTitle }).select('_id');
      if (!movie) {
        return res.status(404).send(`Movie ${movieTitle} not found.`);
      }
      // Use findOneAndUpdate with $addToSet to add the movie to favorites
      const updatedUser = await User.findOneAndUpdate(
        { username: username },
        { $addToSet: { favorites: movie._id } },
        { new: true } // { new: true } returns the updated document
      );

      if (!updatedUser) {
        return res.status(404).send(`User ${username} not found.`);
      }
      // Strip Mongoose properties and exclude password from the response
      const { password, ...publicProfile } = updatedUser.toObject();
      res.status(200).json(publicProfile);

    } catch (err) {
      console.error(err);
      res.status(500).send('Error: ' + err.message);
    }
});

// 11. Removes a movie from user's favorites by username and movie title
app.delete('/users/:username/:movieTitle', 
  [ param('username')
      .isString().withMessage('Username must be a string')
      .isLength({ min: 5 }).withMessage('Username must be at least 5 characters long')
      .isAlphanumeric().withMessage('Username must contain only letters and numbers'),
    param('movieTitle')
      .isString().withMessage('Movie title must be a string')
      .isLength({ min: 2 }).withMessage('Movie title must be at least 2 characters long')
      .isAlphanumeric().withMessage('Movie title must contain only letters and numbers and spaces') // Note: Adjust this validation if needed to allow special characters in movie titles
  ],
  passport.authenticate('jwt', { session: false }), async (req, res) => {
    // Check the validation object for errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    // Extract the username and movie title from the URL
    const { username, movieTitle } = req.params;
      
    // Validate that user updates own favorites by checking if the authenticated user's username matches the username in the URL
    if (req.user.username !== username) {
      return res.status(403).send('Permission denied: you can only update your own favorites list.');
    }

    try {
      // Find the movie document to get its _id
      const movie = await Movie.findOne({ title: movieTitle }).select('_id');
      if (!movie) {
        return res.status(404).send(`Movie ${movieTitle} not found.`);
      }
      // Use findOneAndUpdate with $pull to remove the movie from favorites
      const updatedUser = await User.findOneAndUpdate(
        { username: username },
        { $pull: { favorites: movie._id } },
        { new: true } // { new: true } returns the updated document
      );

      if (!updatedUser) {
        return res.status(404).send(`User ${username} not found.`);
      }

      // Strip Mongoose properties and exclude password from the response
      const { password, ...publicProfile } = updatedUser.toObject();
      res.status(200).json(publicProfile);

    } catch (err) {
      console.error(err);
      res.status(500).send('Error: ' + err.message);
    }
});

// OPTIONAL FEATURES

// 12. Returns the list of actors starring in the movie
app.get('/movies/:title/starring', passport.authenticate('jwt', { session: false }), async (req,res) => {
  const { title } = req.params;
  await Movie.findOne({ title: title })
    .then(movie => {
      if (movie) {
        res.status(200).json(movie.starring);
      } else {
        res.status(400).send(`Movie ${title} not found`);
      }
    })
    .catch(err => res.status(500).send('Error: ' + err));
});

/*/ Returns information about actor  --- ENDPOINT TESTED, NO LOGIC YET
//app.get('/movies/actors/:actorName', (req,res) => {
//  res.send('Sucessful GET request returning info about actor');    
//});*/

// Catch and process any remaining errors
app.use((error, req, res, next) => {
    console.error(error.stack);
    res.status(500).send('Application error');
});

