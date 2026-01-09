import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Star, ShoppingCart, Plus, Minus } from 'lucide-react';
import { formatCurrency, calculateDiscount } from '../lib/utils';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const ProductModal = ({ product, isOpen, onClose }) => {
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const { t, translateProduct, translateTag, translateDescription } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setSelectedImage(0);
      setImageError(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleAddToCart = async () => {
    setIsLoading(true);

    try {
      addItem(product, quantity);
      // Optional: Show success message or close modal
      // onClose();
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product.inventory?.quantity || 999)) {
      setQuantity(newQuantity);
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
  const images = product.images || [];
  const mainImage = images[selectedImage]?.url || '/placeholder-product.png';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square overflow-hidden bg-gray-100 rounded-lg">
                {!imageError ? (
                  <Image
                    src={mainImage}
                    alt={product.name}
                    fill
                    className="object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-lg flex items-center justify-center">
                        📦
                      </div>
                      <span>No Image Available</span>
                    </div>
                  </div>
                )}

                {/* Discount Badge */}
                {discount > 0 && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-md text-sm font-semibold">
                    -{discount}% OFF
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.slice(0, 4).map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative aspect-square overflow-hidden bg-gray-100 rounded-md border-2 transition-colors ${selectedImage === index ? 'border-primary-600' : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <Image
                        src={image.url}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Category */}
              <div className="text-sm text-primary-600 font-medium uppercase tracking-wide">
                {product.category?.name || 'Uncategorized'}
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold text-gray-900">
                {product.name}
              </h1>

              {/* Rating */}
              {product.rating?.count > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < Math.floor(product.rating.average)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.rating.average.toFixed(1)} ({product.rating.count} reviews)
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl font-bold text-gray-900">
                    {formatCurrency(displayPrice || 0)}
                  </span>
                  {product.comparePrice && displayPrice && product.comparePrice > displayPrice && (
                    <span className="text-xl text-gray-500 line-through">
                      {formatCurrency(product.comparePrice)}
                    </span>
                  )}
                </div>
                {discount > 0 && displayPrice && (
                  <div className="text-sm text-green-600 font-medium">
                    You save {formatCurrency(product.comparePrice - displayPrice)} ({discount}%)
                  </div>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900">{t('description')}</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {translateDescription(product.description, product.name)}
                  </p>
                </div>
              )}

              {/* Stock Status */}
              {product.inventory?.trackQuantity && (
                <div className="space-y-2">
                  {product.inventory.quantity > 0 ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600 font-medium">
                        {product.inventory.quantity > 10
                          ? 'In Stock'
                          : `Only ${product.inventory.quantity} left in stock`
                        }
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-red-600 font-medium">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Quantity and Add to Cart */}
              <div className="space-y-4">
                {/* Quantity Selector */}
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700">{t('quantity')}:</span>
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 border-x border-gray-300 min-w-[60px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={product.inventory?.trackQuantity && quantity >= product.inventory.quantity}
                      className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={isLoading || (product.inventory?.trackQuantity && product.inventory.quantity === 0)}
                    className="flex-1 flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        {t('addToCart')}
                      </>
                    )}
                  </button>

                </div>
              </div>

              {/* Product Details */}
              {(product.brand || product.tags?.length > 0) && (
                <div className="space-y-3 pt-6 border-t border-gray-200">
                  {product.brand && (
                    <div className="flex">
                      <span className="text-sm font-medium text-gray-700 w-20">{t('brand')}:</span>
                      <span className="text-sm text-gray-600">{product.brand}</span>
                    </div>
                  )}

                  {product.tags?.length > 0 && (
                    <div className="flex">
                      <span className="text-sm font-medium text-gray-700 w-20">{t('tags')}:</span>
                      <div className="flex flex-wrap gap-1">
                        {product.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                          >
                            {translateTag(tag)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
