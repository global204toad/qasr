import connectToDatabase from '../../../lib/mongodb';
import Cart from '../../../models/Cart';
import Product from '../../../models/Product';
import { verifyToken } from '../../../lib/auth';

// Helper to get user from request (optional authentication)
const getUserFromRequest = async (req) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }
        const token = authHeader.split(' ')[1];
        const decoded = await verifyToken(token);

        // Return an object with userId for consistency
        return {
            userId: decoded.userId,
            email: decoded.email
        };
    } catch (error) {
        console.error('Auth error in cart API:', error.message);
        return null;
    }
};

async function handler(req, res) {
    // Always connect to database first
    await connectToDatabase();

    switch (req.method) {
        case 'GET':
            return getCart(req, res);
        case 'POST':
            return addToCart(req, res);
        case 'DELETE':
            return clearCart(req, res);
        default:
            return res.status(405).json({ error: 'Method not allowed' });
    }
}

// Get user's cart
async function getCart(req, res) {
    try {
        let user = null;

        // Try to get user, but don't fail if authentication fails
        try {
            user = await getUserFromRequest(req);
        } catch (authError) {
            console.error('Auth error in getCart:', authError.message);
            user = null;
        }

        // If no user, return empty cart (guest user)
        if (!user || !user.userId) {
            return res.status(200).json({
                success: true,
                data: {
                    items: [],
                    totalAmount: 0,
                    totalItems: 0
                },
                message: 'Guest cart - items stored in localStorage'
            });
        }

        const cart = await Cart.findOne({ user: user.userId })
            .populate({
                path: 'items.product',
                select: 'name price images isActive inventory weightOptions'
            });

        if (!cart) {
            return res.status(200).json({
                success: true,
                data: {
                    user: user.userId,
                    items: [],
                    totalAmount: 0,
                    totalItems: 0
                }
            });
        }

        // Filter out items with invalid products
        const validItems = cart.items.filter(item => item.product && item.product.isActive);

        if (validItems.length !== cart.items.length) {
            cart.items = validItems;
            await cart.save();
        }

        // Calculate totals
        const totalAmount = validItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const totalItems = validItems.reduce((sum, item) => sum + item.quantity, 0);

        res.status(200).json({
            success: true,
            data: {
                _id: cart._id,
                user: cart.user,
                items: validItems,
                totalAmount,
                totalItems,
                updatedAt: cart.updatedAt
            }
        });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch cart',
            error: error.message
        });
    }
}

// Add item to cart
async function addToCart(req, res) {
    try {
        const { productId, quantity = 1, weightOption } = req.body;

        let user = null;

        // Try to get user, but don't fail if authentication fails
        try {
            user = await getUserFromRequest(req);
        } catch (authError) {
            console.error('Auth error in addToCart:', authError.message);
            user = null;
        }

        // If no user (guest), return success - cart will be managed in localStorage
        if (!user || !user.userId) {
            // Still validate the product exists
            const product = await Product.findOne({
                _id: productId,
                isActive: true
            });

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found or inactive'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Item added to cart (localStorage)',
                data: {
                    items: [], // Guest cart managed in frontend
                    totalAmount: 0,
                    totalItems: 0
                }
            });
        }

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required'
            });
        }

        if (quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be at least 1'
            });
        }

        // Check if product exists and is active
        const product = await Product.findOne({
            _id: productId,
            isActive: true
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found or inactive'
            });
        }

        // Validate weight option if provided
        let selectedWeightOption = null;
        if (weightOption) {
            if (!product.weightOptions || product.weightOptions.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'This product does not have weight options'
                });
            }

            selectedWeightOption = product.weightOptions.find(
                opt => opt.grams === weightOption.grams || opt.label === weightOption.label
            );

            if (!selectedWeightOption) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid weight option selected'
                });
            }
        }

        // Use weight option price if provided, otherwise use product base price
        const itemPrice = selectedWeightOption?.price || product.price;

        // Check inventory
        if (product.inventory?.trackQuantity) {
            if (product.inventory.quantity < quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${product.inventory.quantity} items available in stock`
                });
            }
        }

        // Find or create user's cart
        let cart = await Cart.findOne({ user: user.userId });

        if (!cart) {
            cart = new Cart({
                user: user.userId,
                items: []
            });
        }

        // Check if item already exists in cart
        const existingItemIndex = cart.items.findIndex(item => {
            const sameProduct = item.product.toString() === productId.toString();
            if (selectedWeightOption) {
                const sameWeight = item.weightOption &&
                    item.weightOption.grams === selectedWeightOption.grams;
                return sameProduct && sameWeight;
            }
            return sameProduct && !item.weightOption;
        });

        if (existingItemIndex > -1) {
            // Update existing item
            const newQuantity = cart.items[existingItemIndex].quantity + quantity;

            // Check inventory for new total
            if (product.inventory?.trackQuantity && product.inventory.quantity < newQuantity) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot add ${quantity} items. Only ${product.inventory.quantity - cart.items[existingItemIndex].quantity} more available.`
                });
            }

            cart.items[existingItemIndex].quantity = newQuantity;
            cart.items[existingItemIndex].price = itemPrice;
        } else {
            // Add new item
            cart.items.push({
                product: productId,
                quantity,
                price: itemPrice,
                weightOption: selectedWeightOption
            });
        }

        await cart.save();

        // Get updated cart with product details
        const updatedCart = await Cart.findById(cart._id)
            .populate({
                path: 'items.product',
                select: 'name price images isActive inventory weightOptions'
            });

        const totalAmount = updatedCart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const totalItems = updatedCart.items.reduce((sum, item) => sum + item.quantity, 0);

        res.status(200).json({
            success: true,
            message: 'Item added to cart successfully',
            data: {
                _id: updatedCart._id,
                user: updatedCart.user,
                items: updatedCart.items,
                totalAmount,
                totalItems,
                updatedAt: updatedCart.updatedAt
            }
        });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add item to cart',
            error: error.message
        });
    }
}

// Clear entire cart
async function clearCart(req, res) {
    try {
        const user = await getUserFromRequest(req);

        // If no user (guest), return success
        if (!user || !user.userId) {
            return res.status(200).json({
                success: true,
                message: 'Cart cleared (localStorage)',
                data: {
                    items: [],
                    totalAmount: 0,
                    totalItems: 0
                }
            });
        }

        await Cart.findOneAndDelete({ user: user.userId });

        res.status(200).json({
            success: true,
            message: 'Cart cleared successfully',
            data: {
                user: req.user._id,
                items: [],
                totalAmount: 0,
                totalItems: 0
            }
        });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to clear cart',
            error: error.message
        });
    }
}

// Export without auth requirement - cart should work for both authenticated and guest users
export default handler;
