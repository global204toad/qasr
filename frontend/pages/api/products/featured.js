import connectToDatabase from '../../../lib/mongodb';
import Product from '../../../models/Product';
import Category from '../../../models/Category'; // Import to register schema

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        await connectToDatabase();

        const limit = parseInt(req.query.limit) || 4;

        // Define the specific products to feature
        const featuredProductNames = [
            "A Camel's Eye",
            "Mix Nuts Power",
            "Cashew",
            "Hazelnut"
        ];

        // Get the specific featured products
        const products = await Product.find({
            isActive: true,
            name: { $in: featuredProductNames }
        })
            .populate('category', 'name slug')
            .populate('subcategory', 'name slug')
            .lean();

        // Sort products in the specified order
        const sortedProducts = featuredProductNames.map(name =>
            products.find(p => p.name === name)
        ).filter(Boolean);

        res.status(200).json({
            success: true,
            data: sortedProducts.slice(0, limit)
        });
    } catch (error) {
        console.error('Featured products route error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch featured products',
            error: error.message
        });
    }
}
