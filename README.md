# REEL Movie API

A small Express + MongoDB REST API serving a curated movie dataset with user accounts and JWT-based authentication.

## What this is

REEL Movie API is a lightweight Node.js (ESM) server that exposes movie and user endpoints. It uses
Mongoose for MongoDB models and Passport (local + JWT strategies) for authentication.

Key features:
- Register / login users (passwords are hashed with bcrypt)
- JWT authentication for protected routes
- Movie browsing endpoints (titles, full objects, genres, directors)
- Users can maintain a list of favorite movies (stored as ObjectId references)

## Quick start

1. Install dependencies:

```powershell
npm install
```

2. Create a `.env` file in the project root with at least the following values:

```text
DB_URI=mongodb://localhost:27017/reelDB
JWT_SECRET=your_jwt_secret_here
ADMIN_USERNAME=admin
LOCAL_PORT=8080
```

3. Start the server:

```powershell
npm start
# or
node index.js
```

The server connects to MongoDB first; if the connection fails the process exits.

## Important environment variables
- `DB_URI` – MongoDB connection string used by Mongoose (required).
- `JWT_SECRET` – secret used to sign/verify JWT tokens, must be kept secret (required).
- `ADMIN_USERNAME` – username allowed to call the admin-only `GET /users` endpoint (required).
- `LOCAL_PORT` – local port for development (required); Heroku uses `PORT` env var instead.
- `ALLOWED_ORIGINS` – comma-separated list of frontend URLs allowed by CORS (required, e.g., `http://localhost:3000,https://example.com`).

Example `.env` for local development:
```text
DB_URI=mongodb://localhost:27017/reelDB
JWT_SECRET=your_jwt_secret_here_keep_it_safe
ADMIN_USERNAME=admin
LOCAL_PORT=8080
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:1234
```

## Local Development & CORS Configuration

The API allows requests from the following origins (configured via `ALLOWED_ORIGINS` in `.env`):

| Origin | Purpose | Technology |
|--------|---------|-----------|
| http://localhost:3000 | Frontend development server | React (or similar) |
| http://localhost:1234 | Bundler dev server | Parcel |
| http://localhost:4200 | Frontend dev server | Angular |
| https://reel-movies.netlify.app | Production frontend | Netlify deployment |

When developing locally, ensure your frontend is running on one of these ports or update `ALLOWED_ORIGINS` in `.env` accordingly.

## Authentication

- Register a new user: `POST /users` (body: `username`, `password`, `email`, optional `birth_date`).
- Login: `POST /login` (body: `username`, `password`) — returns `{ user, token }`.
- Protect requests by adding an Authorization header: `Authorization: Bearer <token>`.

Example (PowerShell):

```powershell
# Login and save token into an environment variable (example)
$resp = Invoke-RestMethod -Method Post -Uri http://localhost:8080/login -Body (@{ username='user'; password='pass' } | ConvertTo-Json) -ContentType 'application/json'
$token = $resp.token

# Use token to request movies
Invoke-RestMethod -Method Get -Uri http://localhost:8080/movies -Headers @{ Authorization = "Bearer $token" }
```

## Selected endpoints

- `GET /` — health / welcome
- `GET /movies/list` — list of movie titles (protected)
- `GET /movies` — full movie objects (protected)
- `GET /movies/:title` — single movie by title (protected)
- `GET /movies/genres/:genreName` — genre info (protected)
- `GET /movies/directors/:directorName` — director info (protected)
- `GET /movies/:title/starring` — actors in a movie (protected)

- `POST /users` — register new user
- `PATCH /users/:username` — update user (protected, user may only edit own profile)
- `DELETE /users/:username` — delete user (protected, user may only delete own profile)
- `PATCH /users/:username/:movieTitle` — add movie to favorites (protected)
- `DELETE /users/:username/:movieTitle` — remove movie from favorites (protected)


Notes:
- Most API routes enforce JWT authentication via Passport. `POST /users` and `POST /login` are public.
- `GET /users` is restricted to the `ADMIN_USERNAME` configured in env.
- **Future Improvement:** Consider updating all API endpoint responses in the controllers to consistently return JSON format.

## Project structure (high level)

```
.env                        # Environment variables (DB_URI, JWT_SECRET, ADMIN_USERNAME, LOCAL_PORT, ALLOWED_ORIGINS)

src/
├── index.js                 # Main Express server, middleware setup, env validation, CORS config
├── config/
│   └── passport.js          # Passport strategies (LocalStrategy, JWTStrategy) with token revocation
├── controllers/
│   ├── movieController.js   # 6 handlers: getMoviesList, getAllMovies, getMovieByTitle, getGenreByName, getDirectorByName, getMovieStarring
│   └── userController.js    # 6 handlers: getUsers, registerUser, updateUser, deleteUser, addFavorite, removeFavorite
├── middleware/
│   ├── auth.js              # JWT authentication & role-based authorization (authenticateJWT, requireAdmin, requireOwnerOrAdmin)
│   ├── validators.js        # Input validation rules using express-validator
│   ├── errorHandler.js      # Centralized error handling middleware
│   └── sanitize.js          # Response sanitization (removes sensitive fields like passwords)
├── models/
│   └── models.js            # Mongoose schemas for User and Movie with static methods
├── routes/
│   ├── auth.js              # POST /login (JWT generation)
│   ├── movies.js            # 6 GET endpoints for movie data
│   └── users.js             # 6 endpoints: POST (register), PATCH (update, add/remove favorites), DELETE (deregister), GET (admin-only)
└── utils/
    ├── dbHelper.js          # Database query helpers (findMovieByTitle, findGenreByName, etc.)
    └── responseHelper.js    # Response sanitization utility

public/
├── index.html               # Landing page
├── API_documentation.html   # User-facing API documentation with examples
├── css/
│   └── style.css           # Dark theme styles
└── img/
    └── favicon-32x32.png   # Site favicon

out/                         # JSDoc-generated developer documentation (run `jsdoc src -r`)

tools/
├── data/                    # Fixture files for movies and users
│   ├── movies.js
│   ├── movies2.js
│   └── users.json
└── scripts/                 # Developer utilities
    ├── import_movies.js     # Import movies into MongoDB
    ├── fetch_tmdb_posters.js
    ├── fetch_imdb_ratings.js
    ├── merge_posters.js
    └── user/favorite maintenance scripts

package.json                 # Dependencies and build scripts
README.md                    # This file
postman-collection.json      # Postman collection for API testing
```

## Postman examples

Two quick Postman examples are provided to help you test the API. A small Postman collection is included in the repository at `postman_collection.json`.

Example requests included:
- Login (POST /login) — JSON body with `username` and `password`, receives `{ token }`.
- Get movies (GET /movies) — protected endpoint; add header `Authorization: Bearer {{token}}`.

Import `postman_collection.json` into Postman. The collection uses a variable `baseUrl` (defaults to `http://localhost:8080`) and a `token` variable that you can set from the login response.

## Notes & caveats
- **CORS configuration:** CORS origins are controlled via the `ALLOWED_ORIGINS` env variable (comma-separated). Set this to your frontend URL(s) in production.
- **Response sanitization:** Sensitive user fields (password, tokenInvalidBefore) are automatically removed from API responses on user routes via the `sanitizeResponseMiddleware`.
- **Input validation:** All user inputs are validated using `express-validator` (username, email, birth_date must be in the future, passwords, etc.).
- **Error handling:** Centralized error handler in `middleware/errorHandler.js` processes all errors and returns consistent error messages.
- **Birth date validation:** Users cannot register with a birth date in the future; registration/update requests with future dates are rejected with a validation error.
- **Movie title validation in some routes:** Titles with special punctuation may require additional testing or validation adjustments.
- **Sample data:** Fixture files in `tools/data/` are for development/testing; do not use in production without review.

## Architecture highlights

**MVC pattern:** Controllers handle request/response logic, models define schemas, routes define endpoints.

**Middleware composition:** 
- Authentication (`passport` + custom JWT strategy with token revocation)
- Input validation (`express-validator` with custom rules)
- Response sanitization (removes sensitive fields)
- Error handling (centralized, consistent error messages)

**Database helpers:** Reusable query functions in `src/utils/dbHelper.js` (e.g., `findMovieByTitle`, `findGenreByName`) reduce code duplication in controllers.

**Token revocation and profile updates:**
- Tokens are standard JWTs signed with `JWT_SECRET` and contain `iat` and `exp` claims (expires in 3 hours).
- When a user changes sensitive data (username or password), the server revokes all previously issued tokens for that user by recording a `tokenInvalidBefore` timestamp in the user record.
- Behavior for clients:
  - `PATCH /users/:username` will NOT return a new token when username or password are changed. The client must re-login via `POST /login` to receive a fresh token.
  - Non-sensitive updates (email, birth date, favorites) do not revoke tokens and behave as before.
- Implementation: A `tokenInvalidBefore` field (Date) in the User schema stores the revocation timestamp. Passport's JWT strategy checks token `iat` against this value and rejects tokens issued earlier than the revocation time. This approach is simple, persistent across server restarts, and does not require extra infrastructure like Redis.

**Documentation:** 
- `public/API_documentation.html` — user-facing API endpoint guide with examples
- JSDoc comments throughout source code for developer reference (generates via `jsdoc src -r`)

## Testing & deployment
- Test the API using Postman (collection included: `postman-collection.json`)
- Deploy to Heroku by pushing to the Heroku Git remote (ensure `Procfile` is committed)
- Heroku will use the `PORT` env var instead of `LOCAL_PORT`

## Scripts / tools

The `tools/scripts/` folder contains developer utilities for data enrichment and import. All scripts are ESM (Node.js 18+). Common usage:

- **import_movies.js** — import movies from fixture files into MongoDB:
  ```powershell
  $env:MONGO_URI='mongodb+srv://admin:PASS@host/reelDB'; node tools/scripts/import_movies.js [--dry] [--upsert]
  ```
  - `--dry`: validate without writing
  - `--upsert`: update existing movies (match by title + release_year)

- **fetch_tmdb_posters.js** — fetch poster URLs from TMDb:
  ```powershell
  $env:TMDB_API_KEY='your_key'; node tools/scripts/fetch_tmdb_posters.js
  ```
  - Outputs JSON with poster URLs

- **fetch_imdb_ratings.js** — fetch IMDb ratings via OMDb API:
  ```powershell
  $env:OMDB_API_KEY='your_key'; node tools/scripts/fetch_imdb_ratings.js [--dry] [--scrape]
  ```
  - `--dry`: preview without writing
  - `--scrape`: use HTML scraping fallback (no API key needed, fragile)

- **merge_posters.js** — merge poster URLs into fixture files by title + year

- **users-cleanup.js**, **migrate-favorites.js** — user and favorites maintenance (run when needed)

## Data files (fixtures / backups)

- Fixture files are located in `tools/data/` (e.g., `movies.js`, `movies2.js`).
- The `movies.js` file contains canonical movie metadata (genres, director bios).
- The `movies2.js` file is an enriched collection with 43+ movies including poster URLs and IMDb ratings.
- Import these into MongoDB using `tools/scripts/import_movies.js`.

## Dependencies
See `package.json` for the full list. Key libraries: `express`, `mongoose`, `passport`, `passport-jwt`, `passport-local`, `bcrypt`, `jsonwebtoken`, `express-validator`.

## Author
Dmitri Korotkov — project owner (see `package.json`)

## License
ISC
