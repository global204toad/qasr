const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, restrictTo } = require('../middleware/auth');
const {
  validateOrder,
  validateObjectId,
  validatePagination,
  handleValidationErrors,
  sanitizeInput
} = require('../middleware/validation');

const router = express.Router();

// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private
router.get('/', [
  protect,
  ...validatePagination,
  handleValidationErrors
], async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { user: req.user.id };

    // Filter by status
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('items.product', 'name images')
      .lean();

    const total = await Order.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', [
  protect,
  ...validateObjectId('id'),
  handleValidationErrors
], async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name images sku')
      .populate('user', 'name email')
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns the order or is admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', [
  protect,
  sanitizeInput,
  ...validateOrder,
  handleValidationErrors
], async (req, res, next) => {
  try {
    const { items, shippingAddress, billingAddress, notes } = req.body;

    // Validate and process order items
    const processedItems = [];
    let itemsPrice = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.product} not found`
        });
      }

      if (!product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product "${product.name}" is not available`
        });
      }

      // Check inventory
      if (!product.isInStock(item.quantity)) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product "${product.name}". Available: ${product.inventory.quantity}`
        });
      }

      const processedItem = {
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images[0]?.url || ''
      };

      processedItems.push(processedItem);
      itemsPrice += product.price * item.quantity;
    }

    // Calculate pricing (no tax)
    const taxPrice = 0; // No tax

    // Free shipping for orders over 100
    const shippingPrice = itemsPrice >= 100 ? 0 : 10;

    const totalPrice = itemsPrice + shippingPrice;

    // Create order
    const orderData = {
      user: req.user.id,
      items: processedItems,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      pricing: {
        itemsPrice: Math.round(itemsPrice * 100) / 100,
        taxPrice: 0,
        shippingPrice,
        totalPrice: Math.round(totalPrice * 100) / 100
      },
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

    // Send order confirmation email to customer
    const customerEmail = shippingAddress.email || req.user.email;
    const customerName = shippingAddress.fullName || req.user.name;

    // Import email service
    const { sendOrderConfirmationEmail, sendAdminNotificationEmail } = require('../utils/emailService');

    // Send emails asynchronously (don't wait for them)
    sendOrderConfirmationEmail(order, customerEmail, customerName).catch(err => {
      console.error('Failed to send order confirmation email:', err);
      // Don't fail the order if email fails
    });

    // Send admin notification email
    sendAdminNotificationEmail(order).catch(err => {
      console.error('Failed to send admin notification email:', err);
      // Don't fail the order if email fails
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private/Admin
router.patch('/:id/status', [
  protect,
  restrictTo('admin'),
  ...validateObjectId('id'),
  sanitizeInput,
  handleValidationErrors
], async (req, res, next) => {
  try {
    const { status, note } = req.body;

    const validStatuses = [
      'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update status
    order.status = status;

    // Add to timeline
    order.timeline.push({
      status,
      timestamp: new Date(),
      note: note || `Order status changed to ${status}`,
      updatedBy: req.user.id
    });

    // Handle specific status changes
    if (status === 'cancelled' && order.paymentInfo.status === 'completed') {
      // Restore inventory
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { 'inventory.quantity': item.quantity } }
        );
      }
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: {
        orderId: order._id,
        status: order.status,
        timeline: order.timeline
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Add tracking info to order
// @route   PATCH /api/orders/:id/tracking
// @access  Private/Admin
router.patch('/:id/tracking', [
  protect,
  restrictTo('admin'),
  ...validateObjectId('id'),
  sanitizeInput,
  handleValidationErrors
], async (req, res, next) => {
  try {
    const { carrier, trackingNumber, trackingUrl } = req.body;

    if (!carrier || !trackingNumber) {
      return res.status(400).json({
        success: false,
        message: 'Carrier and tracking number are required'
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update tracking info
    order.tracking = {
      carrier,
      trackingNumber,
      trackingUrl: trackingUrl || `https://www.${carrier.toLowerCase()}.com/track/${trackingNumber}`
    };

    // Update status to shipped if not already
    if (order.status === 'processing' || order.status === 'confirmed') {
      order.status = 'shipped';
      order.timeline.push({
        status: 'shipped',
        timestamp: new Date(),
        note: `Order shipped via ${carrier} - Tracking: ${trackingNumber}`,
        updatedBy: req.user.id
      });
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Tracking info added successfully',
      data: {
        orderId: order._id,
        tracking: order.tracking,
        status: order.status
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Cancel order
// @route   PATCH /api/orders/:id/cancel
// @access  Private (own orders only)
router.patch('/:id/cancel', [
  protect,
  ...validateObjectId('id'),
  handleValidationErrors
], async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns the order
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if order can be cancelled
    if (!order.canBeCancelled()) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }

    // Cancel order
    order.status = 'cancelled';
    order.timeline.push({
      status: 'cancelled',
      timestamp: new Date(),
      note: 'Order cancelled by customer',
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
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private (own stats), Admin (all stats)
router.get('/stats/summary', protect, async (req, res, next) => {
  try {
    let matchStage = {};

    // If not admin, only show user's stats
    if (req.user.role !== 'admin') {
      matchStage.user = req.user._id;
    }

    const stats = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$pricing.totalPrice' },
          averageOrderValue: { $avg: '$pricing.totalPrice' },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      pendingOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0
    };

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Send order confirmation email
// @route   POST /api/orders/send-confirmation
// @access  Public (for checkout flow)
router.post('/send-confirmation', async (req, res, next) => {
  try {
    const { orderId, email } = req.body;

    if (!orderId || !email) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and email are required'
      });
    }

    const order = await Order.findById(orderId)
      .populate('items.product', 'name images')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Import email service
    const { sendOrderConfirmationEmail } = require('../utils/emailService');

    // Send confirmation email
    const emailResult = await sendOrderConfirmationEmail(order, { email, name: order.shippingAddress.fullName });

    if (emailResult.success) {
      res.status(200).json({
        success: true,
        message: 'Order confirmation email sent successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send confirmation email',
        error: emailResult.message
      });
    }
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
