# Star Blog - React & Node.js Blogging Platform

A full-stack blogging application featuring posts, comments, user authentication (including Google OAuth), real-time notifications via WebSockets, profile management, likes, and more. Built with React, TypeScript, Node.js, Express, MySQL, and Tailwind CSS.

## Features

* **Post Management (CRUD):** Create, Read, Update, and Delete blog posts (authors can only edit/delete their own). Posts are linked to user accounts.
* **User Authentication:**
    * Standard user registration with email, password, and optional avatar upload.
    * Secure login using email/password (JWT-based).
    * Login/Signup via Google OAuth 2.0.
    * Password change functionality (requires current password).
    * Protected routes for authenticated actions.
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
* **Real-time Notifications:**
    * Backend emits notifications via WebSockets when comments are added by other users.
    * Frontend connects via WebSocket when logged in.
    * Notification count badge displayed in the header's bell icon.
    * Simple notification dropdown list (shows message, relative time, links to post).
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
    * Native `Workspace` API
* **Backend:**
    * Node.js
    * Express.js
    * JavaScript (CommonJS)
    * MySQL (`mysql2` library)
    * JSON Web Tokens (JWT) (`jsonwebtoken`)
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
5.  **(Optional) Populate with Sample Data:** Use an SQL dump file (like the one you generated) or manually add users/posts. Ensure `author_id` values are correctly set for posts.

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

The backend provides API endpoints under the following base paths:

* `/api/auth/`: User login, registration, get current user (`/me`), Google OAuth flow.
* `/api/posts/`: Posts CRUD, Comments (nested), Likes (nested).
* `/api/users/`: User profile updates (`/profile`), password changes (`/password`).
* `/api/comments/`: Comment Update/Delete (`/:commentId`).

*(Refer to `API_DOCUMENTATION.md` for detailed endpoint specifications).*

## Frontend Details

### Project Structure

The `frontend/src/` directory is organized as follows:

* **`assets/`**: Contains static assets like images or global CSS files (if any).
* **`components/`**: Holds reusable UI components used across multiple pages (e.g., `PostCard`, `PostForm`, `Header`, `Footer`, `Alert`, `Spinner`, `ProtectedRoute`, `DefaultAvatar`).
* **`context/`**: Contains React Context providers and hooks for global state management (e.g., `AuthContext.tsx`).
* **`hooks/`**: Optional directory for custom React hooks.
* **`pages/`**: Contains top-level components representing distinct pages/routes (e.g., `HomePage.tsx`, `PostPage.tsx`, `LoginPage.tsx`, `ProfilePage.tsx`, etc.).
* **`services/`**: Includes the `api.ts` file responsible for making calls to the backend API endpoints.
* **`types/`**: Contains TypeScript interface definitions (`index.ts`) for shared data structures like `Post`, `User`, `Comment`.
* **`utils/`**: Contains reusable utility functions (e.g., `dateUtils.ts`).
* **`App.tsx`**: The main application component (routing, context providers).
* **`main.tsx`**: The application entry point (renders `App`).

### State Management (`AuthContext.tsx`)

Global state is primarily managed using React Context API.

* **Purpose:** Manages user authentication state, JWT token, initial loading status, WebSocket connection status, and real-time notifications.
* **Provider:** `<AuthProvider>` wraps the application in `App.tsx`.
* **Hook:** `useAuth()` provides access to the context value.
* **Context Value:**
    * `user`: Object with logged-in user's details (`id`, `email`, `name`, `avatarUrl`) or `null`.
    * `token`: JWT string or `null`.
    * `isLoading`: Boolean for initial auth check state.
    * `isConnected`: Boolean for WebSocket connection status.
    * `notificationCount`: Number of unread notifications.
    * `notifications`: Array of recent notification objects.
    * `login(userData, token)`: Updates state/localStorage after login.
    * `logout()`: Clears state/localStorage and disconnects socket.
    * `clearNotifications()`: Clears notification array and count.
    * `markNotificationsAsRead()`: Marks notifications as read and resets count.

### Reusable Components

Key reusable components located in `src/components/`:

* **`Header.tsx`**
    * **Purpose:** Displays the main site navigation bar.
    * **Features:** Logo, nav links, conditional links (New Post, Profile), conditional user avatar/dropdown or Login/Register button, notification bell/badge/dropdown, responsive mobile menu.
    * **Usage:** Rendered once within `App.tsx`.
* **`Footer.tsx`**
    * **Purpose:** Displays the site footer.
    * **Usage:** Rendered once within `App.tsx`.
* **`PostCard.tsx`**
    * **Purpose:** Displays a summary preview of a single blog post.
    * **Props:** `id`, `title`, `content`(optional), `date`, `author` (object), `categories` (array), `likes`, `commentCount`, `likedByCurrentUser` (optional).
    * **Features:** Displays info, handles like toggle via API, links to post/comments. Shows truncated content.
    * **Usage:** Used in `HomePage.tsx`.
* **`PostForm.tsx`**
    * **Purpose:** Provides a form for creating or editing blog posts (Title, Content, Date, Categories).
    * **Props:** `onSubmit`, `initialData` (optional), `isLoading` (optional), `submitButtonText` (optional).
    * **Usage:** Used by `NewPostPage.tsx` and `EditPostPage.tsx`.
* **`Alert.tsx`**
    * **Purpose:** Displays styled feedback messages (error, success, warning) with optional title and close button.
    * **Props:** `message`, `type` (optional), `title` (optional), `onClose` (optional), `className` (optional).
    * **Usage:** Used across pages/components for user feedback.
* **`Spinner.tsx`**
    * **Purpose:** Displays an animated loading spinner icon.
    * **Props:** `size` (optional), `color` (optional), `className` (optional).
    * **Usage:** Used to indicate loading states.
* **`ProtectedRoute.tsx`**
    * **Purpose:** Wraps routes that require authentication.
    * **Functionality:** Checks auth status via `useAuth`. Renders child route (`Outlet`) if authenticated, otherwise redirects to `/login`.
    * **Usage:** Wraps protected `<Route>`s in `App.tsx`.

### Routing (`src/App.tsx`)

Client-side routing is handled using `react-router-dom` (v6).

* **`<BrowserRouter>`:** Wraps the application.
* **`<Routes>`:** Defines the routing context.
* **`<Route>`:** Maps URL paths to page components.
    * **Public:** `/`, `/about`, `/post/:id`, `/login`, `/register`, `/auth/callback`.
    * **Protected:** `/profile`, `/new-post`, `/edit-post/:id` (wrapped by `<ProtectedRoute />`).
    * **Catch-All:** `*` (renders a "Not Found" message).

### API Service Layer (`src/services/api.ts`)

* **Purpose:** Centralizes all communication with the backend API, abstracting `Workspace` calls.
* **Functionality:** Defines base URL, includes functions for all API interactions (posts, auth, users, comments, likes), handles `Authorization` headers (JWT), manages `FormData` vs JSON, performs data mapping (e.g., snake_case to camelCase), handles basic response checking and error throwing.
* **Usage:** Imported and used by pages and components that need to interact with the backend.

### Type Definitions (`src/types/index.ts`)

* **Purpose:** Provides centralized TypeScript interfaces (`Post`, `User`, `Comment`, `CommentUser`, etc.) for data structures used throughout the frontend.
* **Benefits:** Ensures data consistency, improves code maintainability, enables static type checking.
* **Usage:** Imported and used across the frontend codebase for typing props, state, function parameters, and return values.
