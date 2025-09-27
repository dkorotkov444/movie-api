/*  passport.js
* JavaScript file with passport library configuration for authentication
* Uses ESM syntax
*/

// Import required frameworks and modules
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';
//import bcrypt from 'bcrypt';
import { User } from './models.js';
import dotenv from 'dotenv';

// Load environment variables from .env file for MongoDB connection
dotenv.config();

// Configure the local strategy for username and password authentication    
passport.use(new LocalStrategy(
    {
        usernameField: 'username',  // Field name for username in the request body
        passwordField: 'password'   // Field name for password in the request body
    },
    async (username, password, done) => {
        try {
            console.log(`Attempting to authenticate user: ${username} with password ${password}.`); // TEST LOG
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
            console.log('User authenticated successfully');
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
        secretOrKey: 'my_jwt_secret'
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
