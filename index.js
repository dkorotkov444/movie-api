/*  index.js
* Main JavaScript file of the REEL movie API
* Uses ESM syntax
*/

// Import required frameworks and modules
import express from 'express';  // Import Express framework
import morgan from 'morgan';    // Import Morgan logging library
import fs from 'fs';            // Import filesystem module
import path from 'path';        // Import path module
import { fileURLToPath } from 'url';        // Import fileURLToPath from the url module
import mongoose from 'mongoose';            // Import Mongoose ODM
import { User, Movie } from './models.js';  // Import User and Movie models
import passport from 'passport';            // Import passport authentication module
import './passport.js';                     // Import passport strategies (runs passport.js) 
import Router from './auth.js';             // Imports Router function from auth.js

// Connect to MongoDB database
mongoose.connect('mongodb://localhost:27017/reelDB')
  .then(() => console.log('Connected to MongoDB database reelDB'))
  .catch(err => console.error('Could not connect to MongoDB database:', err));  

// Create an Express application
const app = express();
const myPort = 8080;        // Define at which local port runs the web server

// Get the directory name for the current module in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a write stream (in append mode) a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'files/log.txt'), {flags: 'a'})

/*  OBSOLETE - DELETE AFTER TESTING
// Define JSON data movies (also available in public/movies.json)
let movies = [
  {
    Title: 'Reservoir Dogs',
    Description: `Reservoir Dogs is a 1992 American crime film written and directed by Quentin Tarantino in his feature-length directorial debut.
      The film is regarded as a classic of independent film and a cult film.`,
    Director: {
      Name: 'Quentin Tarantino',
      Bio: `Quentin Jerome Tarantino is an American filmmaker, actor, and author. His films are characterized by graphic violence, 
        extended dialogue often featuring much profanity, and references to popular culture. His work has earned a cult following 
        alongside critical and commercial success; he has been named by some as the most influential director of his generation and 
        has received numerous awards and nominations, including two Academy Awards, two BAFTA Awards, and four Golden Globe Awards. 
        His films have grossed more than $1.9 billion worldwide.`,
      Born: '27.03.1963'
    },
    Genre: {
      Name: 'Crime',
      Description: 'Crime film is a film belonging to the crime fiction genre. Films of this genre generally involve various aspects of crime.'
    },
    Released: 1992,
    ImageURL: 'https://en.wikipedia.org/wiki/File:Reservoir_Dogs.png',
    Feature: 'Feature',
    Starring:['Harvey Keitel', 'Tim Roth', 'Chris Penn', 'Steve Buscemi', 'Lawrence Tierney', 'Michael Madsen', 'Quentin Tarantino', 'Edward Bunker']
  },
  {
    Title: 'The Godfather Part II',
    Description: `The Godfather Part II is an American epic crime film produced and directed by Francis Ford Coppola, loosely based on the 1969 novel The Godfather by Mario Puzo, 
      who co-wrote the screenplay with Coppola. It is both a sequel and a prequel to the 1972 film The Godfather, presenting parallel dramas: one picks up the 1958 story of Michael Corleone (Al Pacino), 
      the new Don of the Corleone family, protecting the family business in the aftermath of an attempt on his life; the other covers the journey of his father, Vito Corleone (Robert De Niro), 
      from his Sicilian childhood to the founding of his family enterprise in New York City.`,
    Director: {
      Name: 'Francis Ford Coppola',
      Bio: `Francis Ford Coppola is an American filmmaker. Considered one of the leading figures of the New Hollywood era as well as one of the pioneers of the gangster film genre, Coppola is widely 
        regarded as one of the greatest and most influential filmmakers in the history of cinema. Coppola is the recipient of five Academy Awards, a BAFTA Award, three Golden Globe Awards, and two Palmes d'Or, 
        in addition to nominations for two Emmy Awards and a Grammy Award. Coppola was honored with the Irving G. Thalberg Memorial Award in 2010, the Kennedy Center Honors in 2024, and the AFI Life Achievement Award in 2025.`,
      Born: '07.04.1939'
    },
    Genre: {
      Name: 'Crime',
      Description: 'Crime film is a film belonging to the crime fiction genre. Films of this genre generally involve various aspects of crime.'
    },
    Released: 1974,
    ImageURL: 'https://en.wikipedia.org/wiki/File:Godfather_part_ii.jpg',
    Feature: 'Feature',
    Starring:['Robert De Niro', 'Al Pacino', 'Robert Duvall', 'Diane Keaton', 'Talia Shire', 'Morgana King', 'John Cazale', 'Marianna Hill', 'Lee Strasberg']
  },
  {
    Title: 'Predator',
    Description: `Predator is a 1987 American science fiction action horror film directed by John McTiernan and written by brothers Jim and John Thomas.
      Arnold Schwarzenegger stars as Dutch Schaefer, the leader of an elite paramilitary rescue team on a mission to save hostages in guerrilla-held 
      territory in a Central American rainforest, who encounter the deadly Predator, a skilled, technologically advanced extraterrestrial who stalks and hunts them down.`,
    Director: {
      Name: 'John McTiernan',
      Bio: `John Campbell McTiernan Jr. is an American filmmaker best known for his action films. His work as director includes Predator (1987), Die Hard (1988), and The Hunt for Red October (1990).`,
      Born: '08.01.1951'
    },
    Genre: {
      Name: 'Sci-Fi',
      Description: 'Science fiction film is a film genre that uses speculative, fictional science-based depictions of phenomena that are not fully accepted by mainstream science, such as extraterrestrial lifeforms, spacecraft, robots, cyborgs, mutants, interstellar travel, time travel, or other technologies.'
    },
    Released: 1987,
    ImageURL: 'https://en.wikipedia.org/wiki/File:Predator_Movie.jpg',
    Feature: 'Feature',
    Starring:['Arnold Schwarzenegger', 'Carl Weathers', 'Bill Duke', 'Richard Chaves', 'Jesse Ventura', 'Sonny Landham', 'Shane Black', 'Elpidia Carrillo']
  },
  {
    Title: 'Zombeavers',
    Description: `Zombeavers is an American horror comedy film directed by Jordan Rubin, based on a script by Al Kaplan, Jordan Rubin, and Jon Kaplan. 
      The film follows a group of college kids staying at a riverside cottage that are attacked by a swarm of zombie beavers.`,
    Director: {
      Name: 'Jordan Rubin',
      Bio: `Jordan Rubin is an American film director, born and raised in New York City. While Jordan was still studying at NYU, he began his career in stand-up comedy.`,
      Born: ''
    },
    Genre: {
      Name: 'Horror',
      Description: 'Horror film is a film genre that seeks to elicit fear or disgust in its audience for entertainment purposes. It often features supernatural elements, monsters, or psychological terror.'
    },
    Released: 2014,
    ImageURL: 'https://en.wikipedia.org/wiki/File:Zombeavers_film_poster.jpg',
    Feature: 'Feature',
    Starring:['Rachel Melvin', 'Cortney Palm', 'Lexi Atkins', 'Hutch Dano', 'Jake Weary', 'Peter Gilroy', 'Rex Linn']
  }
];
*/

// Invoke middleware
app.use(morgan('common', {stream: accessLogStream}));  // Use Morgan logging in standard format (before express.static to log files return)
app.use(express.json());  // Parse JSON
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies (as sent by HTML forms)
app.use ('/', Router);  // Use the auth.js file for all requests to root URL (login)

// API ENDPOINTS

// Receive user input
app.get('/', (req,res) => {
  res.send(`User detected in the root at the port ${myPort}`);
});

// ESSENTIAL FEATURES

// Returns the list of all movies (titles only)
app.get('/movies', passport.authenticate('jwt', { session: false }), async(req,res) => {
  await Movie.find()
    .then(movies => res.status(200).json(movies.map(movie => movie.title)))
    .catch(err => res.status(500).send('Error: ' + err));
});

// Returns complete information about all movies
app.get('/movies/complete', passport.authenticate('jwt', { session: false }), async(req,res) => {
  await Movie.find()
    .then(movies => res.status(200).json(movies))
    .catch(err => res.status(500).send('Error: ' + err));
});

// Returns data (description, genre, director, image URL, etc.) about a single movie by title
app.get('/movies/:title', passport.authenticate('jwt', { session: false }), async(req,res) => {
  const { title } = req.params;
  await Movie.findOne({ title: title })
    .then(movie => {
      if (movie) {
        res.status(200).json(movie)
      } else {
        res.status(400).send(`Movie ${title} not found`)
      }
    })
    .catch(err => res.status(500).send('Error: ' + err));
});

// Returns data about a genre (description) by name (e.g., “Thriller”) 
app.get('/movies/genres/:genreName', passport.authenticate('jwt', { session: false }), async (req,res) => {
  const { genreName } = req.params;
  await Movie.findOne({ 'genre.name': genreName })
    .then(movie => {
      if (movie) {
        res.status(200).json(movie.genre);
      } else {
        res.status(400).send(`Genre ${genreName} not found`);
      }
    })
    .catch(err => res.status(500).send('Error: ' + err));
});

// Returns data about a director (name, bio, birth year, death year) by name
app.get('/movies/directors/:directorName', passport.authenticate('jwt', { session: false }), async (req,res) => {
  const { directorName } = req.params;
  await Movie.findOne({ 'director.name': directorName })
    .then(movie => {
      if (movie) {
        res.status(200).json(movie.director);
      } else {
        res.status(400).send(`Director ${directorName} not found`);
      }
    })
    .catch(err => res.status(500).send('Error: ' + err));
});

// Returns a list of all users
app.get('/users', passport.authenticate('jwt', { session: false }), async (req,res) => {
  await User.find()
    .then(users => res.status(200).json(users))
    .catch(err => res.status(500).send('Error: ' + err));
});

// Registers new user
app.post('/users', async (req,res) => {
  const newUser = req.body; // Expecting JSON in request body
  const { username, email, birth_date } = newUser;
  const { password, ...publicProfile } = newUser; // Exclude password from the response
  
  // Check if username is provided
  if (!newUser || !username) {
    return res.status(400).send('Missing username in request body');
  }
  await User.findOne({ username: username })
    .then(user => {
      if (user) {
        res.status(409).send('Username already exists');
      } else {
        // Create and save the new user
        User.create({
          username: username,
          password: password,
          email: email,
          birth_date: birth_date,
        });
        res.status(201).json(publicProfile);  // Return the public profile without password
      }
    })
    .catch(err => res.status(500).send('Error: ' + err));
});

// Updates existing user info (username, password, email, date of birth)  --- TESTED
app.patch('/users/:username', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { username } = req.params;
  const { newUsername, newPassword, newEmail, newBirthDate } = req.body;

  try {
    // Build the update object with only the properties that exist in the request body
    const updateFields = {};
    if (newUsername !== undefined) updateFields.username = newUsername;
    if (newPassword !== undefined) updateFields.password = newPassword;
    if (newEmail !== undefined) updateFields.email = newEmail;
    if (newBirthDate !== undefined) updateFields.birth_date = newBirthDate;

    // Check if there are any fields to update
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).send('No fields provided for update.');
    }
    // Use findOneAndUpdate to find and update the user document
    const updatedUser = await User.findOneAndUpdate(
      { username: username },
      { $set: updateFields },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).send(`User ${username} not found`);
    }

    // Strip Mongoose properties and exclude password from the response
    const { password, ...publicProfile } = updatedUser.toObject();
    res.status(200).json(publicProfile);

  } catch (err) {
    console.error(err);
    res.status(500).send('Error: ' + err.message);
  }
});

// Deregisters (deletes) user with provided username
app.delete('/users/:username', passport.authenticate('jwt', { session: false }), async (req,res) => {
  const {username} = req.params;
  await User.findOneAndDelete({ username: username })
    .then(user => {
      if (user) {
        res.status(200).send(`User ${username} was deregistered`);
      } else {
        res.status(404).send(`User ${username} not found`);
      }
    })
    .catch(err => res.status(500).send('Error: ' + err));
});

// Adds a movie to a user's favorites by username and movie title
app.patch('/users/:username/:movieTitle', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { username, movieTitle } = req.params;
  try {
    // Find the movie document to get its _id
    const movie = await Movie.findOne({ title: movieTitle }).select('_id');
    if (!movie) {
      return res.status(404).send(`Movie ${movieTitle} not found.`);
    }
    // Use findOneAndUpdate with $addToSet to add the movie to favorites
    const updatedUser = await User.findOneAndUpdate(
      { username: username },
      { $addToSet: { favorites: movie._id } },
      { new: true } // { new: true } returns the updated document
    );

    if (!updatedUser) {
      return res.status(404).send(`User ${username} not found.`);
    }

    res.status(200).json(updatedUser);

  } catch (err) {
    console.error(err);
    res.status(500).send('Error: ' + err.message);
  }
});

// Removes a movie from user's favorites by username and movie title  --- TESTED
app.delete('/users/:username/:movieTitle', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { username, movieTitle } = req.params;
  try {
    // Find the movie document to get its _id
    const movie = await Movie.findOne({ title: movieTitle }).select('_id');
    if (!movie) {
      return res.status(404).send(`Movie ${movieTitle} not found.`);
    }
    // Use findOneAndUpdate with $pull to remove the movie from favorites
    const updatedUser = await User.findOneAndUpdate(
      { username: username },
      { $pull: { favorites: movie._id } },
      { new: true } // { new: true } returns the updated document
    );

    if (!updatedUser) {
      return res.status(404).send(`User ${username} not found.`);
    }

    res.status(200).json(updatedUser);

  } catch (err) {
    console.error(err);
    res.status(500).send('Error: ' + err.message);
  }
});

// OPTIONAL FEATURES

// Returns the list of actors starring in the movie  --- TESTED
app.get('/movies/:title/starring', passport.authenticate('jwt', { session: false }), async (req,res) => {
  const { title } = req.params;
  await Movie.findOne({ title: title })
    .then(movie => {
      if (movie) {
        res.status(200).json(movie.starring);
      } else {
        res.status(400).send(`Movie ${title} not found`);
      }
    })
    .catch(err => res.status(500).send('Error: ' + err));
});

// Returns information about actor  --- ENDPOINT TESTED, NO LOGIC YET
app.get('/movies/actors/:actorName', (req,res) => {
  res.send('Sucessful GET request returning info about actor');    
});

// Returns all information about the movie by title - THIS ONE DUPLICATES ONE OF THE ESSENTIAL FEATURES
// app.get('/movies/:title/full-info', async(req,res) => {...});

// Adds a movie to watch list
// app.post('/users/:username/:to-watch', (req,res) => {
//   res.send('Sucessful POST request adding movie to watch list');
// });

// Catch and process any remaining errors
app.use((error, req, res, next) => {
    console.error(error.stack);
    res.status(500).send('Application error');
});

//Start server at defined port
app.listen(myPort, () => {
    console.log(`REEL app is listening on port ${myPort}`);
});
