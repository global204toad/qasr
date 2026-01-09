import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingCart } from 'lucide-react';
import { formatCurrency, calculateDiscount } from '../lib/utils';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const ProductCard = ({ product, className = '' }) => {
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const { translateProduct, translateCategory, t, isRTL } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      addItem(product, 1);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get price from largest weight option (1kg) if available, otherwise use base price
  const getDisplayPrice = () => {
    if (Array.isArray(product.weightOptions) && product.weightOptions.length > 0) {
      // Find 1kg option first, or use the largest weight option
      const oneKgOption = product.weightOptions.find(opt =>
        /1\s*kg|1000\s*grams?/i.test(opt.label)
      );
      if (oneKgOption) {
        return oneKgOption.price;
      }
      // If no 1kg, use the option with the largest grams
      const sortedByWeight = [...product.weightOptions].sort((a, b) => b.grams - a.grams);
      return sortedByWeight[0]?.price || product.price;
    }
    return product.price;
  };

  const displayPrice = getDisplayPrice();
  const discount = calculateDiscount(product.comparePrice, displayPrice);
  const imageUrl = product.images?.[0]?.url || '/placeholder-product.png';

  // Debug logging
  console.log('ProductCard - Product:', product.name);
  console.log('ProductCard - Images:', product.images);
  console.log('ProductCard - Image URL:', imageUrl);

  return (
    <div className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group ${className}`}>
      <Link href={`/products/${product._id}`} className="block">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100 rounded-t-lg">
          {!imageError ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              onError={() => {
                console.log('Image failed to load:', imageUrl);
                setImageError(true);
              }}
              onLoad={() => {
                console.log('Image loaded successfully:', imageUrl);
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 bg-gray-200 rounded-lg flex items-center justify-center">
                  📦
                </div>
                <span className="text-sm">No Image</span>
                <div className="text-xs mt-1 text-gray-500">
                  URL: {imageUrl}
                </div>
              </div>
            </div>
          )}

          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
              -{discount}%
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-2 sm:p-4">
          {/* Category */}
          <div className="text-[10px] sm:text-xs text-primary-600 font-medium mb-0.5 sm:mb-1 uppercase tracking-wide">
            {translateCategory(product.category?.name) || t('uncategorized')}
          </div>

          {/* Product Name */}
          <h3 className="font-semibold text-xs sm:text-base text-gray-900 mb-1 sm:mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {translateProduct(product.name)}
          </h3>

          {/* Rating */}
          {product.rating?.count > 0 && (
            <div className="flex items-center mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(product.rating.average)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                      }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 ml-2">
                ({product.rating.count})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <span className="font-bold text-sm sm:text-lg text-gray-900">
                {formatCurrency(displayPrice || 0)}
              </span>
              {product.comparePrice && displayPrice && product.comparePrice > displayPrice && (
                <span className="text-sm text-gray-500 line-through">
                  {formatCurrency(product.comparePrice)}
                </span>
              )}
            </div>
          </div>

          {/* Stock Status */}
          {product.inventory?.trackQuantity && (
            <div className="mb-3">
              {product.inventory.quantity > 0 ? (
                <span className="text-xs text-green-600 font-medium">
                  {product.inventory.quantity > 10
                    ? t('inStock')
                    : `${t('only')} ${product.inventory.quantity} ${t('left')}`
                  }
                </span>
              ) : (
                <span className="text-xs text-red-600 font-medium">
                  {t('outOfStock')}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>

      {/* Add to Cart Button */}
      <div className="px-2 sm:px-4 pb-2 sm:pb-4">
        <button
          onClick={handleAddToCart}
          disabled={isLoading || (product.inventory?.trackQuantity && product.inventory.quantity === 0)}
          className="w-full flex items-center justify-center px-2 sm:px-4 py-2 sm:py-3 bg-primary-600 text-white text-[10px] sm:text-sm font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] touch-manipulation"
        >
          {isLoading ? (
            <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline sm:inline">{t('addToCart')}</span>
              <span className="inline xs:hidden sm:hidden">+</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
