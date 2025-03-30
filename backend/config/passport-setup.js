const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
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
    async (accessToken, refreshToken, profile, done) => {
      console.log('Google profile:', profile);

      const googleId = profile.id;
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
      const name = profile.displayName || `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim();

      if (!email) {
        return done(new Error('Could not retrieve email from Google.'), null);
      }

      try {
        let findUserSql = "SELECT * FROM users WHERE google_id = ?";
        let [users] = await pool.query(findUserSql, [googleId]);

        if (users.length > 0) {
          console.log('User found by Google ID:', users[0].id);
          return done(null, users[0]);
        } else {
          findUserSql = "SELECT * FROM users WHERE email = ?";
          [users] = await pool.query(findUserSql, [email]);

          if (users.length > 0) {
            console.log('User found by email, linking Google ID:', users[0].id);
            if (!users[0].google_id) {
              const updateSql = "UPDATE users SET google_id = ? WHERE id = ?";
              await pool.query(updateSql, [googleId, users[0].id]);
            }
            return done(null, users[0]);
          } else {
            console.log('Creating new user with Google data');
            const insertSql = "INSERT INTO users (email, name, google_id, password_hash) VALUES (?, ?, ?, NULL)";
            const values = [email, name || 'Google User', googleId];
            const [results] = await pool.query(insertSql, values);

            const [newUser] = await pool.query("SELECT * FROM users WHERE id = ?", [results.insertId]);
            return done(null, newUser[0]);
          }
        }
      } catch (err) {
        return done(err, null);
      }
    }
  )
);
