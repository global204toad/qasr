const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');
const { validateObjectId, handleValidationErrors, sanitizeInput } = require('../middleware/validation');

const router = express.Router();

// @desc    Create payment intent
// @route   POST /api/payment/create-intent
// @access  Private
router.post('/create-intent', [
  protect,
  sanitizeInput
], async (req, res, next) => {
  try {
    const { items, shippingAddress, billingAddress } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items are required'
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required'
      });
    }

    // Validate and calculate total
    let itemsPrice = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product || !product.isActive) {
        return res.status(404).json({
          success: false,
          message: `Product not found or unavailable`
        });
      }

      if (!product.isInStock(item.quantity)) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`
        });
      }

      validatedItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images[0]?.url || ''
      });

      itemsPrice += product.price * item.quantity;
    }

    // Calculate pricing
    const taxRate = 0.08; // 8% tax
    const taxPrice = Math.round(itemsPrice * taxRate * 100) / 100;
    const shippingPrice = itemsPrice >= 100 ? 0 : 10; // Free shipping over $100
    const totalPrice = itemsPrice + taxPrice + shippingPrice;

    // Convert to cents for Stripe
    const amountInCents = Math.round(totalPrice * 100);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: {
        userId: req.user.id,
        itemsPrice: itemsPrice.toString(),
        taxPrice: taxPrice.toString(),
        shippingPrice: shippingPrice.toString(),
        totalPrice: totalPrice.toString(),
        itemCount: validatedItems.length.toString()
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: totalPrice,
        breakdown: {
          itemsPrice: Math.round(itemsPrice * 100) / 100,
          taxPrice,
          shippingPrice,
          totalPrice: Math.round(totalPrice * 100) / 100
        }
      }
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    next(error);
  }
});

// @desc    Confirm payment and create order
// @route   POST /api/payment/confirm
// @access  Private
router.post('/confirm', [
  protect,
  sanitizeInput
], async (req, res, next) => {
  try {
    const { 
      paymentIntentId, 
      items, 
      shippingAddress, 
      billingAddress,
      notes 
    } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment intent ID is required'
      });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: 'Payment has not been completed'
      });
    }

    // Verify the payment belongs to the current user
    if (paymentIntent.metadata.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    // Check if order already exists for this payment intent
    const existingOrder = await Order.findOne({ 
      'paymentInfo.stripePaymentIntentId': paymentIntentId 
    });

    if (existingOrder) {
      return res.status(400).json({
        success: false,
        message: 'Order already exists for this payment',
        orderId: existingOrder._id
      });
    }

    // Validate items again (inventory might have changed)
    const processedItems = [];
    let itemsPrice = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product || !product.isActive) {
        // Refund the payment if product is no longer available
        await stripe.refunds.create({
          payment_intent: paymentIntentId,
          reason: 'requested_by_customer'
        });
        
        return res.status(400).json({
          success: false,
          message: `Product "${item.name}" is no longer available. Payment has been refunded.`
        });
      }

      if (!product.isInStock(item.quantity)) {
        // Refund the payment if insufficient stock
        await stripe.refunds.create({
          payment_intent: paymentIntentId,
          reason: 'requested_by_customer'
        });
        
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Payment has been refunded.`
        });
      }

      processedItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images[0]?.url || ''
      });

      itemsPrice += product.price * item.quantity;
    }

    // Get pricing from payment intent metadata
    const pricingFromPayment = {
      itemsPrice: parseFloat(paymentIntent.metadata.itemsPrice),
      taxPrice: parseFloat(paymentIntent.metadata.taxPrice),
      shippingPrice: parseFloat(paymentIntent.metadata.shippingPrice),
      totalPrice: parseFloat(paymentIntent.metadata.totalPrice)
    };

    // Create order
    const orderData = {
      user: req.user.id,
      items: processedItems,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      pricing: pricingFromPayment,
      paymentInfo: {
        method: 'stripe',
        stripePaymentIntentId: paymentIntentId,
        transactionId: paymentIntent.charges.data[0]?.id || paymentIntentId,
        status: 'completed'
      },
      status: 'confirmed',
      notes: {
        customer: notes?.customer || ''
      }
    };

    const order = await Order.create(orderData);

    // Update product inventory
    for (const item of processedItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { 'inventory.quantity': -item.quantity } }
      );
    }

    // Populate order for response
    await order.populate('items.product', 'name images sku');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });

    // Send order confirmation email to customer
    const { sendOrderConfirmationEmail } = require('../utils/emailService');
    const customerEmail = shippingAddress.email || req.user.email;
    const customerName = shippingAddress.fullName || req.user.name;
    
    sendOrderConfirmationEmail(order, customerEmail, customerName).catch(err => {
      console.error('Failed to send order confirmation email:', err);
    });

    // Send WhatsApp notification to admin (payment is completed via Stripe)
    const { sendWhatsAppOrderNotificationWithRetry } = require('../utils/whatsappService');
    sendWhatsAppOrderNotificationWithRetry(order, 1).catch(err => {
      console.error('Failed to send WhatsApp notification:', err);
      // Don't fail the order if WhatsApp notification fails
    });

  } catch (error) {
    console.error('Payment confirmation error:', error);
    next(error);
  }
});

// @desc    Refund payment
// @route   POST /api/payment/refund/:orderId
// @access  Private/Admin
router.post('/refund/:orderId', [
  protect,
  ...validateObjectId('orderId'),
  handleValidationErrors
], async (req, res, next) => {
  try {
    const { amount, reason } = req.body;

    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'admin' && order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (order.paymentInfo.method !== 'stripe' || !order.paymentInfo.stripePaymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be refunded'
      });
    }

    if (order.status === 'refunded') {
      return res.status(400).json({
        success: false,
        message: 'Order has already been refunded'
      });
    }

    // Calculate refund amount
    const refundAmount = amount ? Math.round(amount * 100) : Math.round(order.pricing.totalPrice * 100);

    // Process refund with Stripe
    const refund = await stripe.refunds.create({
      payment_intent: order.paymentInfo.stripePaymentIntentId,
      amount: refundAmount,
      reason: reason || 'requested_by_customer',
      metadata: {
        orderId: order._id.toString(),
        userId: order.user.toString()
      }
    });

    // Update order
    order.status = 'refunded';
    order.paymentInfo.status = 'refunded';
    order.refund = {
      amount: refundAmount / 100,
      reason: reason || 'Customer request',
      processedAt: new Date(),
      refundId: refund.id
    };

    order.timeline.push({
      status: 'refunded',
      timestamp: new Date(),
      note: `Refund processed: $${refundAmount / 100}`,
      updatedBy: req.user.id
    });

    // Restore inventory
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { 'inventory.quantity': item.quantity } }
      );
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        orderId: order._id,
        refundId: refund.id,
        refundAmount: refundAmount / 100,
        status: order.status
      }
    });
  } catch (error) {
    console.error('Refund error:', error);
    next(error);
  }
});

// @desc    Get payment methods (for future use)
// @route   GET /api/payment/methods
// @access  Private
router.get('/methods', protect, async (req, res, next) => {
  try {
    // This is a placeholder for saved payment methods
    // In a full implementation, you would retrieve saved cards from Stripe
    
    res.status(200).json({
      success: true,
      data: {
        availableMethods: ['card'],
        savedCards: [] // Future: get from Stripe customer
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Webhook endpoint for Stripe events
// @route   POST /api/payment/webhook
// @access  Public (Stripe)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log(`Payment ${paymentIntent.id} succeeded`);
        // Additional processing can be done here
        break;
        
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log(`Payment ${failedPayment.id} failed`);
        // Handle failed payment
        break;
        
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

module.exports = router;
