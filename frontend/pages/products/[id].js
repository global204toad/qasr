import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import { Star, ShoppingCart, Plus, Minus, ArrowLeft } from 'lucide-react';
import { productsAPI } from '../../lib/api';
import { formatCurrency, calculateDiscount } from '../../lib/utils';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import Link from 'next/link';
import SEOHead from '../../components/SEOHead';
import { getProductSchema, getBreadcrumbSchema } from '../../lib/seo';

export default function ProductDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const { t, translateProduct, translateCategory, translateDescription, language, isRTL } = useLanguage();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [selectedWeightIndex, setSelectedWeightIndex] = useState(0);

  // Fetch product data
  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await productsAPI.getById(id);
        const p = response.data.data;
        setProduct(p);
        if (Array.isArray(p.weightOptions) && p.weightOptions.length > 0) {
          // Prefer 1kg if present, else use the largest weight option
          const oneKgIdx = p.weightOptions.findIndex(o => /1\s*kg|1000\s*grams?/i.test(o.label));
          if (oneKgIdx >= 0) {
            setSelectedWeightIndex(oneKgIdx);
          } else {
            // Find the option with the largest grams
            const sortedByWeight = p.weightOptions.map((opt, idx) => ({ opt, idx, grams: opt.grams || 0 }))
              .sort((a, b) => b.grams - a.grams);
            setSelectedWeightIndex(sortedByWeight[0]?.idx || 0);
          }
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Product not found');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    setIsAddingToCart(true);

    try {
      // Get the selected weight option if available
      const selectedWeight = Array.isArray(product.weightOptions) && product.weightOptions.length > 0
        ? product.weightOptions[selectedWeightIndex]
        : null;

      addItem(product, quantity, selectedWeight);
      // Optional: Show success message
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product.inventory?.quantity || 999)) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen cream-gradient flex items-center justify-center">
        <LoadingSpinner size="lg" text={t('loading')} />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen cream-gradient flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-luxury-burgundy mb-4">
            {error || 'Product not found'}
          </h1>
          <Link href="/products" className="btn-primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('backToProducts')}
          </Link>
        </div>
      </div>
    );
  }

  const currentWeight = Array.isArray(product.weightOptions) && product.weightOptions.length > 0
    ? product.weightOptions[selectedWeightIndex]
    : null;
  const effectivePrice = currentWeight ? (currentWeight.price || 0) : (product.price || 0);
  const discount = calculateDiscount(product.comparePrice, effectivePrice);
  const images = product.images || [];
  const mainImage = images[selectedImage]?.url || '/placeholder-product.png';

  // Generate structured data
  const productSchema = getProductSchema(product, language);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: translateCategory(product.category?.name) || 'Products', url: '/products' },
    { name: translateProduct(product.name) }
  ]);

  return (
    <>
      <SEOHead
        title={`${translateProduct(product.name)} - ${translateCategory(product.category?.name) || ''}`}
        description={translateDescription(product.description, product.name) || `${translateProduct(product.name)} - Premium quality product from ALKASR`}
        image={mainImage}
        jsonLd={[productSchema, breadcrumbSchema]}
        keywords={[
          translateProduct(product.name),
          translateCategory(product.category?.name),
          product.tags || []
        ].flat()}
      />

      <div className="min-h-screen cream-gradient">
        {/* Breadcrumb */}
        <div className="bg-luxury-cream-light border-b border-gold-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center space-x-2 text-sm">
              <Link href="/" className="text-luxury-burgundy-light hover:text-luxury-burgundy">
                Home
              </Link>
              <span className="text-luxury-burgundy-light">/</span>
              <Link href="/products" className="text-luxury-burgundy-light hover:text-luxury-burgundy">
                Products
              </Link>
              <span className="text-luxury-burgundy-light">/</span>
              <span className="text-luxury-burgundy font-medium">{translateProduct(product.name)}</span>
            </nav>
          </div>
        </div>

        {/* Product Details */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
            {/* Product Images */}
            <div className="space-y-3 sm:space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square overflow-hidden bg-luxury-cream rounded-lg border border-gold-600 touch-manipulation">
                {!imageError ? (
                  <img
                    src={mainImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={() => {
                      console.log('Image failed to load:', mainImage);
                      setImageError(true);
                    }}
                    onLoad={() => {
                      console.log('Image loaded successfully:', mainImage);
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-luxury-burgundy-light">
                    <div className="text-center">
                      <div className="w-24 h-24 mx-auto mb-4 bg-luxury-cream-medium rounded-lg flex items-center justify-center">
                        📦
                      </div>
                      <span>No Image Available</span>
                      <div className="text-xs mt-2 text-gray-500">
                        URL: {mainImage}
                      </div>
                    </div>
                  </div>
                )}

                {/* Discount Badge */}
                {discount > 0 && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-2 rounded-md font-semibold">
                    -{discount}% OFF
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 sm:gap-3">
                  {images.slice(0, 4).map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative aspect-square overflow-hidden bg-luxury-cream rounded-md border-2 transition-colors min-h-[60px] sm:min-h-[80px] touch-manipulation ${selectedImage === index ? 'border-gold-500' : 'border-gold-600 hover:border-gold-400'
                        }`}
                    >
                      <img
                        src={image.url}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-4 sm:space-y-6">
              {/* Back Button */}
              <Link
                href="/products"
                className="inline-flex items-center text-luxury-burgundy-light hover:text-luxury-burgundy transition-colors py-2 min-h-[44px]"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span className="text-sm sm:text-base">{t('backToProducts')}</span>
              </Link>

              {/* Category */}
              <div className="text-xs sm:text-sm text-gold-700 font-medium uppercase tracking-wide">
                {translateCategory(product.category?.name) || t('uncategorized')}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-luxury-burgundy">
                {translateProduct(product.name)}
              </h1>

              {/* Rating */}
              {product.rating?.count > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < Math.floor(product.rating.average)
                          ? 'text-gold-600 fill-current'
                          : 'text-luxury-burgundy-light'
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-luxury-burgundy-light">
                    {product.rating.average.toFixed(1)} ({product.rating.count} reviews)
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-luxury-burgundy">
                    {formatCurrency(effectivePrice || 0)}
                  </span>
                  {product.comparePrice && effectivePrice && product.comparePrice > effectivePrice && (
                    <span className="text-lg sm:text-xl md:text-2xl text-luxury-burgundy-light line-through">
                      {formatCurrency(product.comparePrice)}
                    </span>
                  )}
                </div>
                {discount > 0 && effectivePrice && (
                  <div className="text-sm sm:text-base text-green-600 font-medium">
                    You save {formatCurrency(product.comparePrice - effectivePrice)} ({discount}%)
                  </div>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-luxury-burgundy">{t('description')}</h3>
                  <p className="text-luxury-burgundy-light leading-relaxed">
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
                      <span className="text-green-600 font-medium">
                        {product.inventory.quantity > 10
                          ? t('inStock')
                          : `Only ${product.inventory.quantity} left in stock`
                        }
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-red-600 font-medium">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Weight selector */}
              {Array.isArray(product.weightOptions) && product.weightOptions.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="text-sm font-medium text-luxury-burgundy">Weight</div>
                  <div className="flex flex-wrap gap-2">
                    {product.weightOptions.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedWeightIndex(i)}
                        className={`px-3 py-2 rounded-md border min-w-[90px] text-sm transition-colors ${i === selectedWeightIndex
                          ? 'border-gold-600 bg-luxury-cream text-luxury-burgundy font-semibold'
                          : 'border-gold-600 text-luxury-burgundy-light hover:text-luxury-burgundy'
                          }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity and Add to Cart */}
              <div className="space-y-4 pt-4 sm:pt-6 border-t border-gold-600">
                {/* Quantity Selector */}
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                  <span className="font-medium text-sm sm:text-base text-luxury-burgundy">{t('quantity')}:</span>
                  <div className="flex items-center border border-gold-600 rounded-md w-fit">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="p-2 sm:p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-luxury-burgundy hover:bg-luxury-cream-medium disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                    >
                      <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <span className="px-4 sm:px-6 py-2 sm:py-3 border-x border-gold-600 min-w-[60px] sm:min-w-[80px] text-center text-luxury-burgundy font-medium">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={product.inventory?.trackQuantity && quantity >= product.inventory.quantity}
                      className="p-2 sm:p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-luxury-burgundy hover:bg-luxury-cream-medium disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                    >
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart || (product.inventory?.trackQuantity && product.inventory.quantity === 0)}
                    className="flex-1 flex items-center justify-center px-6 py-3 sm:py-4 btn-primary font-semibold rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-all min-h-[48px] sm:min-h-[56px] text-sm sm:text-base touch-manipulation"
                  >
                    {isAddingToCart ? (
                      <div className="w-5 h-5 border-2 border-luxury-cream border-t-transparent rounded-full animate-spin" />
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
                <div className="space-y-3 pt-6 border-t border-gold-600">
                  {product.brand && (
                    <div className="flex">
                      <span className="font-medium text-luxury-burgundy w-20">Brand:</span>
                      <span className="text-luxury-burgundy-light">{product.brand}</span>
                    </div>
                  )}

                  {product.tags?.length > 0 && (
                    <div className="flex">
                      <span className="font-medium text-luxury-burgundy w-20">Tags:</span>
                      <div className="flex flex-wrap gap-1">
                        {product.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-block px-2 py-1 bg-luxury-cream-medium text-luxury-burgundy text-xs rounded-md border border-gold-600"
                          >
                            {tag}
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
    </>
  );
}
