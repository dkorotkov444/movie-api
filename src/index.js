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
// --- Third-Party Frameworks & Utilities ---
import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import mongoose from 'mongoose';
import passport from 'passport';
import cors from 'cors';
// --- Local Modules (Must be imported/executed) ---
import './config/passport.js';
import authRouter from './routes/auth.js';
import movieRoutes from './routes/movies.js';
import userRoutes from './routes/users.js';
import { sanitizeResponseMiddleware } from './middleware/sanitize.js';
import { handleDuplicateKeyError, handleValidationError, globalErrorHandler } from './middleware/errorHandler.js';


// --- ENVIRONMENT CONFIGURATION ---
dotenv.config();
const { DB_URI, LOCAL_PORT } = process.env;

/**
 * Validate required environment variables at startup
 */
const requiredEnvVars = ['DB_URI', 'JWT_SECRET', 'ADMIN_USERNAME', 'LOCAL_PORT', 'ALLOWED_ORIGINS'];
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
});

// Define at which port runs the web server (1. Heroku PORT, 2. .env LOCAL_PORT, 3. default 8080)
const myPort = process.env.PORT || LOCAL_PORT || 8080;

/**
 * Parse allowed CORS origins from environment
 * Format: comma-separated list (ALLOWED_ORIGINS is required)
 * For development, set in .env, e.g. ALLOWED_ORIGINS=http://localhost:3000,http://localhost:1234
 * "localhost:1234" is an actual port used by reel-client frontend during development
 */
const allowedOrigins = process.env.ALLOWED_ORIGINS
  .split(',')
  .map((origin) => origin.trim());


// --- CONNECT TO MongoDB DATABASE ---
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

// --- INVOKE MIDDLEWARE ---

// Security/External Access (CORS)
app.use(cors({
  origin: (origin, callback) => {
    if(!origin) return callback(null, true); 
    if(allowedOrigins.indexOf(origin) === -1){
      let message = 'The CORS policy for this application does not allow access from origin ' + origin;
      return callback(new Error(message), false); // Deny access
    }
        // Allow access
    return callback(null, true);
  }
}));

// app.use(morgan('common', {stream: accessLogStream}));
app.use(morgan('common'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', authRouter);
app.use('/', movieRoutes);

app.use(sanitizeResponseMiddleware);
app.use('/', userRoutes);


// --- API ENDPOINTS ---
app.get('/', (req,res) => {
  res.send(`User detected in the root at the port ${myPort}`);
});


// Error handling middleware (order matters)
app.use(handleDuplicateKeyError);
app.use(handleValidationError);
app.use(globalErrorHandler);
