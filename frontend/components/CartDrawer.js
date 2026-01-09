import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../lib/utils';

const CartDrawer = ({ isOpen, onClose }) => {
  const { items, totals, updateQuantity, removeItem } = useCart();
  const drawerRef = useRef(null);

  // Handle escape key and outside click
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    onClose();
    // Navigate to checkout page
    window.location.href = '/checkout';
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" />
          
          {/* Drawer */}
          <div className="fixed right-0 top-0 h-full w-full max-w-[90vw] sm:max-w-md">
            <div
              ref={drawerRef}
              className="flex h-full flex-col bg-white shadow-xl transform transition-transform duration-300 ease-in-out"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Shopping Cart ({totals.items})
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <ShoppingBag className="w-16 h-16 mb-4" />
                    <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
                    <p className="text-sm text-center px-4">
                      Add some products to your cart to get started!
                    </p>
                    <Link 
                      href="/products"
                      onClick={onClose}
                      className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Continue Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="p-4 space-y-4">
                    {items.map((item) => (
                      <div key={item.product._id} className="flex items-center space-x-4">
                        {/* Product Image */}
                        <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {item.product.images?.[0]?.url ? (
                            <Image
                              src={item.product.images[0].url}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                              No Image
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <Link 
                            href={`/products/${item.product._id}`}
                            onClick={onClose}
                            className="text-sm font-medium text-gray-900 hover:text-primary-600 line-clamp-2"
                          >
                            {item.product.name}
                            {item.weightOption && (
                              <span className="text-xs text-gray-500 ml-1">
                                ({item.weightOption.label})
                              </span>
                            )}
                          </Link>
                          <p className="text-sm text-gray-500">
                            {formatCurrency(item.price || item.weightOption?.price || item.product.price || 0)}
                          </p>

                          {/* Quantity Controls */}
                          <div className="flex items-center mt-2">
                            <button
                              onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                              className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors touch-manipulation"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="mx-2 text-sm font-medium min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                              className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors touch-manipulation"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Price and Remove */}
                        <div className="flex flex-col items-end space-y-2">
                          <p className="text-sm font-semibold text-gray-900">
                            {formatCurrency((item.price || item.weightOption?.price || item.product.price || 0) * item.quantity)}
                          </p>
                          <button
                            onClick={() => removeItem(item.product._id)}
                            className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center text-red-400 hover:text-red-600 transition-colors touch-manipulation"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer with totals and checkout */}
              {items.length > 0 && (
                <div className="border-t border-gray-200 p-4 space-y-4">
                  {/* Order Summary */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">
                        {totals.shipping === 0 ? 'Free' : formatCurrency(totals.shipping)}
                      </span>
                    </div>
                    {totals.shipping === 0 && totals.subtotal < 100 && (
                      <p className="text-xs text-green-600">
                        Add {formatCurrency(100 - totals.subtotal)} more for free shipping!
                      </p>
                    )}
                    <div className="border-t border-gray-200 pt-2">
                      <div className="flex justify-between text-base font-semibold">
                        <span>Total</span>
                        <span>{formatCurrency(totals.total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={handleCheckout}
                      className="w-full bg-primary-600 text-white py-3 sm:py-4 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors min-h-[48px] sm:min-h-[52px] text-sm sm:text-base touch-manipulation"
                    >
                      Proceed to Checkout
                    </button>
                    <Link 
                      href="/cart"
                      onClick={onClose}
                      className="block w-full text-center py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors min-h-[48px] text-sm sm:text-base touch-manipulation"
                    >
                      View Cart
                    </Link>
                  </div>

                  {/* Continue Shopping */}
                  <div className="text-center">
                    <Link 
                      href="/products"
                      onClick={onClose}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Continue Shopping
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CartDrawer;
