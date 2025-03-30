const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const passport = require('passport');
const uploadAvatar = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware'); // Ensure protect is imported

const router = express.Router();
const saltRounds = 10;

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  // ... validation ...
  try {
    // Include avatar_url in SELECT
    const sql = "SELECT id, email, password_hash, name, avatar_url FROM users WHERE email = ?";
    const [users] = await pool.query(sql, [email]);
    if (users.length === 0) { /* ... handle not found ... */ }
    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) { /* ... handle password mismatch ... */ }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) { /* ... handle missing secret ... */ }

    // Include avatar_url in JWT payload
    const payload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatar_url // Added avatar_url
    };
    const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });

    res.status(200).json({
      message: "Login successful!",
      token: token,
      user: { // Include avatar_url in response user object
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatar_url // Added avatar_url
      }
    });
  } catch (error) { /* ... handle error ... */ }
});

router.post('/register', uploadAvatar, async (req, res) => {
  // Text fields are now in req.body (parsed by multer from form-data)
  const { email, password, name } = req.body;
  // Uploaded file info is in req.file (if upload was successful)
  const avatarFile = req.file;

  // Validation for text fields
  if (!email || !password) {
      // Note: If upload fails due to filter/limit, this might not be reached
      // Multer errors might need specific handling later if needed
      return res.status(400).json({ message: "Email and password are required." });
  }
  if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
  }

  try {
      // Check if email already exists
      const checkUserSql = "SELECT id FROM users WHERE email = ?";
      const [existingUsers] = await pool.query(checkUserSql, [email]);

      if (existingUsers.length > 0) {
          // If email exists, we should ideally delete the uploaded file if one exists
          // For simplicity now, we just return the error. Needs refinement for production.
          // if (avatarFile) { require('fs').unlinkSync(avatarFile.path); } // Example cleanup
          return res.status(409).json({ message: "This email is already registered." });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Determine the avatar URL path to store (or null if no file uploaded)
      // We construct the URL path based on where the file was saved and how we serve it
      const avatarUrlPath = avatarFile ? `/uploads/avatars/${avatarFile.filename}` : null;

      // Insert user with avatar_url path
      const insertSql = "INSERT INTO users (email, password_hash, name, avatar_url) VALUES (?, ?, ?, ?)";
      const values = [
          email,
          hashedPassword,
          name || null,
          avatarUrlPath // Store the path/URL
      ];
      const [results] = await pool.query(insertSql, values);

      res.status(201).json({
          message: "User registered successfully!",
          userId: results.insertId
      });

  } catch (error) {
      // General error handling (includes potential errors from file upload middleware pass-through)
      console.error('Error registering user:', error);
       // If an avatar was uploaded but DB insert failed, consider deleting the orphaned file
       // if (avatarFile) { require('fs').unlinkSync(avatarFile.path); } // Example cleanup
      res.status(500).json({ message: "Internal server error during registration.", error: error.message });
  }
});

router.get('/me', protect, async (req, res) => {
  // 'protect' middleware ran successfully and attached user info to req.user
  // req.user contains the payload from the JWT (userId, email, name, avatarUrl)

  // It's often good practice to re-fetch from DB to ensure data is current,
  // especially if sensitive info isn't in the JWT.
  // We'll fetch id, email, name, avatar_url, created_at.

  if (!req.user || !req.user.id) {
       // Should not happen if 'protect' middleware worked, but good check
       return res.status(401).json({ message: 'Not authorized, user ID missing from token' });
  }

  try {
      const userId = req.user.id;
      const sql = "SELECT id, email, name, avatar_url, created_at FROM users WHERE id = ?";
      const [users] = await pool.query(sql, [userId]);

      if (users.length === 0) {
          // User existed in token but not in DB? Very unlikely.
          return res.status(404).json({ message: 'User not found in database' });
      }

      // Send back the user data (excluding password hash)
      res.json(users[0]);

  } catch (error) {
      console.error('Error fetching user data for /me:', error);
      res.status(500).json({ message: 'Error fetching user data', error: error.message });
  }
});

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get('/google/callback',
  passport.authenticate('google', {
      failureRedirect: 'http://localhost:5173/login?error=google-auth-failed',
      session: false
  }),
  // This function now receives { token: '...' } in req.user if successful
  (req, res) => {
    console.log('Google Callback: Authentication successful.');

    // 1. Check if req.user and req.user.token exist
    if (!req.user || !req.user.token) {
        console.error("Google Callback Error: Token not found in req.user after Passport authenticate.");
        return res.redirect('http://localhost:5173/login?error=token-generation-failed');
    }

    // 2. Extract the token generated by the verify callback
    const token = req.user.token;

    // 3. Redirect back to FRONTEND with the token
    console.log("Google Callback: Redirecting to frontend with token.");
    res.redirect(`http://localhost:5173/auth/callback?token=${token}`);

    // Note: We no longer generate the JWT here, it was done in passport-setup
  }
);

module.exports = router;
