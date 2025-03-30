const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const passport = require('passport');

const router = express.Router();
const saltRounds = 10;

router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long." });
  }
  try {
    const checkUserSql = "SELECT id FROM users WHERE email = ?";
    const [existingUsers] = await pool.query(checkUserSql, [email]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: "This email is already registered." });
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const insertSql = "INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)";
    const values = [email, hashedPassword, name || null];
    const [results] = await pool.query(insertSql, values);
    res.status(201).json({ message: "User successfully registered!", userId: results.insertId });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: "Internal server error while registering user.", error: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }
  try {
    const sql = "SELECT id, email, password_hash, name FROM users WHERE email = ?";
    const [users] = await pool.query(sql, [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid credentials." });
    }
    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("CRITICAL ERROR: JWT_SECRET is not defined!");
      return res.status(500).json({ message: "Internal server error." });
    }
    const payload = { userId: user.id, email: user.email, name: user.name };
    const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });
    res.status(200).json({
      message: "Login successful!",
      token: token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: "Internal server error while logging in.", error: error.message });
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
  (req, res) => {
    console.log('User authenticated via Google callback:', req.user);
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret || !req.user || typeof req.user !== 'object' || !('id' in req.user) || !('email' in req.user)) {
      console.error("Error generating JWT in Google callback: missing/invalid user data.", req.user);
      return res.redirect('http://localhost:5173/login?error=jwt-payload-error');
    }

    const payload = {
      userId: req.user.id,
      email: req.user.email,
      name: req.user.name
    };

    try {
      const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });
      res.redirect(`http://localhost:5173/auth/callback?token=${token}`);
    } catch (error) {
      console.error("Error signing JWT in Google callback:", error);
      res.redirect('http://localhost:5173/login?error=jwt-signing-failed');
    }
  }
);

module.exports = router;
