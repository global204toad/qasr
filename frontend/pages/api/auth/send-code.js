import crypto from 'crypto';
import connectToDatabase from '../../../lib/mongodb';
import User from '../../../models/User';
import OTP from '../../../models/OTP';
import { generateToken } from '../../../lib/auth';
import { sendOTPEmail } from '../../../lib/emailService';

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS_PER_WINDOW = 3;
const OTP_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes

// In-memory rate limiting (can be moved to database if needed)
const otpAttempts = new Map();

// Helper functions
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const hashOTP = (otp) => {
    return crypto.createHash('sha256').update(otp).digest('hex');
};

const checkRateLimit = (email) => {
    const now = Date.now();
    const attempts = otpAttempts.get(email) || { count: 0, firstAttempt: now };

    // Reset if window has passed
    if (now - attempts.firstAttempt > RATE_LIMIT_WINDOW) {
        otpAttempts.set(email, { count: 1, firstAttempt: now });
        return { allowed: true, remaining: MAX_ATTEMPTS_PER_WINDOW - 1 };
    }

    // Check if limit exceeded
    if (attempts.count >= MAX_ATTEMPTS_PER_WINDOW) {
        const timeUntilReset = RATE_LIMIT_WINDOW - (now - attempts.firstAttempt);
        return {
            allowed: false,
            remaining: 0,
            timeUntilReset: Math.ceil(timeUntilReset / 1000) // seconds
        };
    }

    // Increment attempts
    otpAttempts.set(email, { ...attempts, count: attempts.count + 1 });
    return { allowed: true, remaining: MAX_ATTEMPTS_PER_WINDOW - attempts.count - 1 };
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email } = req.body;

        // Validate email
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address',
                error: 'INVALID_EMAIL'
            });
        }

        // Check rate limit
        const rateLimit = checkRateLimit(email.toLowerCase());
        if (!rateLimit.allowed) {
            return res.status(429).json({
                success: false,
                message: `Too many attempts. Please try again in ${Math.ceil(rateLimit.timeUntilReset / 60)} minutes.`,
                error: 'RATE_LIMIT_EXCEEDED',
                timeUntilReset: rateLimit.timeUntilReset
            });
        }

        // Connect to database
        await connectToDatabase();

        // Check if user exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        const isNewUser = !existingUser;

        // Generate OTP
        const otp = generateOTP();
        const hashedOTP = hashOTP(otp);

        // Store OTP in database with expiry
        await OTP.createOTP(
            email.toLowerCase(),
            hashedOTP,
            new Date(Date.now() + OTP_EXPIRY_TIME),
            isNewUser
        );

        // Send OTP via email
        const emailResult = await sendOTPEmail(email, otp, isNewUser);

        if (!emailResult.success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to send verification code. Please try again later.',
                error: 'EMAIL_SEND_FAILED'
            });
        }

        // Return success
        res.status(200).json({
            success: true,
            message: 'Verification code sent to your email.',
            data: {
                email: email.toLowerCase(),
                expiresIn: 600, // 10 minutes in seconds
                remainingAttempts: rateLimit.remaining,
                isNewUser
            }
        });

    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

// Export the maps for use in verify-code
export { otpCodes, otpAttempts };
