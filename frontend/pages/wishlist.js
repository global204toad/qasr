import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import { formatCurrency } from '../lib/utils';

export default function WishlistPage() {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock wishlist data - replace with API call
  const mockWishlistItems = [
    {
      _id: '1',
      name: 'Premium Wireless Headphones',
      price: 299.99,
      comparePrice: 399.99,
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop'],
      category: 'Electronics',
      inStock: true,
      rating: { average: 4.8, count: 127 }
    },
    {
      _id: '2',
      name: 'Smart Fitness Watch',
      price: 199.99,
      comparePrice: 249.99,
      images: ['https://images.unsplash.com/photo-1544117519-31a4b719223d?w=800&h=800&fit=crop'],
      category: 'Electronics',
      inStock: true,
      rating: { average: 4.6, count: 203 }
    },
    {
      _id: '3',
      name: 'Yoga Mat Premium',
      price: 49.99,
      comparePrice: 69.99,
      images: ['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=800&fit=crop'],
      category: 'Sports',
      inStock: false,
      rating: { average: 4.7, count: 94 }
    }
  ];

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setWishlistItems(mockWishlistItems);
      } catch (error) {
        console.error('Failed to fetch wishlist:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchWishlist();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleRemoveFromWishlist = async (productId) => {
    try {
      setWishlistItems(prev => prev.filter(item => item._id !== productId));
      // API call would go here
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product, 1);
      // Optionally remove from wishlist after adding to cart
      // handleRemoveFromWishlist(product._id);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const handleMoveAllToCart = async () => {
    try {
      const inStockItems = wishlistItems.filter(item => item.inStock);
      for (const item of inStockItems) {
        await addToCart(item, 1);
      }
      // Remove in-stock items from wishlist
      setWishlistItems(prev => prev.filter(item => !item.inStock));
    } catch (error) {
      console.error('Failed to move items to cart:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <Head>
          <title>Wishlist - eCommerce</title>
          <meta name="description" content="Save your favorite items to your wishlist." />
        </Head>

        <div className="min-h-screen bg-gray-50 py-16">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <Heart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Sign in to view your wishlist
              </h1>
              <p className="text-gray-600 mb-8">
                Please sign in to your account to save and view your favorite items.
              </p>
              <Link
                href="/sign-in"
                className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>My Wishlist - eCommerce</title>
        <meta name="description" content="Your saved favorite items and products you love." />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
                <p className="text-gray-600 mt-2">
                  {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
                </p>
              </div>

              {wishlistItems.length > 0 && (
                <div className="flex space-x-4">
                  <button
                    onClick={handleMoveAllToCart}
                    className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add All to Cart
                  </button>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : wishlistItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-white rounded-lg shadow-sm p-8">
                <Heart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Your wishlist is empty
                </h2>
                <p className="text-gray-600 mb-8">
                  Save items you love to your wishlist and never lose track of them
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Start Shopping
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-6">
              {wishlistItems.map((product) => (
                <div key={product._id} className="bg-white rounded-lg shadow-sm overflow-hidden group">
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Remove from wishlist button */}
                    <button
                      onClick={() => handleRemoveFromWishlist(product._id)}
                      className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>

                    {/* Out of stock overlay */}
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
                        <span className="bg-white px-3 py-1 rounded-md text-sm font-medium text-gray-900">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="p-4">
                    <Link href={`/products/${product._id}`}>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-primary-600 transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>

                    <p className="text-sm text-gray-600 mb-3">{product.category?.name || 'Uncategorized'}</p>

                    {/* Rating */}
                    <div className="flex items-center mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(product.rating.average)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                              }`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 ml-2">
                        ({product.rating.count})
                      </span>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-gray-900">
                          {formatCurrency(product.price)}
                        </span>
                        {product.comparePrice && product.comparePrice > product.price && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatCurrency(product.comparePrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.inStock}
                        className="w-full flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                      </button>

                      <Link
                        href={`/products/${product._id}`}
                        className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Continue Shopping */}
          {wishlistItems.length > 0 && (
            <div className="mt-12 text-center">
              <Link
                href="/products"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continue Shopping
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
