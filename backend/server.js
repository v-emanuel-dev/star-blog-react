const express = require('express');
const cors = require('cors');
require('dotenv').config();
const passport = require('passport');
require('./config/passport-setup');
const postsRouter = require('./routes/posts');
const authRouter = require('./routes/auth');
const session = require('express-session');
const path = require('path');
const usersRouter = require('./routes/users');
const commentsRouter = require('./routes/comments');
const http = require('http');
const { Server } = require("socket.io"); // Destructuring import
const { socketAuthMiddleware } = require('./middleware/socketAuthMiddleware');

const app = express();
const PORT = process.env.PORT || 4000;

// Create HTTP server instance from the Express app
const server = http.createServer(app);

// Initialize Socket.IO server, attaching it to the HTTP server
// Configure CORS for Socket.IO to allow frontend origin
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Your frontend URL
        methods: ["GET", "POST"],
        // credentials: true // Add if needed later for cookies/sessions with sockets
    }
});

app.set('socketio', io); // Make io accessible in route handlers via req.app.get('socketio')
io.use(socketAuthMiddleware); // Apply authentication middleware to each socket connection

// --- Socket.IO Connection Handling ---
io.on('connection', (socket) => {
  // socket.user should be attached by socketAuthMiddleware
  if (!socket.user) {
       console.error("Socket connection without authenticated user allowed through middleware?");
       return socket.disconnect(true); // Force disconnect
  }

  const userId = socket.user.id; // Get user ID from authenticated socket
  const userRoom = userId.toString(); // Room name will be the user ID as a string

  console.log(`User ${userId} connected via WebSocket: ${socket.id}`);

  // Have the socket join a room identified by their user ID
  socket.join(userRoom);
  console.log(`Socket ${socket.id} joined room '${userRoom}'`);

  // Listen for client disconnecting
  socket.on('disconnect', (reason) => {
      console.log(`User ${userId} disconnected from WebSocket ${socket.id}. Reason: ${reason}`);
      // No need to explicitly leave rooms, socket.io handles it
  });

  // Example: Listening for a message FROM this specific client
  // socket.on('my_event', (data) => { console.log(data); });
});

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'fallback_session_secret',
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- ROUTES ---
app.get('/', (req, res) => {
  res.json({ message: 'Hello from Star Blog Backend!' });
});

app.use('/api/posts', postsRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/comments', commentsRouter);

// --- START SERVER ---
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
