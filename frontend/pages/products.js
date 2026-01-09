import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Filter, Grid, List, ChevronDown } from 'lucide-react';
import { productsAPI } from '../lib/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ProductModal from '../components/ProductModal';
import { useLanguage } from '../contexts/LanguageContext';

export default function ProductsPage() {
  const router = useRouter();
  const { t, isRTL } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [categories, setCategories] = useState([]);

  // Pagination and filtering state
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  });

  const [filters, setFilters] = useState({
    category: '',
    sort: '',
    minPrice: '',
    maxPrice: '',
    search: ''
  });

  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await productsAPI.getCategories();
      setCategories(response.data.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Fetch products
  const fetchProducts = async (page = 1, currentFilters = filters) => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = {
        page,
        limit: 12,
        ...currentFilters
      };

      // Map search to q parameter for backend
      if (queryParams.search) {
        queryParams.q = queryParams.search;
        delete queryParams.search;
      }

      // Remove empty filters
      Object.keys(queryParams).forEach(key => {
        if (!queryParams[key]) delete queryParams[key];
      });

      console.log('Fetching products with params:', queryParams);
      const response = await productsAPI.getAll(queryParams);
      console.log('API Response:', response.data);

      setProducts(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      setError('Failed to load products. Please try again.');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load with URL parameters
  useEffect(() => {
    // Fetch categories first
    fetchCategories();

    // Get category from URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const categoryFromUrl = urlParams.get('category');
    const featuredFromUrl = urlParams.get('featured');

    let initialFilters = { ...filters };

    if (categoryFromUrl) {
      initialFilters.category = categoryFromUrl;
      setFilters(initialFilters);
    }

    if (featuredFromUrl === 'true') {
      initialFilters.featured = 'true';
      setFilters(initialFilters);
    }

    fetchProducts(1, initialFilters);
  }, []);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchProducts(1, newFilters);

    // Update URL to reflect the filter change
    const url = new URL(window.location);
    if (value) {
      url.searchParams.set(key, value);
    } else {
      url.searchParams.delete(key);
    }
    window.history.pushState({}, '', url);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    fetchProducts(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle product click to show modal
  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  return (
    <>
      <Head>
        <title>Products - ALKASR</title>
        <meta name="description" content="Browse our wide selection of quality products at great prices." />
      </Head>

      <div className="min-h-screen cream-gradient">
        {/* Hero Section with Video Background */}
        <div className="video-hero-container border-b border-gold-600">
          {/* Video Background */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ backgroundColor: '#800020' }} // Fallback burgundy color
          >
            <source src="/images/El montag.MP4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Overlay Gradient */}
          <div className="video-hero-overlay"></div>

          {/* Content Layer - Empty for clean video background */}
          <div className="video-hero-content">
            {/* Video background only - no logo or text overlay */}
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-luxury-cream-light shadow-lg sticky top-16 z-30 border-b border-gold-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
              {/* Results count */}
              <div className="text-xs sm:text-sm text-luxury-burgundy">
                {pagination.total > 0 && (
                  `Showing ${products.length} of ${pagination.total} luxury items`
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-wrap">
                {/* Sort */}
                <div className="relative flex-1 sm:flex-initial min-w-[140px]">
                  <select
                    value={filters.sort}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                    className="appearance-none w-full bg-luxury-cream border border-gold-600 rounded-md px-3 sm:px-4 py-2 sm:py-2.5 pr-8 text-xs sm:text-sm text-luxury-burgundy focus:ring-2 focus:ring-gold-500 focus:border-gold-500 min-h-[44px]"
                  >
                    <option value="">{t('sortBy')}</option>
                    <option value="newest">{t('newest')}</option>
                    <option value="price_asc">{t('price')}: {t('lowToHigh')}</option>
                    <option value="price_desc">{t('price')}: {t('highToLow')}</option>
                    <option value="name_asc">{t('name')}: A to Z</option>
                    <option value="rating">{t('highestRated')}</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* View mode */}
                <div className="hidden sm:flex border border-gold-600 rounded-md">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center transition-all ${viewMode === 'grid' ? 'gold-gradient text-luxury-cream' : 'text-luxury-burgundy hover:text-luxury-burgundy-light'}`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center transition-all ${viewMode === 'list' ? 'gold-gradient text-luxury-cream' : 'text-luxury-burgundy hover:text-luxury-burgundy-light'}`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>

                {/* Filters toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border border-gold-600 rounded-md text-xs sm:text-sm text-luxury-burgundy hover:bg-luxury-cream-medium transition-all min-h-[44px]"
                >
                  <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="whitespace-nowrap">{t('filters')}</span>
                </button>

                {filters.category && (
                  <button
                    onClick={() => {
                      const newFilters = { ...filters, category: '' };
                      setFilters(newFilters);
                      fetchProducts(1, newFilters);
                      // Update URL to remove category parameter
                      const url = new URL(window.location);
                      url.searchParams.delete('category');
                      window.history.pushState({}, '', url);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-all"
                  >
                    {t('clearFilters')}
                  </button>
                )}
              </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-4 gap-3 sm:gap-4">
                  {/* Search */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      {t('search')}
                    </label>
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      placeholder={`${t('search')}...`}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 sm:py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-h-[44px]"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      {t('category')}
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 sm:py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-h-[44px]"
                    >
                      <option value="">{t('allCategories')}</option>
                      {categories.map((category) => (
                        <option key={category.name} value={category.name}>
                          {category.name} ({category.count})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      {t('minPrice')}
                    </label>
                    <input
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      placeholder="0"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 sm:py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      {t('maxPrice')}
                    </label>
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      placeholder="1000"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 sm:py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-h-[44px]"
                    />
                  </div>
                </div>

                {/* Clear Filters */}
                <div className="mt-4">
                  <button
                    onClick={() => {
                      const emptyFilters = {
                        category: '',
                        sort: '',
                        minPrice: '',
                        maxPrice: '',
                        search: ''
                      };
                      setFilters(emptyFilters);
                      fetchProducts(1, emptyFilters);
                    }}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    {t('clearFilters')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <div className="cream-gradient min-h-screen py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="flex justify-center py-16">
                <LoadingSpinner size="lg" text="Loading products..." />
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <div className="text-red-600 mb-4">{error}</div>
                <button
                  onClick={() => fetchProducts()}
                  className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
                >
                  Try Again
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-gray-600 mb-4">No products found</div>
                <button
                  onClick={() => {
                    const emptyFilters = {
                      category: '',
                      sort: '',
                      minPrice: '',
                      maxPrice: '',
                      search: ''
                    };
                    setFilters(emptyFilters);
                    fetchProducts(1, emptyFilters);
                  }}
                  className="text-primary-600 hover:text-primary-700"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                {/* Products Grid */}
                <div className={`grid gap-3 sm:gap-6 ${viewMode === 'grid'
                  ? 'grid-cols-4' // Force 4 columns at all breakpoints for mobile parity
                  : 'grid-cols-1'
                  }`}>
                  {products.map((product) => (
                    <div key={product._id} onClick={() => handleProductClick(product)} className="cursor-pointer">
                      <ProductCard
                        product={product}
                        className={viewMode === 'list' ? 'flex flex-row' : ''}
                      />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center mt-8 sm:mt-12">
                    <div className="flex items-center flex-wrap gap-2 justify-center">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={!pagination.hasPrevPage}
                        className="px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-md text-xs sm:text-sm bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                      >
                        {t('previous')}
                      </button>

                      {[...Array(pagination.totalPages)].map((_, i) => {
                        const page = i + 1;
                        const isCurrentPage = page === pagination.page;

                        // Show first page, last page, current page, and pages around current
                        if (
                          page === 1 ||
                          page === pagination.totalPages ||
                          (page >= pagination.page - 2 && page <= pagination.page + 2)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`px-3 sm:px-4 py-2 sm:py-2.5 border rounded-md text-xs sm:text-sm min-h-[44px] min-w-[44px] ${isCurrentPage
                                ? 'bg-primary-600 text-white border-primary-600'
                                : 'bg-white border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                              {page}
                            </button>
                          );
                        }

                        // Show ellipsis
                        if (page === pagination.page - 3 || page === pagination.page + 3) {
                          return (
                            <span key={page} className="px-2 py-2 text-gray-500">
                              ...
                            </span>
                          );
                        }

                        return null;
                      })}

                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={!pagination.hasNextPage}
                        className="px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-md text-xs sm:text-sm bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                      >
                        {t('next')}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Product Modal */}
      {showModal && selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </>
  );
}
