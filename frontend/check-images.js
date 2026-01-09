// Quick check to see if images were updated
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://elqaser111:ALIashraf555@qasercluster.yfqmqsr.mongodb.net/qaserDB';

const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', productSchema);

async function checkImages() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const products = await Product.find({}).limit(10);

        console.log('\n=== First 10 Products ===\n');
        products.forEach(p => {
            const imageUrl = p.images?.[0]?.url || 'NO IMAGE';
            console.log(`${p.name}: ${imageUrl}`);
        });

        const withImages = await Product.countDocuments({ 'images.0': { $exists: true } });
        const total = await Product.countDocuments({});

        console.log(`\n=== Summary ===`);
        console.log(`Total products: ${total}`);
        console.log(`With images: ${withImages}`);
        console.log(`Without images: ${total - withImages}`);

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkImages();
