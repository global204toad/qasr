const express = require('express');
const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');
const { sanitizeInput } = require('../middleware/validation');
const { sendOrderConfirmationEmail } = require('../utils/emailService');
const { sendWhatsAppOrderNotificationWithRetry } = require('../utils/whatsappService');

const router = express.Router();

// @desc    Process checkout
// @route   POST /api/checkout
// @access  Private
router.post('/', [
  protect,
  sanitizeInput
], async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod = 'cash_on_delivery', notes } = req.body;

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required with street and city'
      });
    }

    // Get user's cart with product details
    const cart = await Cart.getCartWithProducts(req.user.id);
    
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
      if (!cartItem.product) {
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

      // Calculate item total - use cart item price if available (for weight options)
      const itemPrice = cartItem.price || cartItem.weightOption?.price || product.price;
      const itemTotal = itemPrice * cartItem.quantity;
      orderTotal += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: itemPrice,
        quantity: cartItem.quantity,
        total: itemTotal,
        image: product.images?.[0]?.url || '', // Ensure image is not null (required by schema)
        weightOption: cartItem.weightOption || null
      });
    }

    // Calculate shipping based on city
    // Cairo or Giza: 70, All other cities: 100
    let shippingCost = 100; // Default for other cities
    const city = req.body.shippingAddress?.city || '';
    const cityLower = city.toLowerCase().trim();
    if (cityLower === 'cairo' || cityLower === 'giza') {
      shippingCost = 70;
    }
    
    // Use shipping cost from request if provided, otherwise calculate
    if (req.body.shippingCost !== undefined) {
      shippingCost = req.body.shippingCost;
    }
    
    const finalTotal = orderTotal + shippingCost;

    // Create order - match Order schema requirements
    const order = new Order({
      user: req.user.id,
      items: orderItems.map(item => ({
        product: item.product,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image || '' // Ensure image is not null
      })),
      shippingAddress: {
        fullName: shippingAddress.fullName || `${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}`.trim() || req.user.name || 'Customer',
        address: shippingAddress.street || shippingAddress.address || '',
        city: shippingAddress.city || '',
        state: shippingAddress.state || shippingAddress.city || 'N/A', // State is required, use city if not provided
        zipCode: shippingAddress.zipCode || '00000', // ZipCode is required
        country: shippingAddress.country || 'Egypt',
        phone: shippingAddress.phone || req.user.phone || ''
      },
      paymentInfo: {
        method: paymentMethod || 'cash_on_delivery',
        status: 'pending'
      },
      pricing: {
        itemsPrice: orderTotal,
        taxPrice: 0, // No tax
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
    await Cart.clearUserCart(req.user.id);

    // Populate order details for response
    await order.populate('user', 'name email');

    // Send order confirmation email to customer
    const customerEmail = shippingAddress.email || req.user.email;
    const customerName = shippingAddress.fullName || `${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}`.trim() || req.user.name;
    
    // Send email asynchronously (don't wait for it)
    sendOrderConfirmationEmail(order, customerEmail, customerName).catch(err => {
      console.error('Failed to send order confirmation email:', err);
      // Don't fail the order if email fails
    });

    // Send WhatsApp notification to admin
    // Only send if payment method is cash_on_delivery or payment status is completed
    const shouldSendWhatsApp = 
      order.paymentInfo.method === 'cash_on_delivery' || 
      order.paymentInfo.status === 'completed';
    
    if (shouldSendWhatsApp) {
      // Send WhatsApp notification asynchronously (don't wait for it)
      sendWhatsAppOrderNotificationWithRetry(order, 1).catch(err => {
        console.error('Failed to send WhatsApp notification:', err);
        // Don't fail the order if WhatsApp notification fails
      });
    }

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
    
    // Handle specific errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    next(error);
  }
});

// @desc    Get checkout summary (cart totals, shipping, etc.)
// @route   GET /api/checkout/summary
// @access  Private
router.get('/summary', protect, async (req, res, next) => {
  try {
    const cart = await Cart.getCartWithProducts(req.user.id);
    
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          items: [],
          subtotal: 0,
          shippingCost: 0,
          total: 0,
          hasItems: false
        }
      });
    }

    // Filter valid items
    const validItems = cart.items.filter(item => item.product);
    const subtotal = validItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shippingCost = subtotal > 100 ? 0 : 10; // Free shipping over $100
    const total = subtotal + shippingCost;

    res.status(200).json({
      success: true,
      data: {
        items: validItems,
        subtotal,
        shippingCost,
        total,
        hasItems: validItems.length > 0,
        freeShippingThreshold: 100,
        freeShippingEligible: subtotal > 100
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
