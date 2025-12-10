# REEL Movie API Documentation

This documentation describes the RESTful endpoints for the REEL Movie API.

**Version:** 1.2.0 | **Last Updated:** December 10, 2025 | **Standard:** OpenAPI 3.0

## Base URL

Replace `{baseUrl}` with the appropriate URL for your environment:
- **Development:** `http://localhost:8080`
- **Production:** `https://reel-movie-api-608b8b4b3a04.herokuapp.com`

***

## Authentication

Most endpoints require JWT authentication. Include the JWT token in the request header:

```
Authorization: Bearer <token>
```

To obtain a token, login using the `/login` endpoint (see below).

***

### **`POST /login`**

* **Description:** Authenticates a user and returns a JWT token along with the public user profile.
* **Method Type:** POST
* **Endpoint URL:** `{baseUrl}/login`
* **Authentication:** None (public endpoint)
* **Request Body:**
    * **Data Format:** JSON
    * **Expected fields:** `{ "username": "string", "password": "string" }`
* **Data returned:** 
    ```json
    {
      "user": {
        "_id": "string",
        "username": "string",
        "email": "string",
        "birth_date": "ISO-8601 date",
        "favorites": ["movieId1", "movieId2", ...]
      },
      "token": "JWT token string (expires in 3 hours)"
    }
    ```
* **Status codes:**
    * **200 OK** — Login successful
    * **401 Unauthorized** — Invalid username or password

***

### **`GET /`**

* **Description:** A welcome endpoint to confirm the API is running.
* **Method Type:** GET
* **Endpoint URL:** `{baseUrl}/`
* **Authentication:** None
* **Data returned:** A simple string message.

***

## Movie Endpoints

All movie endpoints require JWT authentication.

### **`GET /movies/list`**

* **Description:** Returns a list of all movies available in the database (titles only).
* **Method Type:** GET
* **Endpoint URL:** `{baseUrl}/movies/list`
* **Authentication:** Required
* **Data returned:** An array of movie titles (strings).

***

### **`GET /movies`**

* **Description:** Returns a list of all movie objects in the database with their full details.
* **Method Type:** GET
* **Endpoint URL:** `{baseUrl}/movies`
* **Authentication:** Required
* **Data returned:** An array of movie objects with full details (title, description, genre, director, IMDb rating, poster image, etc.).

***

### **`GET /movies/:title`**

* **Description:** Returns a single movie object by its title.
* **Method Type:** GET
* **Endpoint URL:** `{baseUrl}/movies/:title`
* **Authentication:** Required
* **Path Parameters:**
    * `title`: The title of the movie to retrieve.
* **Data returned:** A movie object with full details.

***

### **`GET /movies/genres/:genreName`**

* **Description:** Returns a genre object with its name and description.
* **Method Type:** GET
* **Endpoint URL:** `{baseUrl}/movies/genres/:genreName`
* **Authentication:** Required
* **Path Parameters:**
    * `genreName`: The name of the genre (e.g., 'Sci-Fi', 'Crime').
* **Data returned:** A genre object.
* **Example Response:**
    ```json
    {
      "name": "Crime",
      "description": "Crime film is a film belonging to the crime fiction genre..."
    }
    ```

***

### **`GET /movies/directors/:directorName`**

* **Description:** Returns a director object with their bio and birth date.
* **Method Type:** GET
* **Endpoint URL:** `{baseUrl}/movies/directors/:directorName`
* **Authentication:** Required
* **Path Parameters:**
    * `directorName`: The name of the director (e.g., 'Quentin Tarantino').
* **Data returned:** A director object.
* **Example Response:**
    ```json
    {
      "name": "Quentin Tarantino",
      "bio": "Quentin Jerome Tarantino is an American filmmaker...",
      "birth_date": "1963-03-27T00:00:00.000Z"
    }
    ```

***

### **`GET /movies/:title/starring`**

* **Description:** Returns a list of all actors starring in a specific movie.
* **Method Type:** GET
* **Endpoint URL:** `{baseUrl}/movies/:title/starring`
* **Authentication:** Required
* **Path Parameters:**
    * `title`: The title of the movie.
* **Data returned:** An array of actor names (strings).
* **Example Response:**
    ```json
    ["Harvey Keitel", "Tim Roth", "Chris Penn", "Steve Buscemi"]
    ```

***

### **`GET /movies/actors/:actorName`**

* **Description:** Returns information about a specific actor.
* **Method Type:** GET
* **Endpoint URL:** `{baseUrl}/movies/actors/:actorName`
* **Authentication:** Required
* **Path Parameters:**
    * `actorName`: The name of the actor.
* **Data returned:** A success message (detailed actor info not yet fully implemented).

***

## User Endpoints

### **`GET /users`** (Admin Only)

* **Description:** Returns a list of all users in the database. **Only accessible by admin user.**
* **Method Type:** GET
* **Endpoint URL:** `{baseUrl}/users`
* **Authentication:** Required (must be admin)
* **Data returned:** An array of user objects (without passwords).
* **Status codes:**
    * **200 OK** — Success
    * **403 Forbidden** — User is not admin

***

### **`POST /users`**

* **Description:** Registers a new user account with provided username, password, email, and optional birth date.
* **Method Type:** POST
* **Endpoint URL:** `{baseUrl}/users`
* **Authentication:** None (public endpoint)
* **Request Body:**
    * **Data Format:** JSON
    * **Expected fields:**
        ```json
        {
          "username": "string (5+ chars, alphanumeric)",
          "password": "string (8+ chars, no spaces)",
          "email": "string (valid email)",
          "birth_date": "YYYY-MM-DD (optional, must be in the past)"
        }
        ```
* **Data returned:** The newly created user object (without password).
* **Status codes:**
    * **201 Created** — User registered successfully
    * **400 Bad Request** — Missing required fields
    * **409 Conflict** — Username or email already exists
    * **422 Unprocessable Entity** — Validation error (username too short, invalid email, birth date in future, etc.)

***

### **`PATCH /users/:username`**

* **Description:** Updates an existing user's information (username, password, email, or birth date). User can only edit their own profile unless they are admin.
* **Method Type:** PATCH
* **Endpoint URL:** `{baseUrl}/users/:username`
* **Authentication:** Required
* **Path Parameters:**
    * `username`: The current username of the user to update.
* **Request Body:**
    * **Data Format:** JSON
    * **Expected fields (at least one required):**
        ```json
        {
          "newUsername": "string (optional)",
          "newPassword": "string (optional)",
          "newEmail": "string (optional)",
          "newBirthDate": "YYYY-MM-DD (optional)"
        }
        ```
* **Important:** If username or password are changed, all previous JWT tokens for that user are invalidated. The user must re-login to obtain a new token.
* **Data returned:** The updated user object (without password).
* **Status codes:**
    * **200 OK** — Update successful
    * **400 Bad Request** — Invalid data
    * **403 Forbidden** — User can only edit their own profile
    * **404 Not Found** — User not found
    * **409 Conflict** — Username or email already exists
    * **422 Unprocessable Entity** — Validation error

***

### **`DELETE /users/:username`**

* **Description:** Deregisters (deletes) a user from the database. User can only delete their own profile unless they are admin.
* **Method Type:** DELETE
* **Endpoint URL:** `{baseUrl}/users/:username`
* **Authentication:** Required
* **Path Parameters:**
    * `username`: The username of the user to delete.
* **Data returned:** A confirmation message.
* **Status codes:**
    * **200 OK** — User deleted successfully
    * **403 Forbidden** — User can only delete their own profile
    * **404 Not Found** — User not found

***

## Favorites Management

### **`PATCH /users/:username/:movieTitle`**

* **Description:** Adds a movie to a user's list of favorite movies. User can only modify their own favorites unless they are admin.
* **Method Type:** PATCH
* **Endpoint URL:** `{baseUrl}/users/:username/:movieTitle`
* **Authentication:** Required
* **Path Parameters:**
    * `username`: The username of the account.
    * `movieTitle`: The title of the movie to add.
* **Data returned:** The updated user object with the new movie added to the `favorites` array.
* **Status codes:**
    * **200 OK** — Movie added to favorites
    * **400 Bad Request** — Movie not found
    * **403 Forbidden** — User can only modify their own favorites
    * **404 Not Found** — User or movie not found

***

### **`DELETE /users/:username/:movieTitle`**

* **Description:** Removes a movie from a user's list of favorite movies. User can only modify their own favorites unless they are admin.
* **Method Type:** DELETE
* **Endpoint URL:** `{baseUrl}/users/:username/:movieTitle`
* **Authentication:** Required
* **Path Parameters:**
    * `username`: The username of the account.
    * `movieTitle`: The title of the movie to remove.
* **Data returned:** The updated user object with the movie removed from the `favorites` array.
* **Status codes:**
    * **200 OK** — Movie removed from favorites
    * **403 Forbidden** — User can only modify their own favorites
    * **404 Not Found** — User or movie not found
