import { verifyToken } from '../../../lib/auth';
import connectToDatabase from '../../../lib/mongodb';
import Cart from '../../../models/Cart';
import Product from '../../../models/Product';
import Order from '../../../models/Order';
import { sendOrderConfirmationEmail } from '../../../lib/emailService';

// Helper to get user from request (optional authentication)
const getUserFromRequest = async (req) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }
        const token = authHeader.split(' ')[1];
        const decoded = await verifyToken(token);

        return {
            userId: decoded.userId,
            email: decoded.email
        };
    } catch (error) {
        console.error('Auth error in checkout API:', error.message);
        return null;
    }
};

async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log('=== CHECKOUT API DEBUG ===');
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        console.log('Headers:', req.headers.authorization ? 'Token present' : 'No token');

        await connectToDatabase();
        console.log('✅ Database connected');

        const { shippingAddress, paymentMethod = 'cash_on_delivery', notes, shippingCost: providedShippingCost, cartItems } = req.body;

        console.log('Shipping address:', shippingAddress);
        console.log('Cart items from body:', cartItems);

        // Validate shipping address
        if (!shippingAddress || !shippingAddress.street || !shippingAddress.city) {
            return res.status(400).json({
                success: false,
                message: 'Shipping address is required with street and city'
            });
        }

        let orderItems = [];
        let orderTotal = 0;

        // Try to get authenticated user
        let user = null;
        try {
            user = await getUserFromRequest(req);
        } catch (authError) {
            console.error('Auth error in checkout:', authError.message);
            user = null;
        }

        // Try to get cart from database first (for authenticated users)
        let cart = null;
        if (user && user.userId) {
            cart = await Cart.findOne({ user: user.userId })
                .populate({
                    path: 'items.product',
                    select: 'name price images isActive inventory weightOptions'
                });
        }

        // If cart exists in database and has items, use it
        if (cart && cart.items && cart.items.length > 0) {
            // Validate cart items and check inventory
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
        }
        // If no cart in database, check if cart items were provided in request (for localStorage cart)
        else if (cartItems && Array.isArray(cartItems) && cartItems.length > 0) {
            console.log('Using cart items from request body (localStorage cart)');

            for (const item of cartItems) {
                const product = await Product.findById(item.product._id || item.product);

                if (!product || !product.isActive) {
                    return res.status(400).json({
                        success: false,
                        message: `Product "${item.name || 'Unknown'}" is no longer available`
                    });
                }

                // Check inventory
                if (product.inventory?.trackQuantity) {
                    if (product.inventory.quantity < item.quantity) {
                        return res.status(400).json({
                            success: false,
                            message: `Insufficient stock for "${product.name}". Only ${product.inventory.quantity} available.`
                        });
                    }

                    // Update product inventory
                    product.inventory.quantity -= item.quantity;
                    await product.save();
                }

                const itemPrice = item.price || item.weightOption?.price || product.price;
                const itemTotal = itemPrice * item.quantity;
                orderTotal += itemTotal;

                orderItems.push({
                    product: product._id,
                    name: product.name,
                    price: itemPrice,
                    quantity: item.quantity,
                    total: itemTotal,
                    image: product.images?.[0]?.url || '',
                    weightOption: item.weightOption || null
                });
            }
        }
        // No cart found anywhere
        else {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
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

export default handler;
