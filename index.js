/*  index.js
* Main JavaScript file of the REEL movie API
* Uses ESM syntax
*/

// Import required frameworks and modules
import express from "express";
import morgan from "morgan";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url"; // Import fileURLToPath from the url module

const app = express();
const myPort = 8080;        // Define at which local port runs the web server

// Get the directory name for the current module in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a write stream (in append mode) a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'files/log.txt'), {flags: 'a'})


// Define JSON data topMovies (also available in public/movies.json)
let topMovies = [
  {
    title: 'Reservoir Dogs',
    director: 'Quentin Tarantino'
  },
  {
    title: 'The Godfather Part II',
    director: 'Francis Ford Coppola'
  },
  {
    title: 'Zombeavers',
    director: 'Jordan Rubin'
  }
];

// Invoke middleware
app.use(morgan('common', {stream: accessLogStream}));  // Use Morgan logging in standard format (before express.static to log files return)
app.use(express.static('public'));  // Serve all static files from directory public/ automatically

// Receive user input
app.get('/', (req,res) => {
    res.send(`User detected in the root at the port ${myPort}`);
});

app.get('/movies', (req,res) => {
    res.json(topMovies);    // If user enters "movies.json", then a file from public/ is sent
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
