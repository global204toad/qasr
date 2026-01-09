const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        index: true
    },
    hashedOTP: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // TTL index - MongoDB will auto-delete expired documents
    },
    attempts: {
        type: Number,
        default: 0
    },
    isNewUser: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster email lookups
otpSchema.index({ email: 1 });

// Static method to create or update OTP
otpSchema.statics.createOTP = async function (email, hashedOTP, expiresAt, isNewUser = false) {
    return this.findOneAndUpdate(
        { email },
        {
            hashedOTP,
            expiresAt,
            attempts: 0,
            isNewUser,
            createdAt: new Date()
        },
        { upsert: true, new: true }
    );
};

// Static method to get OTP
otpSchema.statics.getOTP = async function (email) {
    return this.findOne({ email, expiresAt: { $gt: new Date() } });
};

// Static method to increment attempts
otpSchema.statics.incrementAttempts = async function (email) {
    return this.findOneAndUpdate(
        { email },
        { $inc: { attempts: 1 } },
        { new: true }
    );
};

// Static method to delete OTP
otpSchema.statics.deleteOTP = async function (email) {
    return this.deleteOne({ email });
};

module.exports = mongoose.models.OTP || mongoose.model('OTP', otpSchema);
