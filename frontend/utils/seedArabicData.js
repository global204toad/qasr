const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const { getConnectionOptions } = require('../config/database');
require('dotenv').config();

// Arabic categories and products matching your requirements
const arabicProducts = [
  // مكسرات (Nuts)
  {
    name: "لوز محمص",
    description: "لوز طبيعي محمص بجودة عالية، غني بالفيتامينات والمعادن المفيدة للصحة",
    price: 45.00,
    comparePrice: 55.00,
    category: "مكسرات",
    brand: "القصر",
    images: [
      {
        url: "https://images.unsplash.com/photo-1508062878650-88b52897f298?w=800&h=800&fit=crop",
        alt: "لوز محمص"
      }
    ],
    inventory: {
      quantity: 100,
      trackQuantity: true,
      allowBackorder: false
    },
    specifications: [
      { name: "الوزن", value: "500 جرام" },
      { name: "المنشأ", value: "كاليفورنيا" },
      { name: "النوع", value: "محمص بدون ملح" },
      { name: "فترة الصلاحية", value: "12 شهر" }
    ],
    tags: ["لوز", "محمص", "طبيعي", "صحي"],
    weight: 0.5,
    isFeatured: true,
    rating: {
      average: 4.8,
      count: 156
    }
  },
  {
    name: "جوز برازيلي",
    description: "جوز برازيلي طبيعي عالي الجودة، مصدر ممتاز للسيلينيوم والبروتين",
    price: 65.00,
    comparePrice: 75.00,
    category: "مكسرات",
    brand: "القصر",
    images: [
      {
        url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop",
        alt: "جوز برازيلي"
      }
    ],
    inventory: {
      quantity: 75,
      trackQuantity: true,
      allowBackorder: false
    },
    specifications: [
      { name: "الوزن", value: "400 جرام" },
      { name: "المنشأ", value: "البرازيل" },
      { name: "النوع", value: "خام طبيعي" },
      { name: "فترة الصلاحية", value: "8 أشهر" }
    ],
    tags: ["جوز", "برازيلي", "سيلينيوم", "بروتين"],
    weight: 0.4,
    isFeatured: true,
    rating: {
      average: 4.6,
      count: 89
    }
  },
  {
    name: "كاجو محمص",
    description: "كاجو محمص بطريقة تقليدية، طعم رائع وقيمة غذائية عالية",
    price: 55.00,
    comparePrice: 65.00,
    category: "مكسرات",
    brand: "القصر",
    images: [
      {
        url: "https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=800&h=800&fit=crop",
        alt: "كاجو محمص"
      }
    ],
    inventory: {
      quantity: 90,
      trackQuantity: true,
      allowBackorder: true
    },
    specifications: [
      { name: "الوزن", value: "500 جرام" },
      { name: "المنشأ", value: "الهند" },
      { name: "النوع", value: "محمص مملح قليلاً" },
      { name: "فترة الصلاحية", value: "10 أشهر" }
    ],
    tags: ["كاجو", "محمص", "مملح", "هندي"],
    weight: 0.5,
    isFeatured: false,
    rating: {
      average: 4.7,
      count: 203
    }
  },

  // بذور (Seeds)
  {
    name: "بذور دوار الشمس",
    description: "بذور دوار الشمس المحمصة، وجبة خفيفة صحية ومفيدة",
    price: 25.00,
    comparePrice: 30.00,
    category: "بذور",
    brand: "القصر",
    images: [
      {
        url: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800&h=800&fit=crop",
        alt: "بذور دوار الشمس"
      }
    ],
    inventory: {
      quantity: 150,
      trackQuantity: true,
      allowBackorder: true
    },
    specifications: [
      { name: "الوزن", value: "400 جرام" },
      { name: "النوع", value: "محمص ومملح" },
      { name: "المنشأ", value: "مصر" },
      { name: "فترة الصلاحية", value: "6 أشهر" }
    ],
    tags: ["بذور", "دوار الشمس", "محمص", "مملح"],
    weight: 0.4,
    isFeatured: false,
    rating: {
      average: 4.4,
      count: 124
    }
  },
  {
    name: "بذور اليقطين",
    description: "بذور اليقطين المحمصة الغنية بالزنك والمغنيسيوم",
    price: 35.00,
    comparePrice: 42.00,
    category: "بذور",
    brand: "القصر",
    images: [
      {
        url: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800&h=800&fit=crop",
        alt: "بذور اليقطين"
      }
    ],
    inventory: {
      quantity: 80,
      trackQuantity: true,
      allowBackorder: false
    },
    specifications: [
      { name: "الوزن", value: "300 جرام" },
      { name: "النوع", value: "محمص بدون ملح" },
      { name: "المنشأ", value: "تركيا" },
      { name: "فترة الصلاحية", value: "8 أشهر" }
    ],
    tags: ["بذور", "يقطين", "زنك", "مغنيسيوم"],
    weight: 0.3,
    isFeatured: true,
    rating: {
      average: 4.5,
      count: 67
    }
  },

  // فواكه مجففة (Dried Fruits)
  {
    name: "تمر مجدول",
    description: "تمر مجدول فاخر من أجود الأنواع، طري وحلو المذاق",
    price: 80.00,
    comparePrice: 95.00,
    category: "تمور",
    brand: "القصر",
    images: [
      {
        url: "https://images.unsplash.com/photo-1609501676725-7186f548e5a4?w=800&h=800&fit=crop",
        alt: "تمر مجدول"
      }
    ],
    inventory: {
      quantity: 60,
      trackQuantity: true,
      allowBackorder: false
    },
    specifications: [
      { name: "الوزن", value: "1 كيلو جرام" },
      { name: "المنشأ", value: "المدينة المنورة" },
      { name: "النوع", value: "مجدول فاخر" },
      { name: "فترة الصلاحية", value: "12 شهر" }
    ],
    tags: ["تمر", "مجدول", "فاخر", "سعودي"],
    weight: 1.0,
    isFeatured: true,
    rating: {
      average: 4.9,
      count: 298
    }
  },
  {
    name: "مشمش مجفف",
    description: "مشمش مجفف طبيعي بدون إضافات، غني بفيتامين أ والألياف",
    price: 42.00,
    comparePrice: 50.00,
    category: "فواكه مجففة",
    brand: "القصر",
    images: [
      {
        url: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&h=800&fit=crop",
        alt: "مشمش مجفف"
      }
    ],
    inventory: {
      quantity: 120,
      trackQuantity: true,
      allowBackorder: true
    },
    specifications: [
      { name: "الوزن", value: "500 جرام" },
      { name: "المنشأ", value: "تركيا" },
      { name: "النوع", value: "مجفف طبيعياً" },
      { name: "فترة الصلاحية", value: "12 شهر" }
    ],
    tags: ["مشمش", "مجفف", "طبيعي", "فيتامين أ"],
    weight: 0.5,
    isFeatured: false,
    rating: {
      average: 4.3,
      count: 145
    }
  },

  // خلطات (Mixed)
  {
    name: "خلطة المكسرات الفاخرة",
    description: "خلطة مميزة من أجود أنواع المكسرات: لوز، جوز، كاجو، فستق",
    price: 90.00,
    comparePrice: 110.00,
    category: "خلطات",
    brand: "القصر",
    images: [
      {
        url: "https://images.unsplash.com/photo-1599599810694-57a2ca8276a8?w=800&h=800&fit=crop",
        alt: "خلطة المكسرات الفاخرة"
      }
    ],
    inventory: {
      quantity: 50,
      trackQuantity: true,
      allowBackorder: false
    },
    specifications: [
      { name: "الوزن", value: "750 جرام" },
      { name: "المحتويات", value: "لوز، جوز، كاجو، فستق" },
      { name: "النوع", value: "محمص ومملح قليلاً" },
      { name: "فترة الصلاحية", value: "10 أشهر" }
    ],
    tags: ["خلطة", "مكسرات", "فاخرة", "متنوعة"],
    weight: 0.75,
    isFeatured: true,
    rating: {
      average: 4.8,
      count: 187
    }
  },

  // منتجات عضوية (Organic)
  {
    name: "عين الجمل العضوي",
    description: "عين الجمل العضوي المعتمد، غني بأوميجا 3 والبروتين النباتي",
    price: 70.00,
    comparePrice: 85.00,
    category: "منتجات عضوية",
    brand: "القصر العضوي",
    images: [
      {
        url: "https://images.unsplash.com/photo-1508062878650-88b52897f298?w=800&h=800&fit=crop",
        alt: "عين الجمل العضوي"
      }
    ],
    inventory: {
      quantity: 40,
      trackQuantity: true,
      allowBackorder: false
    },
    specifications: [
      { name: "الوزن", value: "500 جرام" },
      { name: "الشهادة", value: "عضوي معتمد" },
      { name: "المنشأ", value: "كاليفورنيا" },
      { name: "فترة الصلاحية", value: "8 أشهر" }
    ],
    tags: ["عين الجمل", "عضوي", "أوميجا 3", "معتمد"],
    weight: 0.5,
    isFeatured: true,
    rating: {
      average: 4.7,
      count: 92
    }
  }
];

const seedArabicDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce', getConnectionOptions());
    console.log('🔗 Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Cart.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const adminUser = await User.create({
      name: 'مدير النظام',
      email: 'admin@elqaser.com',
      password: 'admin123',
      role: 'admin',
      isVerified: true,
      phone: '+20-1234567890',
      address: {
        street: 'شارع النيل الرئيسي',
        city: 'القاهرة',
        state: 'القاهرة',
        zipCode: '11511',
        country: 'مصر'
      }
    });

    // Create regular user
    const regularUser = await User.create({
      name: 'أحمد محمد',
      email: 'user@elqaser.com',
      password: 'user123',
      role: 'user',
      isVerified: true,
      phone: '+20-1098765432',
      address: {
        street: 'شارع الجمهورية',
        city: 'الجيزة',
        state: 'الجيزة',
        zipCode: '12411',
        country: 'مصر'
      }
    });

    console.log('👥 Created users');

    // Create products
    const productsWithUser = arabicProducts.map(product => ({
      ...product,
      createdBy: adminUser._id,
      sku: `${product.category.substring(0,3).toUpperCase()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      isActive: true
    }));

    await Product.insertMany(productsWithUser);
    console.log('📦 Created Arabic products');

    // Create a sample cart for the regular user
    const sampleCartItems = [
      {
        product: productsWithUser[0]._id || (await Product.findOne({name: "لوز محمص"}))._id,
        quantity: 2,
        price: 45.00
      },
      {
        product: productsWithUser[5]._id || (await Product.findOne({name: "تمر مجدول"}))._id,
        quantity: 1,
        price: 80.00
      }
    ];

    await Cart.create({
      user: regularUser._id,
      items: sampleCartItems
    });

    console.log('🛒 Created sample cart');

    console.log('\n✅ Arabic database seeded successfully!');
    console.log('\n🔑 Login credentials:');
    console.log('👨‍💼 Admin: admin@elqaser.com / admin123');
    console.log('👤 User: user@elqaser.com / user123');
    console.log('\n📊 Created data:');
    console.log(`   📦 Products: ${arabicProducts.length}`);
    console.log(`   👥 Users: 2`);
    console.log(`   🛒 Carts: 1`);

    // Display categories
    const categories = [...new Set(arabicProducts.map(p => p.category))];
    console.log('\n🏷️  Categories created:');
    categories.forEach(cat => console.log(`   - ${cat}`));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding Arabic database:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  seedArabicDatabase();
}

module.exports = { seedArabicDatabase, arabicProducts };
