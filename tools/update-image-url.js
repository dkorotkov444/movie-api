// Connect to the 'reelDB' database
use('reelDB');

// Movie data imported from the file movies-with-posters.js
// Note: In a real-world scenario, you might load this from a JSON file or similar, 
// but for a mongosh script, defining the data inline is straightforward.
const moviePosters = [
  {
    "movieid": 1,
    "title": "Reservoir Dogs",
    "year": 1992,
    "poster": "https://image.tmdb.org/t/p/w500/xi8Iu6qyTfyZVDVy60raIOYJJmk.jpg"
  },
  {
    "movieid": 2,
    "title": "The Godfather Part II",
    "year": 1974,
    "poster": "https://image.tmdb.org/t/p/w500/hek3koDUyRQk7FIhPXsa6mT2Zc3.jpg"
  },
  {
    "movieid": 3,
    "title": "Predator",
    "year": 1987,
    "poster": "https://image.tmdb.org/t/p/w500/k3mW4qfJo6SKqe6laRyNGnbB9n5.jpg"
  },
  {
    "movieid": 4,
    "title": "Zombeavers",
    "year": 2014,
    "poster": "https://image.tmdb.org/t/p/w500/gdb7v5GCfijrCjOjzbziGMGs6JA.jpg"
  },
  {
    "movieid": 15,
    "title": "Pulp Fiction",
    "year": 1994,
    "poster": "https://image.tmdb.org/t/p/w500/vQWk5YBFWF4bZaofAbv0tShwBvQ.jpg"
  },
  {
    "movieid": 16,
    "title": "The Dark Knight",
    "year": 2008,
    "poster": "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg"
  },
  {
    "movieid": 17,
    "title": "Inception",
    "year": 2010,
    "poster": "https://image.tmdb.org/t/p/w500/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg"
  },
  {
    "movieid": 18,
    "title": "Goodfellas",
    "year": 1990,
    "poster": "https://image.tmdb.org/t/p/w500/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg"
  },
  {
    "movieid": 19,
    "title": "Kill Bill: Vol. 1",
    "year": 2003,
    "poster": "https://image.tmdb.org/t/p/w500/v7TaX8kXMXs5yFFGR41guUDNcnB.jpg"
  },
  {
    "movieid": 20,
    "title": "The Irishman",
    "year": 2019,
    "poster": "https://image.tmdb.org/t/p/w500/mbm8k3GFhXS0ROd9AD1gqYbIFbM.jpg"
  },
  {
    "movieid": 21,
    "title": "Interstellar",
    "year": 2014,
    "poster": "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg"
  },
  {
    "movieid": 22,
    "title": "The Wolf of Wall Street",
    "year": 2013,
    "poster": "https://image.tmdb.org/t/p/w500/kW9LmvYHAaS9iA0tHmZVq8hQYoq.jpg"
  },
  {
    "movieid": 24,
    "title": "Superbad",
    "year": 2007,
    "poster": "https://image.tmdb.org/t/p/w500/ek8e8txUyUwd2BNqj6lFEerJfbq.jpg"
  },
  {
    "movieid": 25,
    "title": "Joker",
    "year": 2019,
    "poster": "https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg"
  }
];

print('Starting update of movie posters in "movies" collection...');

moviePosters.forEach(async (movie) => {
    try {
        const result = await db.movies.updateOne(
            // Filter: Find movie by title
            { title: movie.title }, 
            // Update: Set the image_url to the poster link
            { $set: { image_url: movie.poster } }
        );

        if (result.matchedCount > 0) {
            print(`Updated poster for: ${movie.title} (${result.modifiedCount} modified)`);
        } else {
            print(`WARNING: No movie found with title: ${movie.title}`);
        }
    } catch (e) {
        print(`ERROR updating ${movie.title}: ${e}`);
    }
});

print('Update process initiated. Check logs for individual results.');