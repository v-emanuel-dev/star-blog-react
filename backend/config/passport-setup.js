// backend/config/passport-setup.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken'); // Import jsonwebtoken
const pool = require('./db');
require('dotenv').config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
      scope: ['profile', 'email']
    },
    // This verify callback now generates JWT and passes it via 'done'
    async (accessToken, refreshToken, profile, done) => {
      console.log('Google profile received:', profile.id);

      const googleId = profile.id;
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
      const name = profile.displayName || `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim();
      const avatarUrl = profile.photos && profile.photos[0] ? profile.photos[0].value : null;

      if (!email) {
        return done(new Error('Could not get email from Google.'), null);
      }

      try {
        let user; // Variable to hold the user from DB

        // 1. Try finding user by Google ID
        let findUserSql = "SELECT id, email, name, google_id, avatar_url FROM users WHERE google_id = ?";
        let [users] = await pool.query(findUserSql, [googleId]);

        if (users.length > 0) {
          // User found by Google ID
          user = users[0];
          if (user.avatar_url !== avatarUrl || user.name !== name) { // Update avatar/name if changed
             console.log(`Updating avatar/name for Google user ${user.id}`);
             await pool.query("UPDATE users SET avatar_url = ?, name = ? WHERE id = ?", [avatarUrl, name, user.id]);
             user.avatar_url = avatarUrl;
             user.name = name;
          }
          console.log('User found by Google ID:', user.id);

        } else {
          // User NOT found by Google ID
          // 2. Try finding by email
          findUserSql = "SELECT id, email, name, google_id, avatar_url FROM users WHERE email = ?";
          [users] = await pool.query(findUserSql, [email]);

          if (users.length > 0) {
            // User found by Email. Link Google ID and update avatar/name.
             user = users[0];
             console.log('User found by Email, linking Google ID and updating info:', user.id);
             const updateSql = "UPDATE users SET google_id = ?, avatar_url = ?, name = ? WHERE id = ?";
             await pool.query(updateSql, [googleId, avatarUrl, name, user.id]);
             user.google_id = googleId;
             user.avatar_url = avatarUrl;
             user.name = name;

          } else {
            // User NOT found by email - Create new user
            console.log('Creating new user with Google data');
            const insertSql = "INSERT INTO users (email, name, google_id, password_hash, avatar_url) VALUES (?, ?, ?, NULL, ?)";
            const values = [email, name || 'Google User', googleId, avatarUrl];
            const [results] = await pool.query(insertSql, values);

            // Fetch the newly created user
            const [newUser] = await pool.query("SELECT id, email, name, google_id, avatar_url FROM users WHERE id = ?", [results.insertId]);
            if (newUser.length === 0) {
                throw new Error("Failed to fetch newly created user.");
            }
            user = newUser[0];
            console.log('New user created with ID:', user.id);
          }
        }

        // --- JWT Generation ---
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error("JWT_SECRET not defined."); // Throw error to be caught below
        }
         if (!user || !user.id || !user.email) {
             throw new Error("User data is missing for JWT payload.");
         }

        const payload = {
            userId: user.id,
            email: user.email,
            name: user.name,
            avatarUrl: user.avatar_url
        };
        const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });

        // Call 'done' with null error and an object containing the token
        // This object will be attached to req.user in the callback route handler
        done(null, { token: token });

      } catch (err) {
        // Database or JWT signing error
        console.error("Error during Google strategy verify callback:", err);
        done(err, null);
      }
    }
  )
);
