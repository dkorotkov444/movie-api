/**
 * @file src/index.js
 * @fileoverview Main entry point for the REEL movie API
 * @module index
 * @requires dotenv
 * @requires express
 * @requires morgan
 * @requires mongoose
 * @requires passport
 * @requires cors
 * @author Dmitri Korotkov
 * @copyright Dmitri Korotkov 2025
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
// --- Local Modules (Must be imported/executed) ---
import './config/passport.js';                     // Import passport strategies (runs passport.js)
import authRouter from './routes/auth.js';         // Import auth router (login endpoint + JWT generation)
import movieRoutes from './routes/movies.js';      // Import movie routes (movie queries)
import userRoutes from './routes/users.js';        // Import user routes (registration, profile, favorites)
import { sanitizeResponseMiddleware } from './middleware/sanitize.js';
import { handleDuplicateKeyError, handleValidationError, globalErrorHandler } from './middleware/errorHandler.js';


// --- ENVIRONMENT CONFIGURATION ---
dotenv.config();                            // Load environment variables from .env file
const { ADMIN_USERNAME, DB_URI, LOCAL_PORT } = process.env; // Destructure environment variables

// --- APPLICATION CONSTANTS ---

// Get the directory name for the current module in ESM
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// Define at which port runs the web server (1. Heroku PORT, 2. .env LOCAL_PORT, 3. default 8080)
const myPort = process.env.PORT || LOCAL_PORT || 8080;
const allowedOrigins = [                // Define allowed origins for CORS
    `http://localhost:${myPort}`, 
    'http://localhost:1234',
    'https://reel-movies.netlify.app'
]; 


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

// Security/External Access (CORS)
app.use(cors({
  origin: (origin, callback) => {
    // Allows requests with no origin (like mobile apps or curl requests)
    if(!origin) return callback(null, true); 
    // Check if the requesting origin is in allowed list
    if(allowedOrigins.indexOf(origin) === -1){
      let message = 'The CORS policy for this application does not allow access from origin ' + origin;
      return callback(new Error(message), false); // Deny access
    }
        // Allow access
    return callback(null, true);
  }
}));

// app.use(morgan('common', {stream: accessLogStream}));  // Use Morgan logging in standard format (before express.static to log files return)
app.use(morgan('common'));  // Use Morgan logging directly to stdout, which Heroku's Logplex captures
app.use(express.json());  // Parse JSON
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies (as sent by HTML forms)

// Sanitize responses before sending to client
app.use(sanitizeResponseMiddleware);

app.use('/', authRouter);  // Use the auth.js file for all requests to root URL (login)
app.use('/', movieRoutes);
app.use('/', userRoutes);


// --- API ENDPOINTS ---

// Receive user input
app.get('/', (req,res) => {
  res.send(`User detected in the root at the port ${myPort}`);
});


// Error handling middleware (order matters)
app.use(handleDuplicateKeyError);
app.use(handleValidationError);
app.use(globalErrorHandler);

