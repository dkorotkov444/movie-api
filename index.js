/*  index.js
* Main JavaScript file of the REEL movie API
* Uses ESM syntax
*/

// Import required frameworks and modules
import express from 'express';  // Import Express framework
import morgan from 'morgan';    // Import Morgan logging library
import fs from 'fs';            // Import filesystem module
import path from 'path';        // Import path module
import {v4 as uuidv4} from 'uuid';          // Import uuid to generate unique IDs
import { fileURLToPath } from 'url';        // Import fileURLToPath from the url module
import mongoose from 'mongoose';            // Import Mongoose ODM
import { User, Movie } from './models.js';  // Import User and Movie models

// Connect to MongoDB database
mongoose.connect('mongodb://localhost:27017/reelDB', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB database'))
  .catch(err => console.error('Could not connect to MongoDB database:', err));  

// Create an Express application
const app = express();
const myPort = 8080;        // Define at which local port runs the web server

// Get the directory name for the current module in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a write stream (in append mode) a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'files/log.txt'), {flags: 'a'})


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

// Define array of usernames
let users = [
  {
    Id: 1,
    Username: 'admin',
    Favorites: ['Reservoir Dogs']
  }
]; 

// Invoke middleware
app.use(morgan('common', {stream: accessLogStream}));  // Use Morgan logging in standard format (before express.static to log files return)
app.use(express.static('public'));  // Serve all static files from directory public/ automatically
app.use(express.json());  // Parse JSON
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies (as sent by HTML forms)

// Receive user input   --- TESTED
app.get('/', (req,res) => {
  res.send(`User detected in the root at the port ${myPort}`);
});

// Essential features

// Returns the list of all movies. If user enters 'movies.json', then a file from public/ is sent   --- TESTED
app.get('/movies', (req,res) => {
  res.status(200).json(movies);    
});

// Returns data (description, genre, director, image URL, whether it’s featured or not) about a single movie by title to the user   --- TESTED
app.get('/movies/:title', (req,res) => {
  const {title} = req.params;
  const movie = movies.find(movie => movie.Title === title);
  if (movie) {
    res.status(200).json(movie)
  } else {
    res.status(400).send(`Movie ${title} not found`)
  }
});

// Returns data about a genre (description) by name (e.g., “Thriller”)   --- TESTED
app.get('/movies/genres/:genreName', (req,res) => {
  const { genreName } = req.params;
  const movie = movies.find(movie => movie.Genre.Name === genreName);
  if (movie) {
    res.status(200).json(movie.Genre);
  } else {
    res.status(400).send(`Genre ${genreName} not found`);
  }
});

// Returns data about a director (bio, birth year, death year) by name   --- TESTED
app.get('/movies/directors/:directorName', (req,res) => {
  const { directorName } = req.params;
  const movie = movies.find(movie => movie.Director.Name === directorName);
  if (movie) {
    res.status(200).json(movie.Director);
  } else {
    res.status(400).send(`Director ${directorName} not found`);
  }
});

// Get a list of all users   --- TESTED
app.get('/users', (req,res) => {
  res.status(200).json(users);    
});

// Registers new user with provided username   --- TESTED
app.post('/users', (req,res) => {
  let newUser = req.body;
  if (!newUser || !newUser.Username) {
    res.status(400).send('Missing username in request body');
  } else {
    newUser.Id = uuidv4();
    users.push(newUser);
    res.status(201).send(`Sucessful POST request registered ${newUser.Username}`);
  }
});

// Updates existing user with provided new username   --- TESTED
app.patch('/users/:username', (req,res) => {
  const {username} = req.params;
  const {newUsername} = req.body;
  let user = users.find(user => user.Username === username);
  if (user && newUsername) {
    user.Username = newUsername;
    res.status(200).send(`User ${username} was renamed to ${user.Username}`);
  } else if (!user) {
    res.status(404).send(`User ${username} not found`);
  } else {
    res.status(400).send('Missing newUsername in request body')
  }
});

// Deregisters user with provided username   --- TESTED
app.delete('/users/:username', (req,res) => {
  const {username} = req.params;
  let user = users.find(user => user.Username === username);
  if (user) {
    users = users.filter(user => user.Username !== username);
    res.status(200).send(`User ${username} was deregistered`);
  } else {
    res.status(404).send(`User ${username} not found`);
  }
});

// Adds a movie to user's favorites    --- TESTED
app.post('/users/:username/:movieTitle', (req,res) => {
  const {username, movieTitle} = req.params;
  let user = users.find(user => user.Username === username);
  if (user) {
    user.Favorites.push(movieTitle);
    res.status(200).send(`Movie ${movieTitle} added to favorites for user ${username}`);
  } else {
    res.status(404).send(`User ${username} not found`);
  }
});

// Removes a movie from user's favorites    --- TESTED
app.delete('/users/:username/:movieTitle', (req,res) => {
  const {username, movieTitle} = req.params;
  let user = users.find(user => user.Username === username);
  if (user) {
    user.Favorites = user.Favorites.filter(title => title !== movieTitle);
    res.status(200).send(`Movie ${movieTitle} removed from favorites for user ${username}`);
  } else {
    res.status(404).send(`User ${username} not found`);
  }
});

// Optional features

// Returns the list of actors starring in the movie    --- TESTED
app.get('/movies/:title/starring', (req,res) => {
  const { title } = req.params;
  const movie = movies.find(movie => movie.Title === title);
  if (movie) {
    res.status(200).json({Starring: movie.Starring});
  } else {
    res.status(400).send(`Movie ${title} not found`);
  }
});

// Returns information about actor  --- ENDPOINT TESTED, NO LOGIC YET
app.get('/movies/actors/:actorName', (req,res) => {
  res.send('Sucessful GET request returning info about actor');    
});

// Returns more information about different movies, such as the release date and the movie rating
app.get('/movies/:title/full-info', (req,res) => {
  res.send('Sucessful GET request returning full info about the movie');    
});

// Adds a movie to watch list
app.post('/users/:username/:to-watch', (req,res) => {
  res.send('Sucessful POST request adding movie to watch list');    
});

// Catch and process any remaining errors
app.use((error, req, res, next) => {
    console.error(error.stack);
    res.status(500).send('Application error');
});

//Start server at defined port
app.listen(myPort, () => {
    console.log(`REEL app is listening on port ${myPort}`);
});
