import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitch from '../components/LanguageSwitch';

const TestLanguagePage = () => {
  const { t, translateProduct, translateCategory, language, isRTL } = useLanguage();

  // Sample products for testing
  const sampleProducts = [
    'Lebanese peanuts',
    'Palestinian peanuts',
    'Syrian crunchy snacks with ketchup flavor',
    'Mixed Candies',
    'Raisins',
    'Chocolate rocks',
    'Carob'
  ];

  const sampleCategories = [
    'Nuts',
    'Entertainment',
    'Crunchy Snacks',
    'Mixed Candies'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Language Switch Test Page
            </h1>
            <LanguageSwitch />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Language Info */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Current Language Settings
              </h2>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p><strong>Language:</strong> {language}</p>
                <p><strong>Direction:</strong> {isRTL ? 'RTL (Right-to-Left)' : 'LTR (Left-to-Right)'}</p>
                <p><strong>Document Direction:</strong> {document.documentElement.dir}</p>
                <p><strong>Document Language:</strong> {document.documentElement.lang}</p>
              </div>
            </div>

            {/* Navigation Translations */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Navigation Translations
              </h2>
              <div className="bg-gray-100 p-4 rounded-lg space-y-2">
                <p><strong>{t('home')}:</strong> {t('home')}</p>
                <p><strong>{t('products')}:</strong> {t('products')}</p>
                <p><strong>{t('categories')}:</strong> {t('categories')}</p>
                <p><strong>{t('cart')}:</strong> {t('cart')}</p>
                <p><strong>{t('search')}:</strong> {t('search')}</p>
                <p><strong>{t('addToCart')}:</strong> {t('addToCart')}</p>
              </div>
            </div>

            {/* Page Content Translations */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Page Content Translations
              </h2>
              <div className="bg-gray-100 p-4 rounded-lg space-y-2">
                <p><strong>{t('alkasrCategories')}:</strong> {t('alkasrCategories')}</p>
                <p><strong>{t('aboutOurStory')}:</strong> {t('aboutOurStory')}</p>
                <p><strong>{t('contactUs')}:</strong> {t('contactUs')}</p>
                <p><strong>{t('getInTouch')}:</strong> {t('getInTouch')}</p>
                <p><strong>{t('averageRating')}:</strong> {t('averageRating')}</p>
                <p><strong>{t('happyCustomers')}:</strong> {t('happyCustomers')}</p>
              </div>
            </div>

            {/* Product Name Translations */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Product Name Translations
              </h2>
              <div className="bg-gray-100 p-4 rounded-lg space-y-2">
                {sampleProducts.map((product, index) => (
                  <p key={index}>
                    <strong>{product}:</strong> {translateProduct(product)}
                  </p>
                ))}
              </div>
            </div>

            {/* Category Translations */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Category Translations
              </h2>
              <div className="bg-gray-100 p-4 rounded-lg space-y-2">
                {sampleCategories.map((category, index) => (
                  <p key={index}>
                    <strong>{category}:</strong> {translateCategory(category)}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              How to Test:
            </h3>
            <ul className="list-disc list-inside space-y-2 text-blue-800">
              <li>Click the language switch button in the top-right corner</li>
              <li>Watch all text change from Arabic to English (or vice versa)</li>
              <li>Notice the document direction changes (RTL ↔ LTR)</li>
              <li>Refresh the page - your language preference is saved</li>
              <li>Check that product names translate correctly</li>
              <li>Verify that the layout adjusts for RTL/LTR properly</li>
            </ul>
          </div>

          {/* RTL Test */}
          <div className="mt-8 p-6 bg-green-50 rounded-lg">
            <h3 className="text-lg font-semibold text-green-900 mb-4">
              RTL Layout Test:
            </h3>
            <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} gap-4 items-center`}>
              <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                1
              </div>
              <div className="w-16 h-16 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold">
                2
              </div>
              <div className="w-16 h-16 bg-red-500 rounded-lg flex items-center justify-center text-white font-bold">
                3
              </div>
              <span className="text-green-800">
                {isRTL ? 'Boxes should be arranged right-to-left' : 'Boxes should be arranged left-to-right'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestLanguagePage;
