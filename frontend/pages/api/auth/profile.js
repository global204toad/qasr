import { withAuth } from '../../../lib/auth';
import connectToDatabase from '../../../lib/mongodb';
import User from '../../../models/User';

async function handler(req, res) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        await connectToDatabase();

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

        // Validate name if provided
        if (fieldsToUpdate.name && (fieldsToUpdate.name.trim().length < 1 || fieldsToUpdate.name.trim().length > 50)) {
            return res.status(400).json({
                success: false,
                message: 'Name must be between 1 and 50 characters'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            fieldsToUpdate,
            {
                new: true,
                runValidators: true
            }
        ).select('-password');

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: user
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

export default withAuth(handler);
