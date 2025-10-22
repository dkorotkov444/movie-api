/*  models.js
* JavaScript file with ODM models for the REEL movie API
* Uses ESM syntax
*/

// --- IMPORTS ---
// --- Core Node.js Modules ---
// --- Third-Party Frameworks & Utilities ---
import mongoose from 'mongoose';    // Import mongoose for MongoDB object modeling
import bcrypt from 'bcrypt';        // Import bcrypt for password hashing
// --- Local Modules (Must be imported/executed) ---


// --- MODULE CONSTANTS ---
const { Schema, model } = mongoose;

// Define the user schema
const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    birth_date: { type: Date},
    // Timestamp used to invalidate tokens issued before this moment.
    // Default set to epoch so existing tokens remain valid until we explicitly update this field.
    tokenInvalidBefore: { type: Date, default: new Date(0) },
    favorites: [{ type: Schema.Types.ObjectId, ref: 'Movie', default: [] }]
});

// Hash the password before saving a user
userSchema.statics.hashPassword = async function(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

// Method to validate password during login
userSchema.methods.validatePassword = async function(password) {
    return bcrypt.compare(password, this.password);
};

// Define the movie schema
const movieSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    release_year: { type: Number, required: true },
    image_url: { type: String },
    rating_imdb: { type: Number },
    featured: { type: Boolean },
    starring: [{ type: String }],
    director: { 
        name: { type: String, required: true },
        bio: { type: String },
        birth_date: { type: Date },
        death_date: { type: Date }
    },
    genre: { 
        name: { type: String},
        description: { type: String }
    }
});

// Create the user model and the movie model
const User = model('User', userSchema);
const Movie = model('Movie', movieSchema);

// Export the models
export { User, Movie };
