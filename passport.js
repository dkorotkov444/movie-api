/*  passport.js
* JavaScript file with passport library configuration for authentication
* Uses ESM syntax
*/

// Import required frameworks and modules
import passport from 'passport';    // Import passport authentication module
import dotenv from 'dotenv';        // Import dotenv to manage environment variables
import { Strategy as LocalStrategy } from 'passport-local';         // Import local strategy for username/password authentication
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt'; // Import JWT strategy for token authentication
//import bcrypt from 'bcrypt';
import { User } from './models.js'; // Import User model

// Load environment variables from .env file for JWT secret
dotenv.config();  // Load environment variables from .env file

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
                return done(null, false, { message: 'Incorrect username or password.' });
            }

            // Compare password with hashed password
            /*const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return done(null, false, { message: 'Incorrect username or password.' });
            }*/

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
        secretOrKey: process.env.JWT_SECRET // Secret key for verifying JWTs from .env file. NO HARDCODED SECRETS!
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
