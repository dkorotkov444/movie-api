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
- `DB_URI` – MongoDB connection string used by Mongoose.
- `JWT_SECRET` – secret used to sign/verify JWT tokens (must be kept secret).
- `ADMIN_USERNAME` – username allowed to call the admin-only `GET /users` endpoint.
- `LOCAL_PORT` – optional local port (defaults to 8080).

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
- `GET /movies` — list of movie titles (protected)
- `GET /movies/complete` — full movie objects (protected)
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

## Project structure (high level)

- `index.js` — main Express server and route definitions
- `auth.js` — login route & JWT generation
- `passport.js` — Passport local + JWT strategies
- `models.js` — Mongoose schemas for `User` and `Movie`
- `files/` — JSON/JS fixtures (movies, users, starring lists, backups)
- `scripts/` — utility scripts (data migration and cleanup)

## Postman examples

Two quick Postman examples are provided to help you test the API. A small Postman collection is included in the repository at `postman_collection.json`.

Example requests included:
- Login (POST /login) — JSON body with `username` and `password`, receives `{ token }`.
- Get movies (GET /movies) — protected endpoint; add header `Authorization: Bearer {{token}}`.

Import `postman_collection.json` into Postman. The collection uses a variable `baseUrl` (defaults to `http://localhost:8080`) and a `token` variable that you can set from the login response.

## Notes & caveats
- CORS is currently enabled for all origins in `index.js` (development convenience). Harden this for production.
- Movie title validation in some routes uses a conservative alphanumeric check — titles with punctuation may require relaxed validation.
- Sample user/password pairs are present in `files/users.json` for test/dev purposes; do not use them in production.

## Dependencies
See `package.json` for the full list. Key libraries: `express`, `mongoose`, `passport`, `passport-jwt`, `passport-local`, `bcrypt`, `jsonwebtoken`, `express-validator`.

## Author
Dmitri Korotkov — project owner (see `package.json`)

## License
ISC
