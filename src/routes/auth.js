/**
 * @file src/routes/auth.js
 * @fileoverview User authentication routes for the REEL movie API
 * @module routes/auth
 * @requires dotenv
 * @requires express
 * @requires jsonwebtoken
 * @requires passport
 * @requires config/passport
 * @author Dmitri Korotkov
 * @copyright Dmitri Korotkov 2025
 */

// --- IMPORTS ---
// --- Core Node.js Modules ---
// --- Third-Party Frameworks & Utilities ---
import dotenv from 'dotenv';        // Import dotenv to manage environment variables
import { Router } from 'express';   // Import Router from express to create route handlers
import jwt from 'jsonwebtoken';     // Import jsonwebtoken for creating and verifying JWTs
import passport from 'passport';    // Import passport authentication module
// --- Local Modules (Must be imported/executed) ---
import '../config/passport.js';             // Import passport strategies (runs passport.js)

// --- ENVIRONMENT CONFIGURATION ---
dotenv.config();    // Load environment variables from .env file for JWT secret
const { JWT_SECRET } = process.env; // Destructure environment variables

// --- MODULE CONSTANTS ---
const authRouter = Router();  // Create a new router instance
const jwtSecret = JWT_SECRET; // Secret key for JWT signing and verification from JWTStrategy in passport.js. NO HARDCODED SECRETS!

/**
 * Function to generate a JWT for a user
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
const generateJWT = (user) => {
    return jwt.sign({ _id: user._id, username: user.username }, // Payload with only user ID and username is more secure
        jwtSecret,              // Secret key for JWT signing
        { 
                subject: user.username,     // Subject set to username
                expiresIn: '3h',            // Token expires in 3 hours
                algorithm: 'HS256'          // Algorithm used for signing the token
        });   
};

// Export the token generator so other modules (e.g., update handlers) can issue fresh tokens
export { generateJWT };

// POST /login route handler

authRouter.post('/login', async (req, res) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {
        if (err || !user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT for the authenticated user
        const token = generateJWT(user);

    // Convert the Mongoose document to a plain object and use destructuring to exclude sensitive fields
    const { password: _, tokenInvalidBefore: __, ...publicProfile } = user.toObject();

        // Return the full user profile (excluding password) and the JWT token
        return res.json({ user: publicProfile, token });

    })(req, res);
});

export default authRouter; // Export the router to be used in index.js

// Note: The login route uses the local strategy defined in passport.js to authenticate users based on username and password. 
// If authentication is successful, a JWT is generated and returned to the client.