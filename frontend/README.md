# Star Blog - React & Node.js Blogging Platform

A full-stack blogging application featuring posts, comments, user authentication (including Google OAuth), real-time notifications via WebSockets, profile management, and more. Built with React, TypeScript, Node.js, Express, MySQL, and Tailwind CSS.

## Features

* **Post Management (CRUD):** Create, Read, Update, and Delete blog posts (authors can only edit/delete their own).
* **User Authentication:**
    * Standard user registration with email, password, and optional avatar upload.
    * Secure login using email/password (JWT-based).
    * Login/Signup via Google OAuth 2.0.
    * Password change functionality.
    * Protected routes for authenticated actions.
* **User Profiles:**
    * View user profile information.
    * Update profile name and avatar image.
* **Comments:**
    * Add comments to posts (logged-in users).
    * View comments on posts (newest first).
    * Edit/Delete own comments.
* **Likes:**
    * Like/Unlike posts (logged-in users).
    * Display total like count.
* **Real-time Notifications:**
    * Post authors receive instant notifications (via WebSockets) when another user comments on their post.
    * Notification count badge displayed in the header.
    * Simple notification dropdown list.
* **Search/Filter:** Real-time client-side filtering of posts on the homepage by title, content, or category.
* **Responsive Design:** Styled with Tailwind CSS for various screen sizes.

## Tech Stack

* **Frontend:**
    * React (Vite)
    * TypeScript
    * React Router DOM (v6)
    * Tailwind CSS
    * Socket.IO Client
    * Font Awesome (for icons)
    * Axios (or native `Workspace`) - *Using native fetch currently*
* **Backend:**
    * Node.js
    * Express.js
    * TypeScript (or JavaScript as currently implemented) - *Currently JavaScript*
    * MySQL (using `mysql2` library)
    * JSON Web Tokens (JWT) (`jsonwebtoken`)
    * Password Hashing (`bcrypt`)
    * Google OAuth 2.0 (`passport`, `passport-google-oauth20`)
    * File Uploads (`multer`)
    * WebSockets (`socket.io`)
    * Session Management (`express-session` - primarily for Passport compatibility)
* **Database:**
    * MySQL

## Prerequisites

* Node.js (e.g., v18 LTS or later - check your `node -v`)
* npm (usually comes with Node.js) or yarn
* MySQL Server (running locally or accessible)

## Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url> star-blog-react
    cd star-blog-react
    ```
2.  **Install Backend Dependencies:**
    ```bash
    cd backend
    npm install
    ```
3.  **Install Frontend Dependencies:**
    ```bash
    cd ../frontend
    npm install
    ```

## Environment Setup

You need to create `.env` files for both the backend and potentially the frontend. Example files (`.env.example`) should ideally be created and committed.

1.  **Backend (`backend/.env`):**
    Create this file in the `backend` directory and add the following variables (replace placeholders with your actual values):
    ```dotenv
    PORT=4000

    # Database Connection
    DB_HOST=localhost
    DB_USER=your_db_user         # Replace with your MySQL username
    DB_PASSWORD=your_db_password # Replace with your MySQL password
    DB_NAME=star_blog_db         # Replace with your database name

    # Security
    JWT_SECRET=your_super_strong_random_jwt_secret_key_!@#$%^&*()
    SESSION_SECRET=another_random_secret_for_sessions_12345

    # Google OAuth Credentials (Get from Google Cloud Console)
    GOOGLE_CLIENT_ID=your_google_client_[id.apps.googleusercontent.com](https://www.google.com/search?q=id.apps.googleusercontent.com)
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    ```
    *Recommendation: Create `backend/.env.example` listing these variables without values.*

## Database Setup

1.  Ensure your MySQL server is running.
2.  Connect to MySQL using a client (e.g., MySQL Workbench, `mysql` command line).
3.  Create the database if it doesn't exist:
    ```sql
    CREATE DATABASE IF NOT EXISTS star_blog_db;
    USE star_blog_db;
    ```
4.  Create the tables by running the following SQL commands (or execute them from a `.sql` file):

    ```sql
    -- users table
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(60) NULL, -- Nullable for OAuth-only users
        name VARCHAR(100) NULL,
        avatar_url VARCHAR(512) NULL DEFAULT NULL,
        google_id VARCHAR(255) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        -- Removed CHECK constraint for simplicity
    );

    -- posts table
    CREATE TABLE IF NOT EXISTS posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NULL,
        author_id INT NULL DEFAULT NULL, -- Link to users table
        date VARCHAR(50) NULL, -- Consider changing to DATE type later
        categories JSON NULL, -- Store categories as JSON array string
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_post_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
        -- Removed 'excerpt' and simple 'likes' columns
        -- Removed old 'author' VARCHAR column
    );

    -- comments table
    CREATE TABLE IF NOT EXISTS comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        content TEXT NOT NULL,
        post_id INT NOT NULL,
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_comment_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        CONSTRAINT fk_comment_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_post_id (post_id)
    );

    -- post_likes table
    CREATE TABLE IF NOT EXISTS post_likes (
        user_id INT NOT NULL,
        post_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, post_id),
        CONSTRAINT fk_like_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_like_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    );
    ```
5.  **Manual Data Update (If needed):** Ensure existing posts in the `posts` table have a valid `author_id` linking to a user in the `users` table.

## Running the Application

1.  **Start the Backend Server:**
    ```bash
    cd backend
    npm run dev
    ```
    *(Server should start on `http://localhost:4000` by default)*

2.  **Start the Frontend Server:**
    * Open a **new separate terminal**.
    ```bash
    cd frontend
    npm run dev
    ```
    *(Application should be accessible at `http://localhost:5173` by default)*

3.  Open `http://localhost:5173` in your browser.

## API Endpoints

The backend provides API endpoints under the following base paths:

* `/api/auth/`: User login, registration, get current user (`/me`), Google OAuth flow.
* `/api/posts/`: CRUD operations for posts, plus comments (`/:postId/comments`) and likes (`/:postId/like`).
* `/api/users/`: User profile updates (`/profile`), password changes (`/password`).
* `/api/comments/`: Editing and deleting specific comments (`/:commentId`).

*(Refer to backend route files for detailed parameters and request/response structures or use Postman for exploration).*

---

This provides a solid starting point for your project's documentation. You can expand on any section later, especially the API endpoints. Would you like to work on documenting the API routes in more detail next, perhaps in separate files?
