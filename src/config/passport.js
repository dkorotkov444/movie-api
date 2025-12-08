/**
 * @file src/config/passport.js
 * @fileoverview Passport library configuration for authentication
 * @module config/passport
 * @requires dotenv
 * @requires passport
 * @requires passport-local
 * @requires passport-jwt
 * @requires models/models
 * @author Dmitri Korotkov
 * @copyright Dmitri Korotkov 2025
 */

// --- IMPORTS ---
// --- Core Node.js Modules ---
// --- Third-Party Frameworks & Utilities ---
import dotenv from 'dotenv';        // Import dotenv to manage environment variables
import passport from 'passport';    // Import passport authentication module
import { Strategy as LocalStrategy } from 'passport-local';         // Import local strategy for username/password authentication
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt'; // Import JWT strategy for token authentication
// --- Local Modules (Must be imported/executed) ---
import { User } from '../models/models.js'; // Import User model

// --- ENVIRONMENT CONFIGURATION ---
dotenv.config();    // Load environment variables from .env file for JWT secret
const { JWT_SECRET } = process.env; // Destructure environment variables

// --- MODULE CONSTANTS ---
const jwtSecret = JWT_SECRET; // Secret key for JWT signing and verification from JWTStrategy in passport.js. NO HARDCODED SECRETS!

// Configure the local strategy for username and password authentication    
passport.use(new LocalStrategy(
    {
        usernameField: 'username',  // Field name for username in the request body
        passwordField: 'password'   // Field name for password in the request body
    },
    async (username, password, done) => {
        try {
            // Find user by username
            const user = await User.findOne({ username });
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            }
            // Validate password
            const isValid = await user.validatePassword(password);
            if (!isValid) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            // Authentication successful
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }
));

// Configure the JWT strategy for token authentication
passport.use(new JWTStrategy(
    {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: jwtSecret // Secret key for verifying JWTs from .env file. NO HARDCODED SECRETS!
    },
    async (jwtPayload, done) => {
        try {
            // Find user by ID from JWT payload
            const user = await User.findById(jwtPayload._id);
            if (!user) {
                return done(null, false, { message: 'Unauthorized' });
            }

            // Reject tokens issued before the user's tokenInvalidBefore timestamp
            // jwtPayload.iat is seconds since epoch; convert to ms for comparison with Date
            if (user.tokenInvalidBefore) {
                const tokenIatMs = (jwtPayload.iat || 0) * 1000;
                const invalidBeforeMs = user.tokenInvalidBefore.getTime();
                if (tokenIatMs <= invalidBeforeMs) {
                    return done(null, false, { message: 'Token revoked' });
                }
            }

            // Authentication successful
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }
));
