// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Make sure JWT_SECRET is available

const protect = async (req, res, next) => {
    let token;
    if ( req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const jwtSecret = process.env.JWT_SECRET;
            if (!jwtSecret) { throw new Error("Server configuration error"); }
            const decoded = jwt.verify(token, jwtSecret);
            req.user = { id: decoded.userId, email: decoded.email, name: decoded.name, avatarUrl: decoded.avatarUrl };
            next();
        } catch (error) {
            console.error('Token verification failed (protect):', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed.' });
        }
    }
    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token provided.' });
    }
};

const tryAttachUser = async (req, res, next) => {
    let token;
    req.user = null; // Ensure user is null by default for this middleware
    if ( req.headers.authorization && req.headers.authorization.startsWith('Bearer') ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const jwtSecret = process.env.JWT_SECRET;
            if (jwtSecret) {
                const decoded = jwt.verify(token, jwtSecret);
                req.user = { id: decoded.userId, email: decoded.email, name: decoded.name, avatarUrl: decoded.avatarUrl };
                console.log('[tryAttachUser] User attached:', req.user.id);
            }
        } catch (error) {
             console.log('[tryAttachUser] Token invalid/expired, proceeding without user.');
        }
    }
    next(); // Always proceed
};

module.exports = { protect, tryAttachUser };
