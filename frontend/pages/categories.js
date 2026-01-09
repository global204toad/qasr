import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Package, ArrowRight, Loader } from 'lucide-react';
import { productsAPI } from '../lib/api';
import { useLanguage } from '../contexts/LanguageContext';

export default function CategoriesPage() {
  const { t, translateCategory, isRTL } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await productsAPI.getCategories();
        setCategories(response.data.data);
      } catch (err) {
        setError('Failed to load categories');
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);
  
  const defaultCategories = [
    {
      name: 'Coffee Beans',
      count: 2,
      description: 'Premium coffee beans from around the world, freshly roasted',
      icon: '☕',
      color: 'bg-amber-600'
    },
    {
      name: 'Coffee Machines',
      count: 2,
      description: 'Professional and home coffee machines for perfect brewing',
      icon: '⚙️',
      color: 'bg-gray-600'
    },
    {
      name: 'Grinders',
      count: 1,
      description: 'Manual and electric coffee grinders for fresh ground coffee',
      icon: '🔄',
      color: 'bg-orange-600'
    },
    {
      name: 'Accessories',
      count: 2,
      description: 'Essential coffee accessories and brewing tools',
      icon: '🔧',
      color: 'bg-blue-600'
    }
  ];

  // Use API categories if available, otherwise use defaults
  const displayCategories = categories.length > 0 ? categories : defaultCategories;

  return (
    <>
      <Head>
        <title>Categories - ALKASR</title>
        <meta name="description" content="Browse our coffee and roaster shop categories to find the perfect products for your brewing needs." />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                {t('alkasrCategories')}
              </h1>
              <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
                {t('explorePremiumProducts')}
              </p>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="flex items-center space-x-2">
                <Loader className="w-6 h-6 animate-spin text-primary-600" />
                <span className="text-gray-600">{t('loadingCategories')}</span>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="text-red-600 mb-4">{error}</div>
              <button
                onClick={() => window.location.reload()}
                className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
              >
                {t('tryAgain')}
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {t('productCategories')}
                </h2>
                <p className="text-lg text-gray-600">
                  {t('chooseCategoryToExplore')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayCategories.map((category, index) => (
                  <Link
                    key={category.name || index}
                    href={`/products?category=${encodeURIComponent(category.name)}`}
                    className="group"
                  >
                    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group-hover:-translate-y-1">
                      {/* Category Icon/Header */}
                      <div className={`${category.color || 'bg-primary-600'} h-32 flex items-center justify-center relative overflow-hidden`}>
                        <div className="text-white text-center">
                          <div className="text-4xl mb-2">
                            {category.icon || <Package className="w-12 h-12 mx-auto" />}
                          </div>
                          <div className="text-sm font-medium opacity-90">
                            {category.count || 0} {t('products')}
                          </div>
                        </div>
                        
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -translate-y-8 translate-x-8"></div>
                        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white opacity-10 rounded-full translate-y-4 -translate-x-4"></div>
                      </div>

                      {/* Category Info */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                          {translateCategory(category.name)}
                        </h3>
                        
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {category.description || `Explore our ${category.name} collection`}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            {category.count || 0} {t('itemsAvailable')}
                          </span>
                          
                          <div className="flex items-center text-primary-600 group-hover:text-primary-700 transition-colors">
                            <span className="text-sm font-medium mr-1">{t('browse')}</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Featured Category Section */}
              <div className="mt-16 bg-gradient-to-r from-amber-600 to-amber-700 rounded-2xl p-8 text-center">
                <h3 className="text-2xl font-bold text-white mb-4">
                  {t('premiumProducts')}
                </h3>
                <Link
                  href="/products?featured=true"
                  className="inline-flex items-center px-6 py-3 bg-white text-amber-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {t('viewFeaturedProducts')}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>

              {/* Call to Action */}
              <div className="mt-16 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {t('needHelpChoosing')}
                </h3>
                <p className="text-gray-600 mb-6">
                  {t('browseAllProducts')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/products"
                    className="inline-flex items-center px-6 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    {t('viewAllProducts')}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center px-6 py-3 border-2 border-amber-600 text-amber-600 font-semibold rounded-lg hover:bg-amber-600 hover:text-white transition-colors"
                  >
                    {t('contactUs')}
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
