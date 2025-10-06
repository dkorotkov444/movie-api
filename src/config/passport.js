/*  passport.js
* JavaScript file with passport library configuration for authentication
* Uses ESM syntax
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

            // Authentication successful
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }
));
