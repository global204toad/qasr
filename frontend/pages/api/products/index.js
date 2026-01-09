import connectToDatabase from '../../../lib/mongodb';
import Product from '../../../models/Product';
import Category from '../../../models/Category';

export default async function handler(req, res) {
    await connectToDatabase();

    switch (req.method) {
        case 'GET':
            return getProducts(req, res);
        default:
            return res.status(405).json({ error: 'Method not allowed' });
    }
}

async function getProducts(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        // Build filter object
        const filter = { isActive: true };

        // Search by text
        if (req.query.q) {
            filter.$text = { $search: req.query.q };
        }

        // Filter by category
        if (req.query.category) {
            let category = await Category.findOne({
                $or: [
                    { name: req.query.category },
                    { slug: req.query.category }
                ],
                isActive: true
            });

            if (!category && req.query.category.match(/^[0-9a-fA-F]{24}$/)) {
                category = await Category.findOne({
                    _id: req.query.category,
                    isActive: true
                });
            }

            if (category) {
                filter.category = category._id;
            }
        }

        // Filter by price range
        if (req.query.minPrice || req.query.maxPrice) {
            filter.price = {};
            if (req.query.minPrice) {
                filter.price.$gte = parseFloat(req.query.minPrice);
            }
            if (req.query.maxPrice) {
                filter.price.$lte = parseFloat(req.query.maxPrice);
            }
        }

        // Filter by featured
        if (req.query.featured === 'true') {
            filter.isFeatured = true;
        }

        // Build sort object
        let sort = {};

        switch (req.query.sort) {
            case 'price_asc':
                sort = { price: 1 };
                break;
            case 'price_desc':
                sort = { price: -1 };
                break;
            case 'name_asc':
                sort = { name: 1 };
                break;
            case 'name_desc':
                sort = { name: -1 };
                break;
            case 'rating':
                sort = { 'rating.average': -1 };
                break;
            case 'newest':
                sort = { createdAt: -1 };
                break;
            case 'oldest':
                sort = { createdAt: 1 };
                break;
            default:
                sort = req.query.q ? { score: { $meta: 'textScore' } } : { createdAt: -1 };
        }

        // Execute query with Nuts category priority
        let products;

        if (!req.query.category && !req.query.q) {
            const nutsCategory = await Category.findOne({
                name: 'Nuts',
                isActive: true
            });

            if (nutsCategory) {
                const nutsFilter = { ...filter, category: nutsCategory._id };
                const nutsProducts = await Product.find(nutsFilter)
                    .sort(sort)
                    .populate('category', 'name slug')
                    .populate('subcategory', 'name slug')
                    .lean();

                const nonNutsFilter = { ...filter, category: { $ne: nutsCategory._id } };
                const nonNutsProducts = await Product.find(nonNutsFilter)
                    .sort(sort)
                    .populate('category', 'name slug')
                    .populate('subcategory', 'name slug')
                    .lean();

                const allProducts = [...nutsProducts, ...nonNutsProducts];
                products = allProducts.slice(skip, skip + limit);
            } else {
                products = await Product.find(filter)
                    .sort(sort)
                    .skip(skip)
                    .limit(limit)
                    .populate('category', 'name slug')
                    .populate('subcategory', 'name slug')
                    .lean();
            }
        } else {
            products = await Product.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate('category', 'name slug')
                .populate('subcategory', 'name slug')
                .lean();
        }

        const total = await Product.countDocuments(filter);
        const totalPages = Math.ceil(total / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        res.status(200).json({
            success: true,
            data: products,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage,
                hasPrevPage
            }
        });
    } catch (error) {
        console.error('Products route error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products',
            error: error.message
        });
    }
}
