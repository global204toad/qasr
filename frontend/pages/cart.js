import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../lib/utils';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, totals, loading, error } = useCart();
  const [isUpdating, setIsUpdating] = useState({});

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setIsUpdating(prev => ({ ...prev, [productId]: true }));
    try {
      await updateQuantity(productId, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setIsUpdating(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleRemoveItem = async (productId) => {
    setIsUpdating(prev => ({ ...prev, [productId]: true }));
    try {
      await removeFromCart(productId);
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setIsUpdating(prev => ({ ...prev, [productId]: false }));
    }
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Shopping Cart - ALKASR</title>
          <meta name="description" content="Loading your shopping cart..." />
        </Head>

        <div className="min-h-screen bg-gray-50 py-16">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-6"></div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Loading your cart...
              </h1>
              <p className="text-gray-600">
                Please wait while we fetch your cart items
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Shopping Cart - ALKASR</title>
          <meta name="description" content="Error loading your shopping cart" />
        </Head>

        <div className="min-h-screen bg-gray-50 py-16">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="text-red-500 text-4xl mb-6">⚠️</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Error Loading Cart
              </h1>
              <p className="text-gray-600 mb-8">
                {error}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <Head>
          <title>Shopping Cart - ALKASR</title>
          <meta name="description" content="Your shopping cart is currently empty. Start shopping to add items." />
        </Head>

        <div className="min-h-screen bg-gray-50 py-16">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Your cart is empty
              </h1>
              <p className="text-gray-600 mb-8">
                Start shopping to add items to your cart
              </p>
              <Link
                href="/products"
                className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continue Shopping
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
        <title>Shopping Cart ({totals.items}) - ALKASR</title>
        <meta name="description" content="Review your cart items and proceed to checkout." />
      </Head>

      <div className="min-h-screen bg-gray-50 py-4 sm:py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
              {totals.items} {totals.items === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Items in your cart</h2>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <div key={item.product._id} className="p-4 sm:p-6">
                      <div className="flex items-start space-x-3 sm:space-x-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-lg overflow-hidden">
                          {item.product.images?.[0]?.url ? (
                            <img
                              src={item.product.images[0].url}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextElementSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          {(!item.product.images?.[0]?.url || item.product.images[0].url === '') && (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <ShoppingBag className="w-8 h-8" />
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            <Link 
                              href={`/products/${item.product._id}`}
                              className="hover:text-primary-600"
                            >
                              {item.product.name}
                              {item.weightOption && (
                                <span className="text-sm text-gray-500 ml-1 font-normal">
                                  ({item.weightOption.label})
                                </span>
                              )}
                            </Link>
                          </h3>
                          
                          {item.product.description && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {item.product.description}
                            </p>
                          )}
                          
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-lg font-semibold text-gray-900">
                              {formatCurrency(item.price || item.weightOption?.price || item.product.price || 0)}
                            </span>
                            
                            {item.product.stock < 10 && item.product.stock > 0 && (
                              <span className="text-sm text-orange-600">
                                Only {item.product.stock} left
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex flex-col items-end space-y-2 sm:space-y-3">
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                              onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}
                              disabled={item.quantity <= 1 || isUpdating[item.product._id]}
                              className="p-2 min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                            >
                              <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                            
                            <span className="px-3 sm:px-4 py-1 text-center min-w-[2.5rem] sm:min-w-[3rem] text-sm sm:text-base">
                              {isUpdating[item.product._id] ? '...' : item.quantity}
                            </span>
                            
                            <button
                              onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                              disabled={item.quantity >= item.product.stock || isUpdating[item.product._id]}
                              className="p-2 min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                            >
                              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                          </div>

                          <button
                            onClick={() => handleRemoveItem(item.product._id)}
                            disabled={isUpdating[item.product._id]}
                            className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                          >
                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({totals.items} items)</span>
                    <span className="text-gray-900">{formatCurrency(totals.subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900">
                      {totals.subtotal >= 100 ? 'Free' : formatCurrency(10)}
                    </span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900">{formatCurrency(totals.total)}</span>
                    </div>
                  </div>
                </div>

                {totals.subtotal < 100 && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Add {formatCurrency(100 - totals.subtotal)} more for free shipping!
                    </p>
                  </div>
                )}

                <div className="mt-6 space-y-3">
                  <Link
                    href="/checkout"
                    className="w-full bg-primary-600 text-white py-3 sm:py-4 px-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors text-center block min-h-[48px] sm:min-h-[56px] flex items-center justify-center text-sm sm:text-base touch-manipulation"
                  >
                    Proceed to Checkout
                  </Link>
                  
                  <Link
                    href="/products"
                    className="w-full border border-gray-300 text-gray-700 py-3 sm:py-4 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center block min-h-[48px] sm:min-h-[56px] flex items-center justify-center text-sm sm:text-base touch-manipulation"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
