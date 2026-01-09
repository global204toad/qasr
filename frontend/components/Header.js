import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
// Using Lucide React icons instead of Heroicons
import {
  ShoppingCart as ShoppingCartIcon,
  User as UserIcon,
  Search as SearchIcon,
  Menu as MenuIcon,
  X as XIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import SearchModal from './SearchModal';
import CartDrawer from './CartDrawer';
import UserMenu from './UserMenu';
import MobileMenu from './MobileMenu';
import LanguageSwitch from './LanguageSwitch';

const Header = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { totals } = useCart();
  const { t, isRTL } = useLanguage();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const userMenuRef = useRef(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    const handleRouteChange = () => {
      setIsMobileMenuOpen(false);
    };

    router.events.on('routeChangeStart', handleRouteChange);
    return () => router.events.off('routeChangeStart', handleRouteChange);
  }, [router]);

  const navigation = [
    { name: t('home'), href: '/' },
    { name: t('products'), href: '/products' },
    { name: t('categories'), href: '/categories' },
    { name: t('about'), href: '/about' },
    { name: t('contact'), href: '/contact' },
  ];

  return (
    <>
      <header className="cream-gradient shadow-lg sticky top-0 z-40 border-b border-gold-600">
        {/* Main header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Mobile Layout (< md) */}
            <div className="flex md:hidden items-center justify-between w-full">
              {/* Left: Hamburger Menu */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-luxury-burgundy hover:text-luxury-burgundy-light transition-all"
                aria-label="Open menu"
              >
                <MenuIcon className="w-6 h-6" />
              </button>

              {/* Center: Logo */}
              <Link href="/" className="flex items-center">
                <Image
                  src="/el-2aser-logo.png"
                  alt="ALKASR"
                  width={100}
                  height={75}
                  className="h-10 w-auto"
                  priority
                />
              </Link>

              {/* Right: Action Icons */}
              <div className="flex items-center space-x-1">
                {/* Language Switch */}
                <LanguageSwitch />

                {/* Search */}
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-luxury-burgundy hover:text-luxury-burgundy-light transition-all"
                  aria-label={t('search')}
                >
                  <SearchIcon className="w-5 h-5" />
                </button>

                {/* Cart */}
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-luxury-burgundy hover:text-luxury-burgundy-light transition-all"
                  aria-label={t('cart')}
                >
                  <ShoppingCartIcon className="w-5 h-5" />
                  {totals.items > 0 && (
                    <span className="absolute top-0 right-0 gold-gradient text-luxury-cream text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold shadow-lg">
                      {totals.items > 99 ? '99+' : totals.items}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Desktop Layout (>= md) */}
            <div className="hidden md:flex items-center justify-between w-full">
              {/* Logo */}
              <div className="flex-shrink-0">
                <Link href="/" className="flex items-center">
                  <Image
                    src="/el-2aser-logo.png"
                    alt="ALKASR - عطارة وتحميص حبات القصر"
                    width={120}
                    height={90}
                    className="h-12 w-auto"
                    priority
                  />
                </Link>
              </div>

              {/* Desktop Navigation */}
              <nav className="flex space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`text-luxury-burgundy hover:text-luxury-burgundy-light px-3 py-2 text-sm font-medium transition-all duration-300 ${router.pathname === item.href ? 'text-luxury-burgundy-light border-b-2 border-luxury-burgundy-light' : ''
                      }`}
                    onClick={(e) => {
                      if (router.pathname === item.href) {
                        e.preventDefault();
                      }
                    }}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              {/* Right side actions */}
              <div className={`flex items-center ${isRTL ? 'space-x-reverse' : 'space-x-4'}`}>
                {/* Language Switch */}
                <LanguageSwitch />

                {/* Search */}
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-luxury-burgundy hover:text-luxury-burgundy-light transition-all duration-300 hover:scale-110"
                  aria-label={t('search')}
                >
                  <SearchIcon className="w-6 h-6" />
                </button>

                {/* Cart */}
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-luxury-burgundy hover:text-luxury-burgundy-light transition-all duration-300 hover:scale-110"
                  aria-label={t('cart')}
                >
                  <ShoppingCartIcon className="w-6 h-6" />
                  {totals.items > 0 && (
                    <span className="absolute top-0 right-0 gold-gradient text-luxury-cream text-xs rounded-full w-6 h-6 flex items-center justify-center font-semibold shadow-lg">
                      {totals.items > 99 ? '99+' : totals.items}
                    </span>
                  )}
                </button>

                {/* User menu */}
                {isAuthenticated ? (
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-2 p-2 text-luxury-burgundy hover:text-luxury-burgundy-light transition-all duration-300"
                    >
                      <div className="w-8 h-8 gold-gradient rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-luxury-cream text-sm font-bold">
                          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <span className="hidden md:block text-sm font-medium">
                        {user?.name}
                      </span>
                    </button>

                    {isUserMenuOpen && (
                      <UserMenu onClose={() => setIsUserMenuOpen(false)} />
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link href="/sign-in" className="text-luxury-burgundy hover:text-luxury-burgundy-light text-sm font-medium transition-all duration-300">
                      {t('signIn')}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Modals and Drawers */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navigation={navigation}
      />
    </>
  );
};

export default Header;
