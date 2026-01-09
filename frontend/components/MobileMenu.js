import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { X, ShoppingBag, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const MobileMenu = ({ isOpen, onClose, navigation }) => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { totals } = useCart();
  const menuRef = useRef(null);

  // Handle escape key and prevent scroll
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  const userMenuItems = [
    {
      icon: <ShoppingBag className="w-5 h-5" />,
      label: 'My Orders',
      href: '/orders',
      show: isAuthenticated
    },
    {
      icon: <Shield className="w-5 h-5" />,
      label: 'Admin Dashboard',
      href: '/admin',
      show: isAuthenticated && isAdmin()
    }
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" />
          
          {/* Menu Panel */}
          <div className="fixed left-0 top-0 h-full w-full max-w-xs">
            <div
              ref={menuRef}
              className="flex h-full flex-col bg-white shadow-xl transform transition-transform duration-300 ease-in-out"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">E</span>
                  </div>
                  <span className="font-bold text-xl text-gray-900">eCommerce</span>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* User Section */}
              {isAuthenticated && user && (
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {/* Main Navigation */}
                <div className="space-y-1">
                  {navigation.map((item) => (
                    <Link 
                      key={item.name} 
                      href={item.href}
                      onClick={onClose}
                      className="flex items-center px-3 py-2 text-base font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-primary-600 transition-colors"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>

                {/* Divider */}
                {isAuthenticated && (
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="space-y-1">
                      {userMenuItems
                        .filter(item => item.show)
                        .map((item, index) => (
                          <Link 
                            key={index} 
                            href={item.href}
                            onClick={onClose}
                            className="flex items-center px-3 py-2 text-base font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-primary-600 transition-colors"
                          >
                            <span className="mr-3 text-gray-400">
                              {item.icon}
                            </span>
                            {item.label}
                          </Link>
                        ))
                      }
                    </div>
                  </div>
                )}

                {/* Cart Summary */}
                {totals.items > 0 && (
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <Link 
                      href="/cart"
                      onClick={onClose}
                      className="flex items-center justify-between px-3 py-2 text-base font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-primary-600 transition-colors"
                    >
                      <div className="flex items-center">
                        <ShoppingBag className="w-5 h-5 mr-3 text-gray-400" />
                        Cart
                      </div>
                      <span className="bg-primary-600 text-white text-xs rounded-full px-2 py-1">
                        {totals.items}
                      </span>
                    </Link>
                  </div>
                )}
              </nav>

              {/* Footer */}
              <div className="border-t border-gray-200 p-4">
                {isAuthenticated ? (
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2 text-base font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Sign Out
                  </button>
                ) : (
                  <Link 
                    href="/login"
                    onClick={onClose}
                    className="flex items-center justify-center w-full px-4 py-2 text-base font-medium text-primary-600 border border-primary-600 rounded-md hover:bg-primary-50 transition-colors"
                  >
                    Sign In
                  </Link>
                )}

                {/* App Info */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-center space-x-4 text-xs text-gray-500">
                    <Link href="/privacy" onClick={onClose} className="hover:text-primary-600">Privacy</Link>
                    <Link href="/terms" onClick={onClose} className="hover:text-primary-600">Terms</Link>
                  </div>
                  <p className="text-center text-xs text-gray-400 mt-2">
                    © 2024 eCommerce Store
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileMenu;
