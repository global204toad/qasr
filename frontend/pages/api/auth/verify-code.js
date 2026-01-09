import crypto from 'crypto';
import connectToDatabase from '../../../lib/mongodb';
import User from '../../../models/User';
import OTP from '../../../models/OTP';
import { generateToken } from '../../../lib/auth';
const hashOTP = (otp) => {
    return crypto.createHash('sha256').update(otp).digest('hex');
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, code, name } = req.body;

        // Validate inputs
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address',
                error: 'INVALID_EMAIL'
            });
        }

        if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
            return res.status(400).json({
                success: false,
                message: 'Verification code must be 6 digits',
                error: 'INVALID_CODE_FORMAT'
            });
        }

        const normalizedEmail = email.toLowerCase();

        // Connect to database
        await connectToDatabase();

        // Get stored OTP data from database
        const storedData = await OTP.getOTP(normalizedEmail);

        if (!storedData) {
            return res.status(400).json({
                success: false,
                message: 'No verification code found. Please request a new code.',
                error: 'NO_CODE_FOUND'
            });
        }

        // Check if OTP has expired (redundant with TTL but good for immediate feedback)
        if (Date.now() > storedData.expiresAt.getTime()) {
            await OTP.deleteOTP(normalizedEmail);
            return res.status(400).json({
                success: false,
                message: 'Verification code has expired. Please request a new code.',
                error: 'CODE_EXPIRED'
            });
        }

        // Check max verification attempts
        if (storedData.attempts >= 5) {
            await OTP.deleteOTP(normalizedEmail);
            return res.status(400).json({
                success: false,
                message: 'Maximum verification attempts exceeded. Please request a new code.',
                error: 'MAX_ATTEMPTS_EXCEEDED'
            });
        }

        // Verify OTP
        const hashedInputOTP = hashOTP(code);
        if (hashedInputOTP !== storedData.hashedOTP) {
            // Increment attempts in database
            await OTP.incrementAttempts(normalizedEmail);

            return res.status(400).json({
                success: false,
                message: `Invalid verification code. ${5 - (storedData.attempts + 1)} attempts remaining.`,
                error: 'INVALID_CODE',
                remainingAttempts: 5 - (storedData.attempts + 1)
            });
        }

        // OTP is valid - clear the stored OTP from database
        await OTP.deleteOTP(normalizedEmail);

        // Connect to database
        await connectToDatabase();

        // Check if user exists
        let user = await User.findOne({ email: normalizedEmail });

        if (user) {
            // User exists - log them in
            user.lastLogin = new Date();
            await user.save();

            // Generate token
            const token = generateToken({ userId: user._id });

            // Return success with user data
            return res.status(200).json({
                success: true,
                message: 'Login successful! Welcome back.',
                token,
                data: {
                    user: {
                        _id: user._id,
                        email: user.email,
                        name: user.name,
                        isAdmin: user.isAdmin || false,
                        isVerified: user.isVerified
                    }
                }
            });
        } else {
            // New user - create account
            if (!name || name.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Name is required for new accounts.',
                    error: 'NAME_REQUIRED',
                    isNewUser: true
                });
            }

            // Create new user
            user = await User.create({
                email: normalizedEmail,
                name: name.trim(),
                isVerified: true, // Email is verified through OTP
                lastLogin: new Date()
            });

            console.log('New user created via email OTP:', {
                id: user._id,
                email: user.email,
                name: user.name
            });

            // Generate token
            const token = generateToken({ userId: user._id });

            // Return success with user data
            return res.status(201).json({
                success: true,
                message: 'Account created successfully! Welcome to ALKASR.',
                token,
                data: {
                    user: {
                        _id: user._id,
                        email: user.email,
                        name: user.name,
                        isAdmin: user.isAdmin || false,
                        isVerified: user.isVerified
                    }
                }
            });
        }

    } catch (error) {
        console.error('Verify OTP error:', error);

        // Handle duplicate key error (race condition)
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'An account with this email already exists.',
                error: 'USER_EXISTS'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}
