const express = require('express');
const cors = require('cors');
require('dotenv').config();
const passport = require('passport');
require('./config/passport-setup');
const postsRouter = require('./routes/posts');
const authRouter = require('./routes/auth');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    // Use a different secret than JWT, keep it in .env ideally
    secret: process.env.SESSION_SECRET || 'fallback_session_secret',
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session until something stored
    // cookie: { secure: true } // In production, use secure cookies (HTTPS)
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

// --- START SERVER ---
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
