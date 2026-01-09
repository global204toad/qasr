const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const { getConnectionOptions } = require('../config/database');
require('dotenv').config();

// Sample product data
const sampleProducts = [
  {
    name: "Premium Wireless Headphones",
    description: "High-quality wireless headphones with noise cancellation, premium sound quality, and long battery life. Perfect for music lovers and professionals.",
    price: 299.99,
    comparePrice: 399.99,
    category: "Electronics",
    subcategory: "Audio",
    brand: "AudioTech",
    images: [
      {
        url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop",
        alt: "Premium Wireless Headphones"
      }
    ],
    inventory: {
      quantity: 50,
      trackQuantity: true,
      allowBackorder: false
    },
    specifications: [
      { name: "Battery Life", value: "30 hours" },
      { name: "Connectivity", value: "Bluetooth 5.0" },
      { name: "Weight", value: "250g" },
      { name: "Warranty", value: "2 years" }
    ],
    tags: ["wireless", "bluetooth", "noise-cancelling", "premium"],
    weight: 0.25,
    dimensions: {
      length: 20,
      width: 18,
      height: 8,
      unit: "cm"
    },
    isFeatured: true,
    rating: {
      average: 4.8,
      count: 127
    }
  },
  {
    name: "Organic Cotton T-Shirt",
    description: "Comfortable organic cotton t-shirt made from sustainable materials. Soft, breathable, and perfect for everyday wear.",
    price: 29.99,
    comparePrice: 39.99,
    category: "Clothing",
    subcategory: "Shirts",
    brand: "EcoWear",
    images: [
      {
        url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop",
        alt: "Organic Cotton T-Shirt"
      }
    ],
    inventory: {
      quantity: 100,
      trackQuantity: true,
      allowBackorder: true
    },
    specifications: [
      { name: "Material", value: "100% Organic Cotton" },
      { name: "Fit", value: "Regular" },
      { name: "Care", value: "Machine washable" },
      { name: "Origin", value: "Fair Trade Certified" }
    ],
    tags: ["organic", "cotton", "sustainable", "casual"],
    weight: 0.2,
    isFeatured: false,
    rating: {
      average: 4.5,
      count: 89
    }
  },
  {
    name: "Smart Fitness Watch",
    description: "Advanced fitness tracker with heart rate monitoring, GPS, sleep tracking, and smartphone notifications. Water-resistant design.",
    price: 199.99,
    comparePrice: 249.99,
    category: "Electronics",
    subcategory: "Wearables",
    brand: "FitTech",
    images: [
      {
        url: "https://images.unsplash.com/photo-1544117519-31a4b719223d?w=800&h=800&fit=crop",
        alt: "Smart Fitness Watch"
      }
    ],
    inventory: {
      quantity: 75,
      trackQuantity: true,
      allowBackorder: false
    },
    specifications: [
      { name: "Battery Life", value: "7 days" },
      { name: "Water Resistance", value: "5ATM" },
      { name: "Display", value: "1.4 inch AMOLED" },
      { name: "Sensors", value: "Heart Rate, GPS, Accelerometer" }
    ],
    tags: ["smartwatch", "fitness", "gps", "waterproof"],
    weight: 0.05,
    isFeatured: true,
    rating: {
      average: 4.6,
      count: 203
    }
  },
  {
    name: "Professional Coffee Maker",
    description: "Premium coffee maker with programmable settings, thermal carafe, and built-in grinder. Perfect for coffee enthusiasts.",
    price: 149.99,
    comparePrice: 199.99,
    category: "Home & Garden",
    subcategory: "Kitchen Appliances",
    brand: "BrewMaster",
    images: [
      {
        url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=800&fit=crop",
        alt: "Professional Coffee Maker"
      }
    ],
    inventory: {
      quantity: 30,
      trackQuantity: true,
      allowBackorder: false
    },
    specifications: [
      { name: "Capacity", value: "12 cups" },
      { name: "Features", value: "Built-in grinder, programmable" },
      { name: "Material", value: "Stainless steel" },
      { name: "Warranty", value: "2 years" }
    ],
    tags: ["coffee", "kitchen", "appliance", "programmable"],
    weight: 3.5,
    dimensions: {
      length: 35,
      width: 25,
      height: 40,
      unit: "cm"
    },
    isFeatured: false,
    rating: {
      average: 4.4,
      count: 156
    }
  },
  {
    name: "Yoga Mat Premium",
    description: "High-quality non-slip yoga mat made from eco-friendly materials. Perfect grip and cushioning for all types of yoga practice.",
    price: 49.99,
    comparePrice: 69.99,
    category: "Sports",
    subcategory: "Fitness",
    brand: "ZenFit",
    images: [
      {
        url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=800&fit=crop",
        alt: "Yoga Mat Premium"
      }
    ],
    inventory: {
      quantity: 80,
      trackQuantity: true,
      allowBackorder: true
    },
    specifications: [
      { name: "Material", value: "Natural rubber" },
      { name: "Thickness", value: "6mm" },
      { name: "Size", value: "183cm x 61cm" },
      { name: "Weight", value: "2.5kg" }
    ],
    tags: ["yoga", "fitness", "eco-friendly", "non-slip"],
    weight: 2.5,
    dimensions: {
      length: 183,
      width: 61,
      height: 0.6,
      unit: "cm"
    },
    isFeatured: true,
    rating: {
      average: 4.7,
      count: 94
    }
  },
  {
    name: "Moisturizing Face Cream",
    description: "Luxurious anti-aging face cream with hyaluronic acid and vitamin E. Suitable for all skin types, paraben-free formula.",
    price: 79.99,
    comparePrice: 99.99,
    category: "Beauty",
    subcategory: "Skincare",
    brand: "GlowSkin",
    images: [
      {
        url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&h=800&fit=crop",
        alt: "Moisturizing Face Cream"
      }
    ],
    inventory: {
      quantity: 60,
      trackQuantity: true,
      allowBackorder: false
    },
    specifications: [
      { name: "Volume", value: "50ml" },
      { name: "Key Ingredients", value: "Hyaluronic Acid, Vitamin E" },
      { name: "Skin Type", value: "All skin types" },
      { name: "Cruelty Free", value: "Yes" }
    ],
    tags: ["skincare", "anti-aging", "moisturizer", "hyaluronic-acid"],
    weight: 0.1,
    isFeatured: false,
    rating: {
      average: 4.3,
      count: 78
    }
  },
  {
    name: "Educational Building Blocks",
    description: "Colorful wooden building blocks set for children. Promotes creativity, problem-solving, and fine motor skills development.",
    price: 39.99,
    comparePrice: 49.99,
    category: "Toys",
    subcategory: "Educational",
    brand: "LearnPlay",
    images: [
      {
        url: "https://images.unsplash.com/photo-1558877385-9c3b05e6f0b6?w=800&h=800&fit=crop",
        alt: "Educational Building Blocks"
      }
    ],
    inventory: {
      quantity: 120,
      trackQuantity: true,
      allowBackorder: true
    },
    specifications: [
      { name: "Material", value: "Sustainable wood" },
      { name: "Age Range", value: "3-8 years" },
      { name: "Pieces", value: "100 blocks" },
      { name: "Safety", value: "Non-toxic paint" }
    ],
    tags: ["toys", "educational", "wooden", "children"],
    weight: 1.2,
    isFeatured: false,
    rating: {
      average: 4.9,
      count: 145
    }
  },
  {
    name: "Car Phone Mount",
    description: "Universal smartphone mount for car dashboard and windshield. 360-degree rotation and secure grip for all phone sizes.",
    price: 24.99,
    comparePrice: 34.99,
    category: "Automotive",
    subcategory: "Accessories",
    brand: "DriveEasy",
    images: [
      {
        url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop",
        alt: "Car Phone Mount"
      }
    ],
    inventory: {
      quantity: 200,
      trackQuantity: true,
      allowBackorder: false
    },
    specifications: [
      { name: "Compatibility", value: "Universal" },
      { name: "Mount Type", value: "Dashboard/Windshield" },
      { name: "Rotation", value: "360 degrees" },
      { name: "Phone Size", value: "4-7 inches" }
    ],
    tags: ["automotive", "phone-mount", "universal", "car-accessories"],
    weight: 0.3,
    isFeatured: false,
    rating: {
      average: 4.2,
      count: 67
    }
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce', getConnectionOptions());
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      isVerified: true
    });

    // Create regular user
    const regularUser = await User.create({
      name: 'John Doe',
      email: 'user@example.com',
      password: 'user123',
      role: 'user',
      isVerified: true,
      address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'United States'
      },
      phone: '+1-555-0123'
    });

    console.log('Created users');

    // Create products
    const productsWithUser = sampleProducts.map(product => ({
      ...product,
      createdBy: adminUser._id
    }));

    await Product.insertMany(productsWithUser);
    console.log('Created products');

    console.log('\n✅ Database seeded successfully!');
    console.log('\nLogin credentials:');
    console.log('Admin: admin@example.com / admin123');
    console.log('User: user@example.com / user123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, sampleProducts };
