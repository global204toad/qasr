// Script to update product images in MongoDB
// Run this with: node update-product-images.js

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment variables');
    process.exit(1);
}

// Product Schema (simplified)
const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', productSchema);

// Get all image files from public/images
const imagesDir = path.join(__dirname, 'public', 'images');
const imageFiles = fs.readdirSync(imagesDir)
    .filter(file => /\.(jpg|jpeg|png|gif|webp|JPG|JPEG|PNG|GIF|WEBP)$/i.test(file));

console.log(`📁 Found ${imageFiles.length} images in /public/images`);

// Function to normalize strings for comparison
function normalize(str) {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '') // Remove all non-alphanumeric characters
        .trim();
}

// Function to find best matching image for a product
function findMatchingImage(productName) {
    const normalizedProductName = normalize(productName);

    // Try exact match first
    for (const imageFile of imageFiles) {
        const normalizedImageName = normalize(imageFile.replace(/\.(jpg|jpeg|png|gif|webp)$/i, ''));
        if (normalizedImageName === normalizedProductName) {
            return `/images/${imageFile}`;
        }
    }

    // Try partial match (image name contains product name or vice versa)
    for (const imageFile of imageFiles) {
        const normalizedImageName = normalize(imageFile.replace(/\.(jpg|jpeg|png|gif|webp)$/i, ''));
        if (normalizedImageName.includes(normalizedProductName) ||
            normalizedProductName.includes(normalizedImageName)) {
            return `/images/${imageFile}`;
        }
    }

    return null;
}

async function updateProductImages() {
    try {
        // Connect to MongoDB
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Get all products
        const products = await Product.find({});
        console.log(`📦 Found ${products.length} products in database`);

        let updatedCount = 0;
        let notFoundCount = 0;

        for (const product of products) {
            const matchingImage = findMatchingImage(product.name);

            if (matchingImage) {
                // Update product with correct image
                await Product.updateOne(
                    { _id: product._id },
                    {
                        $set: {
                            images: [{
                                url: matchingImage,
                                alt: product.name,
                                isPrimary: true
                            }]
                        }
                    }
                );
                console.log(`✅ Updated: ${product.name} → ${matchingImage}`);
                updatedCount++;
            } else {
                console.log(`❌ No match found for: ${product.name}`);
                notFoundCount++;
            }
        }

        console.log('\n📊 Summary:');
        console.log(`   Total products: ${products.length}`);
        console.log(`   ✅ Updated: ${updatedCount}`);
        console.log(`   ❌ Not found: ${notFoundCount}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Disconnected from MongoDB');
    }
}

// Run the script
updateProductImages();
