const express = require('express');
const crypto = require('crypto');
const { body } = require('express-validator');
const User = require('../models/User');
const { protect, sendTokenResponse, logout } = require('../middleware/auth');
const { sendOTPEmail } = require('../utils/emailService');
const { handleValidationErrors, sanitizeInput } = require('../middleware/validation');

const router = express.Router();

// In-memory storage for OTP rate limiting (in production, use Redis)
const otpAttempts = new Map();
const otpCodes = new Map(); // Temporary storage for OTP codes

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS_PER_WINDOW = 3;
const OTP_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes

// Helper function to generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper function to hash OTP
const hashOTP = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

// Helper function to check rate limit
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

// @desc    Send OTP code to email
// @route   POST /api/auth/send-code
// @access  Public
router.post('/send-code', [
  sanitizeInput,
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  handleValidationErrors
], async (req, res, next) => {
  try {
    const { email } = req.body;

    // Check rate limit
    const rateLimit = checkRateLimit(email);
    if (!rateLimit.allowed) {
      return res.status(429).json({
        success: false,
        message: `Too many attempts. Please try again in ${Math.ceil(rateLimit.timeUntilReset / 60)} minutes.`,
        error: 'RATE_LIMIT_EXCEEDED',
        timeUntilReset: rateLimit.timeUntilReset
      });
    }

    // Check if user exists (to customize email message)
    const existingUser = await User.findOne({ email });
    const isNewUser = !existingUser;

    // Generate OTP
    const otp = generateOTP();
    const hashedOTP = hashOTP(otp);

    // Store OTP with expiry (in production, use Redis)
    otpCodes.set(email, {
      hashedOTP,
      expiresAt: Date.now() + OTP_EXPIRY_TIME,
      attempts: 0,
      isNewUser
    });

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
        email,
        expiresIn: 600, // 10 minutes in seconds
        remainingAttempts: rateLimit.remaining,
        isNewUser
      }
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    next(error);
  }
});

// @desc    Verify OTP code and login/create account
// @route   POST /api/auth/verify-code
// @access  Public
router.post('/verify-code', [
  sanitizeInput,
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('code')
    .isLength({ min: 6, max: 6 })
    .withMessage('Verification code must be 6 digits')
    .isNumeric()
    .withMessage('Verification code must be numeric'),
  handleValidationErrors
], async (req, res, next) => {
  try {
    const { email, code, name } = req.body;

    // Get stored OTP data
    const storedData = otpCodes.get(email);

    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: 'No verification code found. Please request a new code.',
        error: 'NO_CODE_FOUND'
      });
    }

    // Check if OTP has expired
    if (Date.now() > storedData.expiresAt) {
      otpCodes.delete(email);
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new code.',
        error: 'CODE_EXPIRED'
      });
    }

    // Check max verification attempts
    if (storedData.attempts >= 5) {
      otpCodes.delete(email);
      return res.status(429).json({
        success: false,
        message: 'Maximum verification attempts exceeded. Please request a new code.',
        error: 'MAX_ATTEMPTS_EXCEEDED'
      });
    }

    // Verify OTP
    const hashedInputOTP = hashOTP(code);
    if (hashedInputOTP !== storedData.hashedOTP) {
      // Increment attempts
      storedData.attempts += 1;
      otpCodes.set(email, storedData);

      return res.status(400).json({
        success: false,
        message: `Invalid verification code. ${5 - storedData.attempts} attempts remaining.`,
        error: 'INVALID_CODE',
        remainingAttempts: 5 - storedData.attempts
      });
    }

    // OTP is valid - clear the stored OTP
    otpCodes.delete(email);

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // User exists - log them in
      user.lastLogin = new Date();
      await user.save();

      // Send token response
      sendTokenResponse(user, 200, res, 'Login successful! Welcome back.');
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
        email,
        name: name.trim(),
        isVerified: true, // Email is verified through OTP
        lastLogin: new Date()
      });

      console.log('New user created via email OTP:', { id: user._id, email: user.email, name: user.name });

      // Send token response
      sendTokenResponse(user, 201, res, 'Account created successfully! Welcome to ALKASR.');
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
    
    next(error);
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', logout);

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', [
  protect,
  sanitizeInput,
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Name must be between 1 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  handleValidationErrors
], async (req, res, next) => {
  try {
    const fieldsToUpdate = {};
    const allowedFields = ['name', 'address'];
    
    // Only update allowed fields
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        fieldsToUpdate[field] = req.body[field];
      }
    });

    // Email update requires re-verification
    if (req.body.email && req.body.email !== req.user.email) {
      return res.status(400).json({
        success: false,
        message: 'Email changes require verification. Please contact support.',
        error: 'EMAIL_CHANGE_NOT_ALLOWED'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
