const mongoose = require('mongoose');
const Product = require('../models/Product');
const { connectDatabase } = require('../config/database');
const { generateWeightOptions, validateWeightOptions } = require('../utils/pricingCalculator');
require('dotenv').config();

/**
 * Update all product prices to use STRICT PROPORTIONAL PRICING
 * 
 * Rules:
 * - 1kg = Base Price (from product.price field)
 * - 500g = Base Price ÷ 2 (exactly 50%)
 * - 250g = Base Price ÷ 4 (exactly 25%)
 * 
 * This replaces the old markup-based pricing (8% for 250g, 5% for 500g)
 */
async function updateProductPrices(options = {}) {
  const { dryRun = false } = options;

  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
    await connectDatabase(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    if (dryRun) {
      console.log('🔍 DRY RUN MODE - No changes will be saved\n');
    }

    // Get all products
    const products = await Product.find({ isActive: true });
    console.log(`📦 Found ${products.length} active products to process\n`);

    let updatedCount = 0;
    let skippedCount = 0;
    let unchangedCount = 0;
    const changes = [];

    for (const product of products) {
      try {
        // Use the price field as the 1kg base price
        const pricePerKg = product.price;

        if (!pricePerKg || pricePerKg <= 0) {
          console.log(`⚠️  Skipping product "${product.name}" - invalid base price: ${pricePerKg}`);
          skippedCount++;
          continue;
        }

        // Generate proportional weight options
        // 250g = base ÷ 4, 500g = base ÷ 2, 1kg = base
        const newWeightOptions = generateWeightOptions(pricePerKg);

        // Check if product already has correct pricing
        const currentWeightOptions = product.weightOptions || [];
        let needsUpdate = false;

        if (currentWeightOptions.length === 0) {
          needsUpdate = true;
        } else {
          // Validate current pricing
          const validation = validateWeightOptions(currentWeightOptions, 0);
          needsUpdate = !validation.isValid;
        }

        if (!needsUpdate) {
          console.log(`✓ Product "${product.name}" already has correct proportional pricing`);
          unchangedCount++;
          continue;
        }

        // Prepare change log
        const changeLog = {
          name: product.name,
          basePrice: pricePerKg,
          old: currentWeightOptions.map(opt => ({
            label: opt.label,
            grams: opt.grams,
            price: opt.price
          })),
          new: newWeightOptions
        };

        console.log(`\n📝 Updating "${product.name}":`);
        console.log(`   Base price (1kg): ${pricePerKg} EGP`);

        if (currentWeightOptions.length > 0) {
          console.log(`   Old pricing:`);
          currentWeightOptions.forEach(opt => {
            console.log(`     - ${opt.label}: ${opt.price} EGP`);
          });
        }

        console.log(`   New proportional pricing:`);
        newWeightOptions.forEach(opt => {
          const percentOfBase = Math.round((opt.grams / 1000) * 100);
          console.log(`     - ${opt.label}: ${opt.price} EGP (${percentOfBase}% of base)`);
        });

        if (!dryRun) {
          // Update the product
          product.weightOptions = newWeightOptions;
          // Ensure price field represents 1kg price
          product.price = pricePerKg;
          await product.save();
          updatedCount++;
        }

        changes.push(changeLog);
      } catch (error) {
        console.error(`❌ Error processing product "${product.name}":`, error.message);
        skippedCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Update Summary:');
    console.log('='.repeat(60));
    console.log(`   ✅ Successfully ${dryRun ? 'would update' : 'updated'}: ${updatedCount} products`);
    console.log(`   ✓  Already correct: ${unchangedCount} products`);
    console.log(`   ⚠️  Skipped: ${skippedCount} products`);
    console.log(`   📋 Total processed: ${products.length} products`);

    if (dryRun && updatedCount > 0) {
      console.log('\n💡 To apply these changes, run the script without --dry-run flag:');
      console.log('   node scripts/updateProductPrices.js');
    }

    if (!dryRun && updatedCount > 0) {
      console.log('\n✅ Database updated successfully!');
      console.log('\n📝 Next steps:');
      console.log('   1. Verify changes in MongoDB Compass');
      console.log('   2. Test frontend product display');
      console.log('   3. Test cart and checkout with new pricing');
    }

    // Close connection
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');

    return {
      success: true,
      updatedCount,
      unchangedCount,
      skippedCount,
      total: products.length,
      changes
    };
  } catch (error) {
    console.error('❌ Error updating product prices:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    throw error;
  }
}

// Run the script
if (require.main === module) {
  // Check for --dry-run flag
  const dryRun = process.argv.includes('--dry-run');

  updateProductPrices({ dryRun })
    .then(result => {
      process.exit(0);
    })
    .catch(error => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = { updateProductPrices };
