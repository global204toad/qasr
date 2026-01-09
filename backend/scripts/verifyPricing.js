const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

/**
 * Verify product pricing has been updated correctly
 */
async function verifyPricing() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB\n');

        // Get all products with weight options
        const products = await Product.find({
            isActive: true,
            weightOptions: { $exists: true, $ne: [] }
        });

        console.log(`📦 Found ${products.length} products with weight options\n`);
        console.log('='.repeat(80));

        products.forEach((product, index) => {
            console.log(`\n${index + 1}. ${product.name}`);
            console.log(`   Base Price (product.price): ${product.price} EGP`);

            if (product.weightOptions && product.weightOptions.length > 0) {
                console.log(`   Weight Options:`);
                product.weightOptions.forEach(opt => {
                    const percentOfBase = Math.round((opt.grams / 1000) * 100);
                    const expectedPrice = Math.round((opt.grams / 1000) * product.price);
                    const isCorrect = Math.abs(opt.price - expectedPrice) <= 1;
                    const status = isCorrect ? '✓' : '❌';

                    console.log(`     ${status} ${opt.label.padEnd(6)} (${String(opt.grams).padEnd(4)}g): ${opt.price} EGP (${percentOfBase}% of base) | Expected: ${expectedPrice}`);
                });
            }
        });

        console.log('\n' + '='.repeat(80));
        console.log('\n✅ Verification complete!');

        await mongoose.connection.close();
        console.log('✅ Database connection closed');

    } catch (error) {
        console.error('❌ Error:', error);
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
        process.exit(1);
    }
}

verifyPricing();
