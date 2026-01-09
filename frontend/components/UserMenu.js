import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ShoppingBag, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const UserMenu = ({ onClose }) => {
  const { user, logout, isAdmin } = useAuth();
  const menuRef = useRef(null);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  const menuItems = [
    {
      icon: <ShoppingBag className="w-4 h-4" />,
      label: 'My Orders',
      href: '/orders',
      show: true
    },
    {
      icon: <Shield className="w-4 h-4" />,
      label: 'Admin Dashboard',
      href: '/admin',
      show: isAdmin()
    }
  ];

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 animate-slide-down"
    >
      {/* User Info */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email}
            </p>
            {user?.role && (
              <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                user.role === 'admin' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-2">
        {menuItems
          .filter(item => item.show)
          .map((item, index) => (
            <Link 
              key={index} 
              href={item.href}
              onClick={onClose}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors"
            >
              <span className="mr-3 text-gray-400">
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))
        }
      </div>

      {/* Logout */}
      <div className="border-t border-gray-100 pt-2">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4 mr-3" />
          Sign Out
        </button>
      </div>

      {/* Quick Stats (Optional) */}
      <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
        <div className="text-center">
          <div>
            <p className="text-xs text-gray-500">Orders</p>
            <p className="text-sm font-semibold text-gray-900">0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserMenu;
