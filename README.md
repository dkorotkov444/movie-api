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

## Project structure (high level)

- `src/index.js` — main Express server and route definitions
- `src/routes/auth.js` — login route & JWT generation
- `src/config/passport.js` — Passport local + JWT strategies
- `src/models/models.js` — Mongoose schemas for `User` and `Movie`
- `data/fixtures/` — small test fixtures / seed data (movies, users, starring lists)
- `data/backups/` — full database backups (optional, large files)
- `tools/` — developer utilities (data migration, cleanup)

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

## Token revocation and profile updates

- Tokens are standard JWTs signed with `JWT_SECRET` and contain `iat` and `exp` claims (expires in 3 hours).
- When a user changes sensitive data (username or password) the server now revokes all previously issued tokens for that user by recording a `tokenInvalidBefore` timestamp in the user record.
- Behavior for clients:
	- `PATCH /users/:username` will NOT return a new token when username or password are changed. The client must re-login via `POST /login` to receive a fresh token.
	- Non-sensitive updates (email, birth date, favorites) do not revoke tokens and behave as before.

Implementation notes for maintainers:
- A new field `tokenInvalidBefore` (Date) was added to the `User` schema (`src/models/models.js`). Default is epoch (no invalidation).
- Passport's JWT strategy checks token `iat` against `user.tokenInvalidBefore` and rejects tokens issued earlier than that timestamp.
- This approach is simple, persistent across server restarts, and does not require extra infrastructure like Redis.

## Scripts / tools

- The `scripts/` folder contains maintenance and data-migration utilities (for example `migrate-favorites.js` and `users-cleanup.js`). Treat these as developer tools — run them locally when needed. They are not part of the production server runtime.

## Data files (fixtures / backups)

- The repository contains data files used as fixtures and backups. Suggested location is `data/fixtures/` for test fixtures (movies, starring lists, small `users.json` for testing) and `data/backups/` for full database exports/backups.
- Should you push `data/` to GitHub? It depends:
	- If the data contains no secrets and is small (test fixtures), keeping them in the repo is convenient for CI, tests, and onboarding. Use `data/fixtures/` for this.
	- For full database backups or large exports (`reeldb.*.backup*.json`) you may prefer to keep them outside the repo or in a separate releases/storage bucket (they can bloat the repository). Put backups in `data/backups/` and consider adding them to `.gitignore` if you don't want them versioned.

## Dependencies
See `package.json` for the full list. Key libraries: `express`, `mongoose`, `passport`, `passport-jwt`, `passport-local`, `bcrypt`, `jsonwebtoken`, `express-validator`.

## Author
Dmitri Korotkov — project owner (see `package.json`)

## License
ISC
