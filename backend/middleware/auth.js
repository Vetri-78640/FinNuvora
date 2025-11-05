// JWT verification middleware
// This middleware checks if user has a valid token

const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({
        success: false,
        error: 'No token provided. Please login first.'
        });
    }
    try {
    // Verify token with JWT_SECRET
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        req.email = decoded.email;
        next();
    } catch (err) {
        return res.status(403).json({
        success: false,
        error: 'Invalid or expired token'
        });
    }
};

module.exports = authMiddleware;
