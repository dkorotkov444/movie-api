/*  auth.js
* JavaScript file for user authentication
* Uses ESM syntax
*/

// Import required frameworks and modules
import jwt from 'jsonwebtoken';       // Import jsonwebtoken for creating and verifying JWTs
import passport from 'passport';      // Import passport authentication module
import './passport.js';        // Import passport strategies (runs passport.js)
import { Router } from 'express';

const jwtSecret = 'my_jwt_secret'; // Secret key for JWT signing and verification from JWTStrategy in passport.js

// Function to generate a JWT for a user
const generateJWT = (user) => {
  return jwt.sign({ _id: user._id, username: user.username }, // Payload with user ID and username
    jwtSecret,              // Secret key for JWT signing
    { 
        subject: user.username,     // Subject set to username
        expiresIn: '3h',            // Token expires in 3 hours
        algorithm: 'HS256'          // Algorithm used for signing the token
    });   
};

// POST /login route handler

(Router.post('/login', async (req, res) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {
        if (err || !user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT for the authenticated user
        const token = generateJWT(user);
        return res.json({ user: { _id: user._id, username: user.username }, token });
    })(req, res);
}));

export default Router; // Export the router to be used in index.js 

// Note: The login route uses the local strategy defined in passport.js to authenticate users based on username and password. 
// If authentication is successful, a JWT is generated and returned to the client.