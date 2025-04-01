// backend/middleware/socketAuthMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Ensure JWT_SECRET is loaded

const socketAuthMiddleware = (socket, next) => {
    // Client should send token in socket.handshake.auth object
    const token = socket.handshake.auth.token;
    console.log('[Socket Auth] Attempting auth with token:', token ? 'Token Present' : 'No Token');

    if (!token) {
        return next(new Error('Authentication error: No token provided'));
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
         console.error("[Socket Auth] JWT_SECRET missing in environment");
         return next(new Error('Authentication error: Server configuration issue'));
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, jwtSecret);

        // Attach decoded user payload to the socket object for later use
        // Make sure this matches the payload structure used during JWT creation
        socket.user = {
            id: decoded.userId, // Ensure property names match JWT payload
            email: decoded.email,
            name: decoded.name,
            avatarUrl: decoded.avatarUrl
        };
        console.log('[Socket Auth] Authentication successful for user:', socket.user.id);
        next(); // Token is valid, proceed with connection

    } catch (err) {
        console.error('[Socket Auth] Token verification failed:', err.message);
        next(new Error('Authentication error: Invalid token')); // Token invalid/expired
    }
};

module.exports = { socketAuthMiddleware };
