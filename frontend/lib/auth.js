import jwt from 'jsonwebtoken';
import connectToDatabase from './mongodb';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('Please define JWT_SECRET environment variable');
}

/**
 * Verify JWT token and return decoded payload
 */
export async function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
}

/**
 * Generate JWT token
 */
export function generateToken(payload, expiresIn = '7d') {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Extract token from request headers
 */
export function getTokenFromRequest(req) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return null;
    }

    // Support both "Bearer token" and "token" formats
    if (authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }

    return authHeader;
}

/**
 * Get user from token in request
 */
export async function getUserFromRequest(req) {
    const token = getTokenFromRequest(req);

    if (!token) {
        throw new Error('No authentication token provided');
    }

    const decoded = await verifyToken(token);

    // Connect to database
    await connectToDatabase();

    // Import User model dynamically to avoid circular dependencies
    const User = (await import('../models/User')).default;

    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
        throw new Error('User not found');
    }

    return user;
}

/**
 * Higher-order function to protect API routes with authentication
 * Usage: export default withAuth(handler);
 */
export function withAuth(handler) {
    return async (req, res) => {
        try {
            // Get and verify user
            req.user = await getUserFromRequest(req);

            // Call the actual handler
            return await handler(req, res);
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: error.message || 'Authentication required'
            });
        }
    };
}

/**
 * Higher-order function to protect API routes with admin authentication
 */
export function withAdminAuth(handler) {
    return async (req, res) => {
        try {
            // Get and verify user
            req.user = await getUserFromRequest(req);

            // Check if user is admin
            if (!req.user.isAdmin) {
                return res.status(403).json({
                    success: false,
                    message: 'Admin access required'
                });
            }

            // Call the actual handler
            return await handler(req, res);
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: error.message || 'Authentication required'
            });
        }
    };
}

export default {
    verifyToken,
    generateToken,
    getTokenFromRequest,
    getUserFromRequest,
    withAuth,
    withAdminAuth
};
