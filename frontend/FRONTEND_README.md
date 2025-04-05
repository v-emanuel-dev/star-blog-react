# Star Blog - Frontend Documentation

This document provides details about the React/TypeScript frontend application for the Star Blog project.

## Tech Stack

* **Framework/Library:** React (using Vite)
* **Language:** TypeScript
* **Routing:** React Router DOM (v6)
* **Styling:** Tailwind CSS
* **State Management:** React Context API (`AuthContext`)
* **Real-time:** Socket.IO Client
* **Utilities:** `date-fns` (or native Date), Font Awesome
* **API Communication:** Native `Workspace` API (via `src/services/api.ts`)

## Prerequisites

* Node.js (v18+ recommended)
* npm (v8+ recommended) or yarn

## Installation

1.  Navigate to the frontend directory from the project root:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

## Environment Setup (Optional)

While the application can run using hardcoded backend URLs, it's recommended to create a `.env` file in the `frontend` directory for configuration:

* **`frontend/.env`:**
    ```dotenv
    # Ensure these start with VITE_ to be exposed by Vite
    VITE_API_BASE_URL=http://localhost:4000/api
    VITE_SOCKET_URL=http://localhost:4000
    VITE_BACKEND_URL=http://localhost:4000 # Base URL for images etc.
    ```
* **Code Update:** If using the `.env` file, update the constants in `src/services/api.ts`, `src/context/AuthContext.tsx`, and `src/components/Header.tsx` to use `import.meta.env.VITE_VARIABLE_NAME` instead of hardcoded URLs. *(Note: This configuration step hasn't been explicitly implemented in the code provided so far.)*

## Running the Frontend

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Start the development server:
    ```bash
    npm run dev
    ```
3.  Open `http://localhost:5173` (or the port indicated by Vite) in your browser.

*(Note: The backend server must also be running for the application to function fully).*

---

## Frontend Architecture

### Project Structure

The `frontend/src/` directory is organized as follows:

* **`assets/`**: Contains static assets like images or global CSS files (if any).
* **`components/`**: Holds reusable UI components used across multiple pages (e.g., `PostCard`, `PostForm`, `Header`, `Footer`, `Alert`, `Spinner`, `ProtectedRoute`, `DefaultAvatar`).
* **`context/`**: Contains React Context providers and hooks for global state management (e.g., `AuthContext.tsx` for user authentication, token, socket connection, and notifications).
* **`hooks/`**: Optional directory for custom React hooks.
* **`pages/`**: Contains top-level components representing distinct pages/routes of the application (e.g., `HomePage.tsx`, `PostPage.tsx`, `LoginPage.tsx`, `ProfilePage.tsx`, etc.).
* **`services/`**: Includes the `api.ts` file responsible for making calls to the backend API endpoints.
* **`types/`**: Contains TypeScript interface definitions (`index.ts`) for shared data structures like `Post`, `User`, `Comment`.
* **`utils/`**: Contains reusable utility functions (e.g., `dateUtils.ts` for date formatting).
* **`App.tsx`**: The main application component responsible for setting up context providers and defining routes using React Router.
* **`main.tsx`**: The entry point of the React application, responsible for rendering the root component (`App`) into the DOM.

### State Management (`AuthContext.tsx`)

Global state is primarily managed using React Context API.

* **Purpose:** Manages user authentication state, JWT token, initial loading status, WebSocket connection status, and real-time notifications.
* **Provider:** `<AuthProvider>` must wrap the parts of the application that need access to auth state (typically wrapping the entire `<App />` or its contents).
* **Hook:** `useAuth()` provides access to the context value.
* **Context Value:**
    * `user: AuthUser | null`: An object containing the logged-in user's details (`id`, `email`, `name`, `avatarUrl`) or `null` if not logged in.
    * `token: string | null`: The JWT authentication token, or `null`.
    * `isLoading: boolean`: True while the context is performing the initial check for stored credentials, false otherwise. Used to show initial loading state.
    * `isConnected: boolean`: True if the WebSocket connection to the backend is currently active, false otherwise.
    * `notificationCount: number`: The count of unread notifications received via WebSocket.
    * `notifications: Notification[]`: An array holding recent notification objects (includes message, postId, etc.).
    * `login(userData, token)`: Function to call after successful login API call. Updates state and stores credentials in localStorage.
    * `logout()`: Function to log the user out. Clears state, removes credentials from localStorage, and disconnects the WebSocket.
    * `clearNotifications()`: Function to reset the `notificationCount` to 0 and clear the `notifications` array.
    * `markNotificationsAsRead()`: Function to mark all current notifications as read (sets `read: true` internally) and resets the `notificationCount` to 0. Used when the notification dropdown is opened.

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
    * **Purpose:** A wrapper component used in routing (`App.tsx`) to protect specific routes.
    * **Functionality:** Checks authentication status using `useAuth`. Renders child route (`Outlet`) if authenticated, otherwise redirects to `/login`.
    * **Usage:** Wraps protected `<Route>` definitions in `App.tsx`.

### Routing (`src/App.tsx`)

Client-side routing is handled using `react-router-dom` (v6).

* **`<BrowserRouter>`:** Wraps the application.
* **`<Routes>`:** Defines the routing context.
* **`<Route>`:** Defines individual route mappings:
    * **Public Routes:** `/`, `/about`, `/post/:id`, `/login`, `/register`, `/auth/callback`.
    * **Protected Routes:** `/profile`, `/new-post`, `/edit-post/:id` (wrapped by `<ProtectedRoute />`).
    * **Catch-All Route:** `*` (renders a "Not Found" message).

### API Service Layer (`src/services/api.ts`)

* **Purpose:** Centralizes all communication with the backend API, abstracting `Workspace` calls.
* **Functionality:** Defines base URL, includes functions for all API interactions (posts, auth, users, comments, likes), handles `Authorization` headers (JWT), manages `FormData` vs JSON, performs data mapping (e.g., snake_case to camelCase), handles basic response checking and error throwing.
* **Usage:** Imported and used by pages and components that need to interact with the backend.

### Type Definitions (`src/types/index.ts`)

* **Purpose:** Provides centralized TypeScript interfaces (`Post`, `User`, `Comment`, `CommentUser`, etc.) for data structures used throughout the frontend.
* **Benefits:** Ensures data consistency, improves code maintainability, enables static type checking.
* **Usage:** Imported and used across the frontend codebase for typing props, state, function parameters, and return values.
