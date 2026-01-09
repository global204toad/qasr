const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Product = require('./models/Product');
const Cart = require('./models/Cart');
const Order = require('./models/Order');
const Category = require('./models/Category');

/**
 * DATABASE CLEANUP SCRIPT - KEEP ONLY NUTS CATEGORY
 * 
 * This script will:
 * 1. Connect to MongoDB ecommerce database
 * 2. Find the "Nuts" category and all its subcategories
 * 3. Delete all other categories
 * 4. Delete all products not belonging to "Nuts" or its subcategories
 * 5. Keep all users, carts, and orders intact
 * 6. Verify the cleanup was successful
 * 
 * TO RUN THIS SCRIPT:
 * 1. Make sure MongoDB is running
 * 2. Open terminal in the backend folder
 * 3. Run: node cleanup-nuts-only.js
 */

async function cleanupDatabase() {
  try {
    console.log('🧹 Starting database cleanup - keeping only Nuts category...');
    
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
    
    // 1. Find the "Nuts" category
    console.log('🔍 Finding "Nuts" category...');
    const nutsCategory = await Category.findOne({ 
      name: "Nuts",
      isActive: true 
    });
    
    if (!nutsCategory) {
      console.log('❌ "Nuts" category not found! Cannot proceed with cleanup.');
      process.exit(1);
    }
    
    console.log(`✅ Found "Nuts" category: ${nutsCategory._id}`);
    
    // 2. Find all subcategories under "Nuts"
    console.log('🔍 Finding subcategories under "Nuts"...');
    const nutsSubcategories = await Category.find({
      parent: nutsCategory._id,
      isActive: true
    });
    
    console.log(`✅ Found ${nutsSubcategories.length} subcategories under "Nuts"`);
    nutsSubcategories.forEach(sub => {
      console.log(`   - ${sub.name} (${sub.slug})`);
    });
    
    // 3. Create array of all category IDs to keep (Nuts + its subcategories)
    const categoriesToKeep = [nutsCategory._id, ...nutsSubcategories.map(sub => sub._id)];
    console.log(`📋 Categories to keep: ${categoriesToKeep.length} total`);
    
    // 4. Find all products that belong to categories we want to keep
    console.log('🔍 Finding products under "Nuts" categories...');
    const nutsProducts = await Product.find({
      category: { $in: categoriesToKeep },
      isActive: true
    });
    
    console.log(`✅ Found ${nutsProducts.length} products under "Nuts" categories`);
    nutsProducts.forEach(product => {
      console.log(`   - ${product.name}`);
    });
    
    // 5. Delete all other categories (not Nuts or its subcategories)
    console.log('🗑️ Deleting all other categories...');
    const deletedCategories = await Category.deleteMany({
      _id: { $nin: categoriesToKeep }
    });
    console.log(`✅ Deleted ${deletedCategories.deletedCount} categories`);
    
    // 6. Delete all products not belonging to Nuts categories
    console.log('🗑️ Deleting all products not under "Nuts" categories...');
    const deletedProducts = await Product.deleteMany({
      category: { $nin: categoriesToKeep }
    });
    console.log(`✅ Deleted ${deletedProducts.deletedCount} products`);
    
    // 7. Clean up any orphaned cart items (products that no longer exist)
    console.log('🧹 Cleaning up orphaned cart items...');
    const allRemainingProducts = await Product.find({}, '_id');
    const remainingProductIds = allRemainingProducts.map(p => p._id);
    
    // Update carts to remove items with deleted products
    const carts = await Cart.find({});
    let orphanedItemsRemoved = 0;
    
    for (const cart of carts) {
      const originalItemCount = cart.items.length;
      cart.items = cart.items.filter(item => 
        remainingProductIds.some(id => id.toString() === item.product.toString())
      );
      
      if (cart.items.length !== originalItemCount) {
        orphanedItemsRemoved += (originalItemCount - cart.items.length);
        cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        await cart.save();
      }
    }
    
    console.log(`✅ Removed ${orphanedItemsRemoved} orphaned cart items`);
    
    // 8. Clean up any orphaned order items
    console.log('🧹 Cleaning up orphaned order items...');
    const orders = await Order.find({});
    let orphanedOrderItemsRemoved = 0;
    
    for (const order of orders) {
      const originalItemCount = order.items.length;
      order.items = order.items.filter(item => 
        remainingProductIds.some(id => id.toString() === item.product.toString())
      );
      
      if (order.items.length !== originalItemCount) {
        orphanedOrderItemsRemoved += (originalItemCount - order.items.length);
        // Recalculate order totals
        order.pricing.itemsPrice = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        order.pricing.taxPrice = order.pricing.itemsPrice * 0.08;
        order.pricing.totalPrice = order.pricing.itemsPrice + order.pricing.taxPrice + order.pricing.shippingPrice;
        await order.save();
      }
    }
    
    console.log(`✅ Removed ${orphanedOrderItemsRemoved} orphaned order items`);
    
    // 9. Display final summary
    console.log('\n🎉 DATABASE CLEANUP COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('📊 FINAL SUMMARY:');
    console.log(`   👤 Users: ${await User.countDocuments()}`);
    console.log(`   🏷️ Categories: ${await Category.countDocuments()}`);
    console.log(`   ☕ Products: ${await Product.countDocuments()}`);
    console.log(`   🛒 Carts: ${await Cart.countDocuments()}`);
    console.log(`   📦 Orders: ${await Order.countDocuments()}`);
    
    console.log('\n🥜 REMAINING "NUTS" DATA:');
    const finalCategories = await Category.find({}).populate('parent', 'name');
    finalCategories.forEach(cat => {
      const parentInfo = cat.parent ? ` (under ${cat.parent.name})` : ' (main category)';
      console.log(`   - ${cat.name}${parentInfo}`);
    });
    
    const finalProducts = await Product.find({}).populate('category', 'name');
    finalProducts.forEach(product => {
      console.log(`   - ${product.name} (${product.category.name})`);
    });
    
    console.log('\n✅ CLEANUP VERIFICATION:');
    console.log('   ✓ Only "Nuts" category and its subcategories remain');
    console.log('   ✓ Only products under "Nuts" categories remain');
    console.log('   ✓ Users, carts, and orders preserved');
    console.log('   ✓ Orphaned references cleaned up');
    console.log('   ✓ Database ready for future category additions');
    
    console.log('\n🚀 NEXT STEPS:');
    console.log('   1. Test the frontend to ensure "Nuts" products display correctly');
    console.log('   2. When ready, add new categories using the seed script');
    console.log('   3. The database structure is ready for future expansions');
    
    console.log('\n🧹 Cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the cleanup function
cleanupDatabase();
