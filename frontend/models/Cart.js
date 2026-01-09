const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    default: 1
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price must be non-negative']
  },
  weightOption: {
    label: String,
    grams: Number,
    price: Number
  }
}, {
  _id: false // Don't create separate IDs for cart items
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // Each user can only have one cart
  },
  items: [cartItemSchema],
  totalAmount: {
    type: Number,
    default: 0,
    min: [0, 'Total amount must be non-negative']
  },
  totalItems: {
    type: Number,
    default: 0,
    min: [0, 'Total items must be non-negative']
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster user lookups
cartSchema.index({ user: 1 });

// Pre-save middleware to calculate totals
cartSchema.pre('save', function (next) {
  if (this.items && this.items.length > 0) {
    this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
    this.totalAmount = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  } else {
    this.totalItems = 0;
    this.totalAmount = 0;
  }

  this.lastUpdated = new Date();
  next();
});

// Static method to get user's cart with populated product details
cartSchema.statics.getCartWithProducts = function (userId) {
  return this.findOne({ user: userId })
    .populate({
      path: 'items.product',
      select: 'name price images category inventory isActive',
      match: { isActive: true }
    })
    .lean();
};

// Static method to clear cart
cartSchema.statics.clearUserCart = function (userId) {
  return this.findOneAndUpdate(
    { user: userId },
    {
      items: [],
      totalAmount: 0,
      totalItems: 0,
      lastUpdated: new Date()
    },
    { new: true }
  );
};

// Instance method to add item to cart
cartSchema.methods.addItem = function (productId, quantity, price, weightOption = null) {
  // If weight option is provided, use its price
  const itemPrice = weightOption?.price || price;

  // For items with weight options, treat different weights as different items
  const existingItemIndex = this.items.findIndex(item => {
    const sameProduct = item.product.toString() === productId.toString();
    if (weightOption) {
      // For weight-based items, also check if weight option matches
      const sameWeight = item.weightOption &&
        item.weightOption.grams === weightOption.grams;
      return sameProduct && sameWeight;
    }
    // For items without weight options, just check product
    return sameProduct && !item.weightOption;
  });

  if (existingItemIndex > -1) {
    // Update existing item quantity
    this.items[existingItemIndex].quantity += quantity;
  } else {
    // Add new item
    const newItem = {
      product: productId,
      quantity: quantity,
      price: itemPrice
    };

    if (weightOption) {
      newItem.weightOption = {
        label: weightOption.label,
        grams: weightOption.grams,
        price: weightOption.price
      };
    }

    this.items.push(newItem);
  }

  return this.save();
};

// Instance method to remove item from cart
cartSchema.methods.removeItem = function (productId) {
  this.items = this.items.filter(
    item => item.product.toString() !== productId.toString()
  );

  return this.save();
};

// Instance method to update item quantity
cartSchema.methods.updateItemQuantity = function (productId, quantity) {
  const existingItemIndex = this.items.findIndex(
    item => item.product.toString() === productId.toString()
  );

  if (existingItemIndex > -1) {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      this.items.splice(existingItemIndex, 1);
    } else {
      // Update quantity
      this.items[existingItemIndex].quantity = quantity;
    }
  }

  return this.save();
};

module.exports = mongoose.models.Cart || mongoose.model('Cart', cartSchema);
