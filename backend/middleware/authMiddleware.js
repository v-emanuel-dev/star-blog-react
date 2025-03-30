const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const jwtSecret = process.env.JWT_SECRET;
            if (!jwtSecret) {
                console.error("CRITICAL ERROR: JWT_SECRET is not defined!");
                return res.status(500).json({ message: "Server configuration error." });
            }

            const decoded = jwt.verify(token, jwtSecret);

            req.user = {
                id: decoded.userId,
                email: decoded.email,
                name: decoded.name
            };

            next();

        } catch (error) {
            console.error('Token verification failed:', error.message);
            res.status(401).json({ message: 'Not authorized, token failed.' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token provided.' });
    }
};

module.exports = { protect };
