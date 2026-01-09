import { withAuth } from '../../../lib/auth';
import connectToDatabase from '../../../lib/mongodb';
import Order from '../../../models/Order';

async function handler(req, res) {
    await connectToDatabase();

    switch (req.method) {
        case 'GET':
            return getOrders(req, res);
        case 'POST':
            return createOrder(req, res);
        default:
            return res.status(405).json({ error: 'Method not allowed' });
    }
}

// Get user's orders
async function getOrders(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build filter
        const filter = { user: req.user._id };

        // Filter by status
        if (req.query.status) {
            filter.status = req.query.status;
        }

        const orders = await Order.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('items.product', 'name images')
            .lean();

        const total = await Order.countDocuments(filter);
        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            success: true,
            data: orders,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders',
            error: error.message
        });
    }
}

// Create order (alternative to checkout endpoint)
async function createOrder(req, res) {
    try {
        // This is handled by checkout endpoint
        // Redirect to checkout
        return res.status(400).json({
            success: false,
            message: 'Please use /api/checkout endpoint to create orders'
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create order',
            error: error.message
        });
    }
}

export default withAuth(handler);
