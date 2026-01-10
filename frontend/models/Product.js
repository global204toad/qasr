const mongoose = require('mongoose');
const { validateWeightOptions, fixWeightOptions, generateWeightOptions } = require('../utils/pricingCalculator');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative'],
    set: function (val) {
      return Math.round(val * 100) / 100; // Round to 2 decimal places
    }
  },
  comparePrice: {
    type: Number,
    min: [0, 'Compare price cannot be negative'],
    set: function (val) {
      return val ? Math.round(val * 100) / 100 : val;
    }
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Product category is required']
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  brand: {
    type: String,
    trim: true
  },
  sku: {
    type: String,
    unique: true,
    sparse: true, // Allow null values but enforce uniqueness when present
    trim: true,
    uppercase: true
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    },
    publicId: String // For Cloudinary
  }],
  inventory: {
    quantity: {
      type: Number,
      required: [true, 'Inventory quantity is required'],
      min: [0, 'Inventory cannot be negative'],
      default: 0
    },
    trackQuantity: {
      type: Boolean,
      default: true
    },
    allowBackorder: {
      type: Boolean,
      default: false
    }
  },
  specifications: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    value: {
      type: String,
      required: true,
      trim: true
    }
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  // Structured weight options for variant pricing
  weightOptions: [{
    label: { type: String, required: true, trim: true },
    grams: { type: Number, required: true, min: 1 },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative'],
      set: function (val) { return Math.round(val); }
    }
  }],
  weight: {
    type: Number,
    min: [0, 'Weight cannot be negative']
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: {
      type: String,
      enum: ['cm', 'in'],
      default: 'cm'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be more than 5']
    },
    count: {
      type: Number,
      default: 0,
      min: [0, 'Rating count cannot be negative']
    }
  },
  seo: {
    title: String,
    description: String,
    keywords: [String]
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ 'rating.average': -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ sku: 1 }, { unique: true, sparse: true });

// Virtual for discounted price
productSchema.virtual('discountPercentage').get(function () {
  if (this.comparePrice && this.comparePrice > this.price) {
    return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
  }
  return 0;
});

// Virtual for availability status
productSchema.virtual('isAvailable').get(function () {
  if (!this.isActive) return false;
  if (!this.inventory.trackQuantity) return true;
  return this.inventory.quantity > 0 || this.inventory.allowBackorder;
});

// Method to check if product is in stock
productSchema.methods.isInStock = function (quantity = 1) {
  if (!this.isActive) return false;
  if (!this.inventory.trackQuantity) return true;
  if (this.inventory.allowBackorder) return true;
  return this.inventory.quantity >= quantity;
};

// Method to update inventory
productSchema.methods.updateInventory = function (quantity, operation = 'subtract') {
  if (!this.inventory.trackQuantity) return this;

  if (operation === 'subtract') {
    this.inventory.quantity = Math.max(0, this.inventory.quantity - quantity);
  } else if (operation === 'add') {
    this.inventory.quantity += quantity;
  }

  return this;
};

// Static method to find active products
productSchema.statics.findActive = function () {
  return this.find({ isActive: true });
};

// Static method to find featured products
productSchema.statics.findFeatured = function () {
  return this.find({ isActive: true, isFeatured: true });
};

// Static method to calculate proportional pricing
productSchema.statics.calculateProportionalPricing = function (basePrice1kg) {
  return generateWeightOptions(basePrice1kg);
};

// Method to fix weight options pricing
productSchema.methods.fixWeightOptionsPricing = function () {
  if (Array.isArray(this.weightOptions) && this.weightOptions.length > 0) {
    this.weightOptions = fixWeightOptions(this.weightOptions);
  }

  return this;
};

// Pre-save middleware to validate and fix weight options pricing
productSchema.pre('save', function (next) {
  // If weightOptions exist, ensure they follow proportional pricing
  if (Array.isArray(this.weightOptions) && this.weightOptions.length > 0) {
    // Validate current pricing
    const validation = validateWeightOptions(this.weightOptions, 1);

    // If pricing is not proportional, log a warning (but don't block save)
    if (!validation.isValid) {
      console.warn(`⚠️  Product "${this.name}" has non-proportional pricing:`, validation.errors);
      // Optionally auto-fix pricing (uncomment to enable auto-correction on save)
      // this.weightOptions = fixWeightOptions(this.weightOptions);
    }
  }

  next();
});

// Pre-save middleware to generate SKU if not provided
productSchema.pre('save', function (next) {
  if (!this.sku && this.isNew) {
    // Generate SKU based on category and timestamp
    // Since category is now an ObjectId, we'll use a generic approach
    let categoryCode = 'PRD'; // Default fallback

    // Try to get category name if populated, otherwise use generic code
    if (this.category && typeof this.category === 'object' && this.category.name) {
      const cleanCategory = this.category.name.replace(/\s+/g, '').substring(0, 3);
      if (cleanCategory.length >= 3) {
        categoryCode = cleanCategory.toUpperCase();
      }
    }

    const timestamp = Date.now().toString().slice(-6);
    const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();
    this.sku = `${categoryCode}-${timestamp}-${randomSuffix}`;
  }
  next();
});

// Ensure virtual fields are serialized
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);
