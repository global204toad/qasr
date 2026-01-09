import connectToDatabase from '../../../lib/mongodb';
import Category from '../../../models/Category';
import Product from '../../../models/Product';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        await connectToDatabase();

        // Get all active categories
        const categories = await Category.find({
            isActive: true
        })
            .sort({ sortOrder: 1, name: 1 })
            .populate('parent', 'name slug')
            .lean();

        // Get product counts for each category
        const categoriesWithCounts = await Promise.all(
            categories.map(async (category) => {
                const count = await Product.countDocuments({
                    category: category._id,
                    isActive: true
                });

                return {
                    _id: category._id,
                    name: category.name,
                    slug: category.slug,
                    description: category.description,
                    count: count,
                    sortOrder: category.sortOrder,
                    parent: category.parent ? {
                        _id: category.parent._id,
                        name: category.parent.name,
                        slug: category.parent.slug
                    } : null
                };
            })
        );

        // Sort by sortOrder first, then by count descending
        categoriesWithCounts.sort((a, b) => {
            if (a.sortOrder !== b.sortOrder) {
                return a.sortOrder - b.sortOrder;
            }
            return b.count - a.count;
        });

        res.status(200).json({
            success: true,
            data: categoriesWithCounts
        });
    } catch (error) {
        console.error('Categories route error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch categories',
            error: error.message
        });
    }
}
