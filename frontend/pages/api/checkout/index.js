import { withAuth } from '../../../lib/auth';
import connectToDatabase from '../../../lib/mongodb';
import Cart from '../../../models/Cart';
import Product from '../../../models/Product';
import Order from '../../../models/Order';
import { sendOrderConfirmationEmail } from '../../../lib/emailService';

async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        await connectToDatabase();

        const { shippingAddress, paymentMethod = 'cash_on_delivery', notes, shippingCost: providedShippingCost } = req.body;

        // Validate shipping address
        if (!shippingAddress || !shippingAddress.street || !shippingAddress.city) {
            return res.status(400).json({
                success: false,
                message: 'Shipping address is required with street and city'
            });
        }

        // Get user's cart with product details
        const cart = await Cart.findOne({ user: req.user._id })
            .populate({
                path: 'items.product',
                select: 'name price images isActive inventory weightOptions'
            });

        if (!cart || !cart.items || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            });
        }

        // Validate cart items and check inventory
        const orderItems = [];
        let orderTotal = 0;

        for (const cartItem of cart.items) {
            if (!cartItem.product || !cartItem.product.isActive) {
                return res.status(400).json({
                    success: false,
                    message: 'Some products in your cart are no longer available'
                });
            }

            const product = await Product.findById(cartItem.product._id);

            if (!product || !product.isActive) {
                return res.status(400).json({
                    success: false,
                    message: `Product "${cartItem.product.name}" is no longer available`
                });
            }

            // Check inventory
            if (product.inventory?.trackQuantity) {
                if (product.inventory.quantity < cartItem.quantity) {
                    return res.status(400).json({
                        success: false,
                        message: `Insufficient stock for "${product.name}". Only ${product.inventory.quantity} available.`
                    });
                }

                // Update product inventory
                product.inventory.quantity -= cartItem.quantity;
                await product.save();
            }

            // Calculate item total
            const itemPrice = cartItem.price || cartItem.weightOption?.price || product.price;
            const itemTotal = itemPrice * cartItem.quantity;
            orderTotal += itemTotal;

            orderItems.push({
                product: product._id,
                name: product.name,
                price: itemPrice,
                quantity: cartItem.quantity,
                total: itemTotal,
                image: product.images?.[0]?.url || '',
                weightOption: cartItem.weightOption || null
            });
        }

        // Calculate shipping based on city
        let shippingCost = 100; // Default for other cities
        const city = shippingAddress.city || '';
        const cityLower = city.toLowerCase().trim();
        if (cityLower === 'cairo' || cityLower === 'giza') {
            shippingCost = 70;
        }

        // Use provided shipping cost if available
        if (providedShippingCost !== undefined) {
            shippingCost = providedShippingCost;
        }

        const finalTotal = orderTotal + shippingCost;

        // Create order
        const order = new Order({
            user: req.user._id,
            items: orderItems.map(item => ({
                product: item.product,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image || ''
            })),
            shippingAddress: {
                fullName: shippingAddress.fullName || `${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}`.trim() || req.user.name || 'Customer',
                address: shippingAddress.street || shippingAddress.address || '',
                city: shippingAddress.city || '',
                state: shippingAddress.state || shippingAddress.city || 'N/A',
                zipCode: shippingAddress.zipCode || '00000',
                country: shippingAddress.country || 'Egypt',
                phone: shippingAddress.phone || req.user.phone || ''
            },
            paymentInfo: {
                method: paymentMethod || 'cash_on_delivery',
                status: 'pending'
            },
            pricing: {
                itemsPrice: orderTotal,
                taxPrice: 0,
                shippingPrice: shippingCost,
                totalPrice: finalTotal
            },
            status: 'pending',
            notes: {
                customer: notes || ''
            },
            orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        });

        await order.save();

        // Clear user's cart
        await Cart.findOneAndDelete({ user: req.user._id });

        // Populate order details for response
        await order.populate('user', 'name email');

        // Send order confirmation email asynchronously
        const customerEmail = shippingAddress.email || req.user.email;
        const customerName = shippingAddress.fullName || `${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}`.trim() || req.user.name;

        sendOrderConfirmationEmail(order, customerEmail, customerName).catch(err => {
            console.error('Failed to send order confirmation email:', err);
        });

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            data: {
                order: {
                    _id: order._id,
                    orderNumber: order.orderNumber,
                    total: order.pricing.totalPrice,
                    subtotal: order.pricing.itemsPrice,
                    shippingCost: order.pricing.shippingPrice,
                    orderStatus: order.status,
                    paymentStatus: order.paymentInfo.status,
                    paymentMethod: order.paymentInfo.method,
                    createdAt: order.createdAt,
                    items: order.items,
                    shippingAddress: order.shippingAddress
                }
            }
        });

    } catch (error) {
        console.error('Checkout error:', error);

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to process checkout',
            error: error.message
        });
    }
}

export default withAuth(handler);
