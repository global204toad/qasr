import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Search, Loader } from 'lucide-react';
import { productsAPI } from '../lib/api';
import { formatCurrency, debounce } from '../lib/utils';

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const inputRef = useRef(null);
  const modalRef = useRef(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle escape key
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

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Debounced search function
  const debouncedSearch = debounce(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await productsAPI.search(searchQuery, { limit: 8 });
      setResults(response.data.data);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, 300);

  // Handle search input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  // Save search to recent searches
  const saveRecentSearch = (searchTerm) => {
    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  // Handle search submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      saveRecentSearch(query.trim());
      onClose();
      // Navigate to search results page
      window.location.href = `/products?q=${encodeURIComponent(query.trim())}`;
    }
  };

  // Handle recent search click
  const handleRecentSearchClick = (searchTerm) => {
    setQuery(searchTerm);
    saveRecentSearch(searchTerm);
    onClose();
    window.location.href = `/products?q=${encodeURIComponent(searchTerm)}`;
  };

  // Handle product click
  const handleProductClick = (product) => {
    saveRecentSearch(query.trim());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative min-h-screen flex items-start justify-center p-4 pt-16">
        <div 
          ref={modalRef}
          className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-96 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center p-4 border-b border-gray-200">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <form onSubmit={handleSubmit}>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search products..."
                  value={query}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </form>
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="w-6 h-6 animate-spin text-primary-600" />
                <span className="ml-2 text-gray-600">Searching...</span>
              </div>
            ) : query.trim() ? (
              results.length > 0 ? (
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Search Results
                  </h3>
                  <div className="space-y-2">
                    {results.map((product) => (
                      <Link 
                        key={product._id} 
                        href={`/products/${product._id}`}
                        onClick={() => handleProductClick(product)}
                        className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {product.images?.[0]?.url ? (
                            <Image
                              src={product.images[0].url}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                              No Image
                            </div>
                          )}
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">
                            {product.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatCurrency(product.price || 0)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                  {results.length === 8 && (
                    <div className="mt-4 text-center">
                      <button
                        onClick={handleSubmit}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        View all results
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <Search className="w-12 h-12 mb-2" />
                  <p>No products found for "{query}"</p>
                  <p className="text-sm">Try searching with different keywords</p>
                </div>
              )
            ) : (
              <div className="p-4">
                {recentSearches.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                      Recent Searches
                    </h3>
                    <div className="space-y-1">
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => handleRecentSearchClick(search)}
                          className="flex items-center w-full p-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <Search className="w-4 h-4 text-gray-400 mr-3" />
                          <span className="text-gray-700">{search}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Popular Products
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: "A camel's eye", id: "68f7f6bb3df8f46ead56cdd4" },
                      { name: "Mix nuts power", id: "68f7fff1eeb650d352fcbf84" },
                      { name: "Cashew-250gm", id: "68f7dfce71d6a1531c9077c6" },
                      { name: "Hazelnut", id: "68f7f88c084c7f4bd14fe3b2" }
                    ].map((product) => (
                      <Link 
                        key={product.name} 
                        href={`/products/${product.id}`}
                        onClick={onClose}
                        className="block p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        {product.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
