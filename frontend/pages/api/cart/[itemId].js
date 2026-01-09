import { withAuth } from '../../../lib/auth';
import connectToDatabase from '../../../lib/mongodb';
import Cart from '../../../models/Cart';
import Product from '../../../models/Product';

async function handler(req, res) {
    const { itemId } = req.query;

    await connectToDatabase();

    switch (req.method) {
        case 'PUT':
            return updateCartItem(req, res, itemId);
        case 'DELETE':
            return removeCartItem(req, res, itemId);
        default:
            return res.status(405).json({ error: 'Method not allowed' });
    }
}

// Update item quantity in cart
async function updateCartItem(req, res, productId) {
    try {
        const { quantity } = req.body;

        if (typeof quantity !== 'number' || quantity < 0) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be a non-negative number'
            });
        }

        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        // Find the item in cart
        const itemIndex = cart.items.findIndex(
            item => item.product.toString() === productId.toString()
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            });
        }

        // If quantity is 0, remove item
        if (quantity === 0) {
            cart.items.splice(itemIndex, 1);
        } else {
            // Check product inventory if updating to a higher quantity
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

            if (product.inventory?.trackQuantity && product.inventory.quantity < quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${product.inventory.quantity} items available in stock`
                });
            }

            cart.items[itemIndex].quantity = quantity;
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
            message: 'Cart updated successfully',
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
        console.error('Update cart item error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update cart item',
            error: error.message
        });
    }
}

// Remove item from cart
async function removeCartItem(req, res, productId) {
    try {
        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        // Remove the item
        cart.items = cart.items.filter(
            item => item.product.toString() !== productId.toString()
        );

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
            message: 'Item removed from cart successfully',
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
        console.error('Remove cart item error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove item from cart',
            error: error.message
        });
    }
}

export default withAuth(handler);
