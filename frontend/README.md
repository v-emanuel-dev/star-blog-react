# Star Blog - React & Node.js Blogging Platform

A full-stack blogging application featuring posts, comments, user authentication (including Google OAuth), real-time notifications via WebSockets, profile management, likes, and more. Built with React, TypeScript, Node.js, Express, MySQL, and Tailwind CSS.

## Features

* **Post Management (CRUD):** Create, Read, Update, and Delete blog posts (authors can only edit/delete their own). Posts are linked to user accounts.
* **User Authentication:**
    * Standard user registration with email, password, and optional avatar upload.
    * Secure login using email/password (JWT-based).
    * Login/Signup via Google OAuth 2.0.
    * Password change functionality (requires current password).
    * Protected routes/actions for authenticated users.
* **User Profiles:**
    * Profile page displaying user info (name, email, avatar).
    * Update profile name and avatar image.
* **Comments:**
    * Add comments to posts (logged-in users).
    * View comments on posts (newest first), including commenter's avatar and name.
    * Edit/Delete own comments.
* **Likes:**
    * Like/Unlike posts (logged-in users). Tracks individual likes.
    * Display total like count.
* **Real-time Notifications (Paused):**
    * *Backend logic exists* to emit notifications via WebSockets when comments are added.
    * *Frontend logic exists* to connect to sockets and display a notification count/dropdown (but currently paused/may need review).
* **Search/Filter:** Real-time client-side filtering of posts on the homepage by title, content, or category.
* **Responsive Design:** Styled with Tailwind CSS for various screen sizes.

## Tech Stack

* **Frontend:**
    * React (Vite)
    * TypeScript
    * React Router DOM (v6)
    * Tailwind CSS
    * Socket.IO Client
    * Font Awesome
    * Axios (or native `Workspace`) - Currently native fetch
* **Backend:**
    * Node.js
    * Express.js
    * JavaScript (CommonJS)
    * MySQL (`mysql2` library)
    * JSON Web Tokens (`jsonwebtoken`)
    * Password Hashing (`bcrypt`)
    * Google OAuth 2.0 (`passport`, `passport-google-oauth20`)
    * File Uploads (`multer`)
    * WebSockets (`socket.io`)
    * Session Management (`express-session`)
* **Database:**
    * MySQL

## Prerequisites

* Node.js (v18+ recommended)
* npm (v8+ recommended) or yarn
* MySQL Server (v8 recommended)

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

Create `.env` files in both the `backend` and `frontend` directories based on the examples below.

1.  **Backend (`backend/.env`):**
    *(Create this file in the `backend` directory)*
    ```dotenv
    PORT=4000

    # Database Connection
    DB_HOST=localhost
    DB_USER=your_db_user         # Replace with your MySQL username
    DB_PASSWORD=your_db_password # Replace with your MySQL password
    DB_NAME=star_blog_db         # Your database name

    # Security
    JWT_SECRET=your_super_strong_random_jwt_secret_key_!@#$%^&*()
    SESSION_SECRET=another_random_secret_for_sessions_12345

    # Google OAuth Credentials (Get from Google Cloud Console)
    GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    ```
    *(Consider adding a `backend/.env.example` file to your repository)*

## Database Setup

1.  **Ensure MySQL Server is Running.**
2.  **Connect to MySQL** using a client.
3.  **Create the Database:**
    ```sql
    CREATE DATABASE IF NOT EXISTS star_blog_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    USE star_blog_db;
    ```
4.  **Create the Tables:** Execute the following SQL commands:

    ```sql
    -- users table
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(60) NULL,
        name VARCHAR(100) NULL,
        avatar_url VARCHAR(512) NULL DEFAULT NULL,
        google_id VARCHAR(255) UNIQUE NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT users_chk_1 CHECK (((password_hash is not null) or (google_id is not null)))
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    -- posts table
    CREATE TABLE IF NOT EXISTS posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content LONGTEXT NULL,
        author_id INT NULL DEFAULT NULL,
        date VARCHAR(50) NULL,
        categories JSON NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_post_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    -- post_likes table
    CREATE TABLE IF NOT EXISTS post_likes (
        user_id INT NOT NULL,
        post_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, post_id),
        CONSTRAINT fk_like_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_like_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    ```
5.  **(Optional) Add Sample Data:** Use the SQL dump file you generated (e.g., `mysql -u your_user -p star_blog_db < your_dump_file.sql`) or manually add users/posts. If using the dump, be aware the `posts` table might contain the old `author` string column. Ensure `author_id` values are correctly set for posts.

## Running the Application

1.  **Start the Backend Server:**
    ```bash
    cd backend
    npm run dev
    ```
    *(Server runs on `http://localhost:4000`)*

2.  **Start the Frontend Server:**
    *(Open a new terminal)*
    ```bash
    cd frontend
    npm run dev
    ```
    *(App runs on `http://localhost:5173`)*

3.  Open `http://localhost:5173` in your browser.

## API Endpoints Overview

* `/api/auth`: Login, Register, Get Current User, Google Auth
* `/api/posts`: Posts CRUD, Comments (nested), Likes (nested)
* `/api/users`: Profile Update, Password Change
* `/api/comments`: Comment Update/Delete

*(See route files in `backend/routes/` for details or use an API tool like Postman.)*
