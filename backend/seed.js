const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import existing models
const User = require('./models/User');
const Product = require('./models/Product');
const Cart = require('./models/Cart');
const Order = require('./models/Order');
const Category = require('./models/Category');

/**
 * SEED SCRIPT FOR ADMIN DATABASE
 * 
 * This script will:
 * 1. Connect to MongoDB admin database
 * 2. Create collections for Cart, Order, Product, and User
 * 3. Insert test data for all models
 * 4. Link the data properly (User -> Cart -> Order -> Products)
 * 
 * TO RUN THIS SCRIPT:
 * 1. Make sure MongoDB is running
 * 2. Open terminal in the backend folder
 * 3. Run: node seed.js
 */

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding process...');
    
    // Connect to ecommerce database - same as server
    const mongoUri = 'mongodb://localhost:27017/ecommerce';
    console.log(`🔗 Connecting to: ${mongoUri.replace(/:\/\/.*@/, '://***:***@')}`);
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
    });
    
    console.log(`✅ Connected to MongoDB: ${mongoose.connection.host}:${mongoose.connection.port}/${mongoose.connection.name}`);
    
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Cart.deleteMany({});
    await Order.deleteMany({});
    await Category.deleteMany({});
    console.log('✅ Existing data cleared');
    
    // 1. Create Admin User
    console.log('👤 Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 12);
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@alkasr.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      emailVerified: true
    });
    console.log(`✅ Admin user created: ${adminUser.email}`);
    
    // 2. Create Regular User
    console.log('👤 Creating regular user...');
    const regularUser = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: hashedPassword,
      role: 'user',
      isActive: true,
      emailVerified: true
    });
    console.log(`✅ Regular user created: ${regularUser.email}`);
    
    // 3. Create Categories
    console.log('🏷️ Creating categories...');
    
    const categories = await Category.create([
      {
        name: "Coffee Beans",
        slug: "coffee-beans",
        description: "Premium coffee beans from around the world, freshly roasted",
        isActive: true,
        sortOrder: 1,
        createdBy: adminUser._id
      },
      {
        name: "Coffee Machines",
        slug: "coffee-machines",
        description: "Professional and home coffee machines for perfect brewing",
        isActive: true,
        sortOrder: 2,
        createdBy: adminUser._id
      },
      {
        name: "Grinders",
        slug: "grinders",
        description: "Manual and electric coffee grinders for fresh ground coffee",
        isActive: true,
        sortOrder: 3,
        createdBy: adminUser._id
      },
      {
        name: "Accessories",
        slug: "accessories",
        description: "Essential coffee accessories and brewing tools",
        isActive: true,
        sortOrder: 4,
        createdBy: adminUser._id
      },
      {
        name: "Nuts",
        slug: "nuts",
        description: "Premium nuts and snacks perfect for coffee pairings",
        isActive: true,
        sortOrder: 5,
        createdBy: adminUser._id
      }
    ]);
    
    // Create subcategories
    const subcategories = await Category.create([
      {
        name: "Espresso",
        slug: "espresso",
        description: "Espresso coffee beans",
        parent: categories[0]._id, // Coffee Beans
        isActive: true,
        createdBy: adminUser._id
      },
      {
        name: "Blend",
        slug: "blend",
        description: "Coffee blends",
        parent: categories[0]._id, // Coffee Beans
        isActive: true,
        createdBy: adminUser._id
      },
      {
        name: "Manual Brewers",
        slug: "manual-brewers",
        description: "Manual coffee brewing equipment",
        parent: categories[1]._id, // Coffee Machines
        isActive: true,
        createdBy: adminUser._id
      },
      {
        name: "Espresso Machines",
        slug: "espresso-machines",
        description: "Espresso machines",
        parent: categories[1]._id, // Coffee Machines
        isActive: true,
        createdBy: adminUser._id
      },
      {
        name: "Manual",
        slug: "manual-grinders",
        description: "Manual coffee grinders",
        parent: categories[2]._id, // Grinders
        isActive: true,
        createdBy: adminUser._id
      },
      {
        name: "Filters",
        slug: "filters",
        description: "Coffee filters and papers",
        parent: categories[3]._id, // Accessories
        isActive: true,
        createdBy: adminUser._id
      },
      {
        name: "Cold Brew",
        slug: "cold-brew",
        description: "Cold brew equipment",
        parent: categories[3]._id, // Accessories
        isActive: true,
        createdBy: adminUser._id
      },
      {
        name: "Mixed Nuts",
        slug: "mixed-nuts",
        description: "Mixed nuts and trail mixes",
        parent: categories[4]._id, // Nuts
        isActive: true,
        createdBy: adminUser._id
      },
      {
        name: "Almonds",
        slug: "almonds",
        description: "Premium almonds",
        parent: categories[4]._id, // Nuts
        isActive: true,
        createdBy: adminUser._id
      },
      {
        name: "Cashews",
        slug: "cashews",
        description: "Premium cashews",
        parent: categories[4]._id, // Nuts
        isActive: true,
        createdBy: adminUser._id
      }
    ]);
    
    console.log(`✅ Created ${categories.length} main categories and ${subcategories.length} subcategories`);
    
    // 4. Create Products (Roaster Shop Products)
    console.log('☕ Creating roaster shop products...');
    
    const products = await Product.create([
      {
        name: "Espresso Coffee Beans (1kg)",
        description: "Premium single-origin espresso beans, freshly roasted. Perfect for espresso machines with rich, bold flavor and smooth finish.",
        price: 45.99,
        comparePrice: 55.99,
        category: categories[0]._id, // Coffee Beans
        subcategory: subcategories[0]._id, // Espresso
        brand: "ALKASR Premium",
        images: [
          {
            url: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&h=800&fit=crop",
            alt: "Espresso Coffee Beans"
          }
        ],
        inventory: {
          quantity: 50,
          trackQuantity: true,
          allowBackorder: false
        },
        specifications: [
          { name: "Weight", value: "1kg" },
          { name: "Origin", value: "Ethiopia" },
          { name: "Roast Level", value: "Medium-Dark" },
          { name: "Flavor Profile", value: "Bold, Rich, Smooth" }
        ],
        tags: ["espresso", "beans", "premium", "single-origin"],
        weight: 1.0,
        isFeatured: true,
        rating: {
          average: 4.8,
          count: 127
        },
        createdBy: adminUser._id
      },
      {
        name: "House Blend Coffee Beans (500g)",
        description: "Our signature house blend, carefully crafted from multiple origins. Balanced flavor with notes of chocolate and caramel.",
        price: 28.99,
        comparePrice: 35.99,
        category: categories[0]._id, // Coffee Beans
        subcategory: subcategories[1]._id, // Blend
        brand: "ALKASR House",
        images: [
          {
            url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=800&fit=crop",
            alt: "House Blend Coffee Beans"
          }
        ],
        inventory: {
          quantity: 75,
          trackQuantity: true,
          allowBackorder: true
        },
        specifications: [
          { name: "Weight", value: "500g" },
          { name: "Origin", value: "Multi-Origin Blend" },
          { name: "Roast Level", value: "Medium" },
          { name: "Flavor Profile", value: "Balanced, Chocolate, Caramel" }
        ],
        tags: ["house-blend", "beans", "balanced", "chocolate"],
        weight: 0.5,
        isFeatured: true,
        rating: {
          average: 4.6,
          count: 89
        },
        createdBy: adminUser._id
      },
      {
        name: "French Press Coffee Maker",
        description: "Classic French press coffee maker made from high-quality stainless steel. Perfect for brewing rich, full-bodied coffee.",
        price: 39.99,
        comparePrice: 49.99,
        category: categories[1]._id, // Coffee Machines
        subcategory: subcategories[2]._id, // Manual Brewers
        brand: "ALKASR Brew",
        images: [
          {
            url: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&h=800&fit=crop",
            alt: "French Press Coffee Maker"
          }
        ],
        inventory: {
          quantity: 30,
          trackQuantity: true,
          allowBackorder: false
        },
        specifications: [
          { name: "Capacity", value: "1L" },
          { name: "Material", value: "Stainless Steel" },
          { name: "Filter", value: "Double Mesh" },
          { name: "Warranty", value: "2 years" }
        ],
        tags: ["french-press", "manual", "stainless-steel", "brewer"],
        weight: 0.8,
        isFeatured: false,
        rating: {
          average: 4.7,
          count: 156
        },
        createdBy: adminUser._id
      },
      {
        name: "Espresso Machine (Small)",
        description: "Compact espresso machine perfect for home use. Features 15-bar pressure pump and steam wand for milk frothing.",
        price: 299.99,
        comparePrice: 399.99,
        category: categories[1]._id, // Coffee Machines
        subcategory: subcategories[3]._id, // Espresso Machines
        brand: "ALKASR Pro",
        images: [
          {
            url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop",
            alt: "Espresso Machine"
          }
        ],
        inventory: {
          quantity: 15,
          trackQuantity: true,
          allowBackorder: false
        },
        specifications: [
          { name: "Pressure", value: "15 Bar" },
          { name: "Power", value: "1100W" },
          { name: "Tank Capacity", value: "1.5L" },
          { name: "Warranty", value: "3 years" }
        ],
        tags: ["espresso-machine", "home", "15-bar", "steam-wand"],
        weight: 8.5,
        isFeatured: true,
        rating: {
          average: 4.9,
          count: 203
        },
        createdBy: adminUser._id
      },
      {
        name: "Coffee Grinder (Manual)",
        description: "Premium manual coffee grinder with ceramic burrs. Adjustable grind settings for different brewing methods.",
        price: 89.99,
        comparePrice: 109.99,
        category: categories[2]._id, // Grinders
        subcategory: subcategories[4]._id, // Manual
        brand: "ALKASR Grind",
        images: [
          {
            url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&h=800&fit=crop",
            alt: "Manual Coffee Grinder"
          }
        ],
        inventory: {
          quantity: 40,
          trackQuantity: true,
          allowBackorder: true
        },
        specifications: [
          { name: "Burr Type", value: "Ceramic" },
          { name: "Grind Settings", value: "15 levels" },
          { name: "Capacity", value: "30g" },
          { name: "Material", value: "Stainless Steel" }
        ],
        tags: ["manual-grinder", "ceramic-burrs", "adjustable", "portable"],
        weight: 0.6,
        isFeatured: false,
        rating: {
          average: 4.5,
          count: 78
        },
        createdBy: adminUser._id
      },
      {
        name: "Paper Coffee Filters",
        description: "Premium unbleached paper coffee filters. Compatible with most drip coffee makers and pour-over brewers.",
        price: 12.99,
        comparePrice: 15.99,
        category: categories[3]._id, // Accessories
        subcategory: subcategories[5]._id, // Filters
        brand: "ALKASR Filter",
        images: [
          {
            url: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&h=800&fit=crop",
            alt: "Paper Coffee Filters"
          }
        ],
        inventory: {
          quantity: 200,
          trackQuantity: true,
          allowBackorder: true
        },
        specifications: [
          { name: "Count", value: "100 filters" },
          { name: "Size", value: "#4 Cone" },
          { name: "Material", value: "Unbleached Paper" },
          { name: "Compatibility", value: "Most drip brewers" }
        ],
        tags: ["filters", "paper", "unbleached", "drip-brewer"],
        weight: 0.1,
        isFeatured: false,
        rating: {
          average: 4.3,
          count: 45
        },
        createdBy: adminUser._id
      },
      {
        name: "Cold Brew Bottle",
        description: "Glass cold brew bottle with built-in filter. Perfect for making smooth, low-acid cold brew coffee at home.",
        price: 24.99,
        comparePrice: 29.99,
        category: categories[3]._id, // Accessories
        subcategory: subcategories[6]._id, // Cold Brew
        brand: "ALKASR Cold",
        images: [
          {
            url: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&h=800&fit=crop",
            alt: "Cold Brew Bottle"
          }
        ],
        inventory: {
          quantity: 60,
          trackQuantity: true,
          allowBackorder: false
        },
        specifications: [
          { name: "Capacity", value: "32oz" },
          { name: "Material", value: "Glass" },
          { name: "Filter", value: "Built-in Stainless Steel" },
          { name: "Lid", value: "Screw-top" }
        ],
        tags: ["cold-brew", "bottle", "glass", "filter"],
        weight: 0.4,
        isFeatured: false,
        rating: {
          average: 4.4,
          count: 67
        },
        createdBy: adminUser._id
      },
      {
        name: "Premium Mixed Nuts (500g)",
        description: "Premium mixed nuts including almonds, walnuts, cashews, and pistachios. Perfect for snacking or adding to your coffee shop menu.",
        price: 24.99,
        comparePrice: 29.99,
        category: categories[4]._id, // Nuts
        subcategory: subcategories[7]._id, // Mixed Nuts
        brand: "ALKASR Premium",
        images: [
          {
            url: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&h=800&fit=crop",
            alt: "Premium Mixed Nuts"
          }
        ],
        inventory: {
          quantity: 40,
          trackQuantity: true,
          allowBackorder: true
        },
        specifications: [
          { name: "Weight", value: "500g" },
          { name: "Type", value: "Mixed Nuts" },
          { name: "Ingredients", value: "Almonds, Walnuts, Cashews, Pistachios" },
          { name: "Storage", value: "Keep in cool, dry place" }
        ],
        tags: ["nuts", "mixed", "premium", "snacks"],
        weight: 0.5,
        isActive: true,
        isFeatured: true,
        rating: {
          average: 4.6,
          count: 34
        },
        createdBy: adminUser._id
      },
      {
        name: "Roasted Almonds (250g)",
        description: "Premium roasted almonds, lightly salted. Great for pairing with coffee or as a healthy snack.",
        price: 18.99,
        comparePrice: 22.99,
        category: categories[4]._id, // Nuts
        subcategory: subcategories[8]._id, // Almonds
        brand: "ALKASR Roast",
        images: [
          {
            url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&h=800&fit=crop",
            alt: "Roasted Almonds"
          }
        ],
        inventory: {
          quantity: 60,
          trackQuantity: true,
          allowBackorder: false
        },
        specifications: [
          { name: "Weight", value: "250g" },
          { name: "Type", value: "Roasted Almonds" },
          { name: "Preparation", value: "Lightly Salted" },
          { name: "Allergens", value: "Contains nuts" }
        ],
        tags: ["almonds", "roasted", "salted", "healthy"],
        weight: 0.25,
        isActive: true,
        isFeatured: false,
        rating: {
          average: 4.4,
          count: 28
        },
        createdBy: adminUser._id
      },
      {
        name: "Cashew Nuts (300g)",
        description: "Premium whole cashew nuts, perfect for snacking or adding to your favorite recipes.",
        price: 21.99,
        comparePrice: 26.99,
        category: categories[4]._id, // Nuts
        subcategory: subcategories[9]._id, // Cashews
        brand: "ALKASR Select",
        images: [
          {
            url: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=800&h=800&fit=crop",
            alt: "Cashew Nuts"
          }
        ],
        inventory: {
          quantity: 35,
          trackQuantity: true,
          allowBackorder: true
        },
        specifications: [
          { name: "Weight", value: "300g" },
          { name: "Type", value: "Whole Cashews" },
          { name: "Quality", value: "Premium Grade" },
          { name: "Origin", value: "Vietnam" }
        ],
        tags: ["cashews", "whole", "premium", "snacks"],
        weight: 0.3,
        isActive: true,
        isFeatured: false,
        rating: {
          average: 4.7,
          count: 19
        },
        createdBy: adminUser._id
      }
    ]);
    
    console.log(`✅ Created ${products.length} products`);
    
    // 4. Create Cart for Regular User
    console.log('🛒 Creating cart for regular user...');
    const userCart = await Cart.create({
      user: regularUser._id,
      items: [
        {
          product: products[0]._id, // Espresso Beans
          quantity: 2,
          price: products[0].price
        },
        {
          product: products[2]._id, // French Press
          quantity: 1,
          price: products[2].price
        }
      ],
      total: (products[0].price * 2) + products[2].price
    });
    console.log(`✅ Cart created for user: ${regularUser.email}`);
    
    // 5. Create Sample Order
    console.log('📦 Creating sample order...');
    const sampleOrder = await Order.create({
      orderNumber: `ORD-${Date.now()}`,
      user: regularUser._id,
      items: [
        {
          product: products[0]._id,
          name: products[0].name,
          quantity: 1,
          price: products[0].price,
          image: products[0].images[0].url
        },
        {
          product: products[3]._id,
          name: products[3].name,
          quantity: 1,
          price: products[3].price,
          image: products[3].images[0].url
        }
      ],
      shippingAddress: {
        fullName: 'John Doe',
        address: '123 Coffee Street',
        city: 'Brew City',
        state: 'CA',
        zipCode: '90210',
        country: 'USA',
        phone: '+1-555-123-4567'
      },
      billingAddress: {
        fullName: 'John Doe',
        address: '123 Coffee Street',
        city: 'Brew City',
        state: 'CA',
        zipCode: '90210',
        country: 'USA',
        phone: '+1-555-123-4567'
      },
      pricing: {
        itemsPrice: products[0].price + products[3].price,
        taxPrice: (products[0].price + products[3].price) * 0.08,
        shippingPrice: 9.99,
        totalPrice: (products[0].price + products[3].price) * 1.08 + 9.99
      },
      status: 'pending',
      paymentInfo: {
        method: 'stripe',
        status: 'pending'
      }
    });
    console.log(`✅ Sample order created: ${sampleOrder.orderNumber}`);
    
    // Display summary
    console.log('\n🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(50));
    console.log('📊 SUMMARY:');
    console.log(`   👤 Users: ${await User.countDocuments()}`);
    console.log(`   🏷️ Categories: ${await Category.countDocuments()}`);
    console.log(`   ☕ Products: ${await Product.countDocuments()}`);
    console.log(`   🛒 Carts: ${await Cart.countDocuments()}`);
    console.log(`   📦 Orders: ${await Order.countDocuments()}`);
    console.log('\n🔑 ADMIN LOGIN:');
    console.log(`   Email: admin@alkasr.com`);
    console.log(`   Password: admin123`);
    console.log('\n👤 USER LOGIN:');
    console.log(`   Email: john@example.com`);
    console.log(`   Password: admin123`);
    console.log('\n📝 Next steps:');
    console.log('   1. Refresh MongoDB Compass to see the admin database');
    console.log('   2. Start your backend server: npm run dev');
    console.log('   3. Start your frontend: npm run dev');
    console.log('   4. Test the admin panel with the credentials above');
    
    console.log('🌱 Seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the seeding function
seedDatabase();
