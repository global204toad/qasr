import connectToDatabase from '../../../lib/mongodb';
import Product from '../../../models/Product';

export default async function handler(req, res) {
    const { id } = req.query;

    await connectToDatabase();

    switch (req.method) {
        case 'GET':
            return getProduct(req, res, id);
        default:
            return res.status(405).json({ error: 'Method not allowed' });
    }
}

async function getProduct(req, res, id) {
    try {
        const product = await Product.findOne({
            _id: id,
            isActive: true
        })
            .populate('category', 'name slug description')
            .populate('subcategory', 'name slug description');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Single product route error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch product',
            error: error.message
        });
    }
}
