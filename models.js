/*  models.js
* JavaScript file with ODM models for the REEL movie API
* Uses ESM syntax
*/

// Import required frameworks and modules
import mongoose from 'mongoose';
const { Schema, model } = mongoose;

// Define the user schema
const userSchema = new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    birth_date: { type: Date},
    favorites: [{ type: Schema.Types.ObjectId, ref: 'Movie' }]
});

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
