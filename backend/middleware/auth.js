const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'your_jwt_secret_change_in_production';

// Verify JWT token
function verifyToken(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'No authorization header provided' });
        }
        
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        
        jwt.verify(token, SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid or expired token' });
            }
            req.user = user;
            next();
        });
    } catch (error) {
        return res.status(500).json({ message: 'Authentication error', error: error.message });
    }
}

// Verify user role
function verifyRole(role) {
    return (req, res, next) => {
        if (!req.user || req.user.role !== role) {
            return res.status(403).json({ message: 'Access denied - insufficient permissions' });
        }
        next();
    };
}

module.exports = { verifyToken, verifyRole, SECRET };
