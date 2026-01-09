import { createContext, useContext, useEffect, useState } from 'react';
import { storage } from '../lib/utils';
import toast from 'react-hot-toast';
import { cartAPI, isAuthenticated } from '../lib/api';

const CartContext = createContext({});

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

const CART_STORAGE_KEY = 'cart_items';

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Load cart from API on mount
  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        // Check if user is authenticated before making API call
        if (!isAuthenticated()) {
          // User not authenticated, use localStorage cart
          const savedCart = storage.get(CART_STORAGE_KEY, []);
          setItems(savedCart);
          setError(null);
        } else {
          // User authenticated, fetch from API
          const response = await cartAPI.getCart();
          setItems(response.data.data.items || []);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching cart:', err);
        // If API fails, fallback to localStorage
        const savedCart = storage.get(CART_STORAGE_KEY, []);
        setItems(savedCart);
        setError(null); // Don't show error for unauthenticated users
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  // Save cart to localStorage whenever items change (for unauthenticated users)
  useEffect(() => {
    if (!loading) {
      storage.set(CART_STORAGE_KEY, items);
    }
  }, [items, loading]);

  // Add item to cart
  const addItem = async (product, quantity = 1, weightOption = null) => {
    try {
      setIsUpdating(true);
      console.log(`🛒 Adding ${product.name} to cart...`);
      
      // Check if user is authenticated
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (token) {
        // User authenticated, use API
        const response = await cartAPI.addToCart(product._id, quantity, weightOption);
        setItems(response.data.data.items || []);
      } else {
        // User not authenticated, use localStorage
        // For weight-based items, treat different weights as different items
        setItems(currentItems => {
          const existingItem = currentItems.find(item => {
            const sameProduct = item.product._id === product._id;
            if (weightOption) {
              const sameWeight = item.weightOption && 
                item.weightOption.grams === weightOption.grams;
              return sameProduct && sameWeight;
            }
            return sameProduct && !item.weightOption;
          });
          
          if (existingItem) {
            // Update quantity if item already exists
            const updatedItems = currentItems.map(item => {
              const isSameItem = weightOption
                ? (item.product._id === product._id && 
                   item.weightOption?.grams === weightOption.grams)
                : (item.product._id === product._id && !item.weightOption);
              
              return isSameItem
                ? { ...item, quantity: item.quantity + quantity }
                : item;
            });
            return updatedItems;
          } else {
            // Add new item
            const newItem = {
              product,
              quantity,
              addedAt: new Date().toISOString()
            };
            
            if (weightOption) {
              newItem.weightOption = {
                label: weightOption.label,
                grams: weightOption.grams,
                price: weightOption.price
              };
              newItem.price = weightOption.price;
            } else {
              newItem.price = product.price;
            }
            
            return [...currentItems, newItem];
          }
        });
      }
      toast.success(`Added ${product.name} to cart`);
    } catch (err) {
      console.error('❌ Error adding item to cart:', err);
      // Fallback to localStorage if API fails
      setItems(currentItems => {
        const existingItem = currentItems.find(item => {
          const sameProduct = item.product._id === product._id;
          if (weightOption) {
            const sameWeight = item.weightOption && 
              item.weightOption.grams === weightOption.grams;
            return sameProduct && sameWeight;
          }
          return sameProduct && !item.weightOption;
        });
        
        if (existingItem) {
          const updatedItems = currentItems.map(item => {
            const isSameItem = weightOption
              ? (item.product._id === product._id && 
                 item.weightOption?.grams === weightOption.grams)
              : (item.product._id === product._id && !item.weightOption);
            
            return isSameItem
              ? { ...item, quantity: item.quantity + quantity }
              : item;
          });
          return updatedItems;
        } else {
          const newItem = {
            product,
            quantity,
            addedAt: new Date().toISOString()
          };
          
          if (weightOption) {
            newItem.weightOption = {
              label: weightOption.label,
              grams: weightOption.grams,
              price: weightOption.price
            };
            newItem.price = weightOption.price;
          } else {
            newItem.price = product.price;
          }
          
          return [...currentItems, newItem];
        }
      });
      toast.success(`Added ${product.name} to cart`);
    } finally {
      setIsUpdating(false);
    }
  };

  // Remove item from cart
  const removeItem = async (productId) => {
    try {
      setIsUpdating(true);
      console.log(`🗑️ Removing item ${productId} from cart...`);
      
      // Check if user is authenticated
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (token) {
        // User authenticated, use API
        const response = await cartAPI.removeFromCart(productId);
        setItems(response.data.data.items || []);
      } else {
        // User not authenticated, use localStorage
        setItems(currentItems => {
          const item = currentItems.find(item => item.product._id === productId);
          if (item) {
            toast.success(`Removed ${item.product.name} from cart`);
          }
          return currentItems.filter(item => item.product._id !== productId);
        });
      }
      toast.success('Item removed from cart');
    } catch (err) {
      console.error('Error removing item from cart:', err);
      // Fallback to localStorage if API fails
      setItems(currentItems => {
        const item = currentItems.find(item => item.product._id === productId);
        if (item) {
          toast.success(`Removed ${item.product.name} from cart`);
        }
        return currentItems.filter(item => item.product._id !== productId);
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Update item quantity
  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      await removeItem(productId);
      return;
    }

    try {
      setIsUpdating(true);
      console.log(`🔄 Updating quantity for item ${productId} to ${quantity}...`);
      
      // Check if user is authenticated
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (token) {
        // User authenticated, use API
        const response = await cartAPI.updateQuantity(productId, quantity);
        setItems(response.data.data.items || []);
      } else {
        // User not authenticated, use localStorage
        setItems(currentItems =>
          currentItems.map(item =>
            item.product._id === productId
              ? { ...item, quantity }
              : item
          )
        );
      }
    } catch (err) {
      console.error('Error updating quantity:', err);
      // Fallback to localStorage if API fails
      setItems(currentItems =>
        currentItems.map(item =>
          item.product._id === productId
            ? { ...item, quantity }
            : item
        )
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      setIsUpdating(true);
      console.log('🧹 Clearing cart...');
      
      // Check if user is authenticated
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (token) {
        // User authenticated, use API
        await cartAPI.clearCart();
      }
      // Always clear local state
      setItems([]);
      toast.success('Cart cleared');
    } catch (err) {
      console.error('Error clearing cart:', err);
      // Still clear local state even if API fails
      setItems([]);
      toast.success('Cart cleared');
    } finally {
      setIsUpdating(false);
    }
  };

  // Check if product is in cart
  const isInCart = (productId) => {
    return items.some(item => item.product._id === productId);
  };

  // Get item quantity
  const getItemQuantity = (productId) => {
    const item = items.find(item => item.product._id === productId);
    return item ? item.quantity : 0;
  };

  // Calculate totals
  const totals = {
    items: items.reduce((total, item) => total + item.quantity, 0),
    subtotal: items.reduce((total, item) => {
      const itemPrice = item.price || item.weightOption?.price || item.product.price || 0;
      return total + (itemPrice * item.quantity);
    }, 0),
    get tax() {
      return 0; // No tax
    },
    get shipping() {
      return this.subtotal >= 100 ? 0 : 10; // Free shipping over 100
    },
    get total() {
      return Math.round((this.subtotal + this.tax + this.shipping) * 100) / 100;
    }
  };

  // Get cart summary for checkout
  const getCartSummary = () => {
    return {
      items: items.map(item => ({
        product: item.product._id,
        name: item.product.name,
        price: item.price || item.weightOption?.price || item.product.price || 0,
        quantity: item.quantity,
        image: item.product.images?.[0]?.url || '',
        weightOption: item.weightOption || null
      })),
      pricing: {
        itemsPrice: totals.subtotal,
        taxPrice: totals.tax,
        shippingPrice: totals.shipping,
        totalPrice: totals.total
      }
    };
  };

  // Validate cart items (check stock, prices, etc.)
  const validateCart = async () => {
    // This would typically make API calls to validate each item
    // For now, we'll do basic validation
    const invalidItems = [];
    
    for (const item of items) {
      // Check if product still exists and is available
      if (!item.product.isActive) {
        invalidItems.push({
          item,
          reason: 'Product is no longer available'
        });
      }
      
      // Check stock if tracking is enabled
      if (item.product.inventory?.trackQuantity && 
          item.quantity > item.product.inventory.quantity) {
        invalidItems.push({
          item,
          reason: `Only ${item.product.inventory.quantity} items available`
        });
      }
    }
    
    return {
      isValid: invalidItems.length === 0,
      invalidItems
    };
  };

  // Sync cart with latest product data
  const syncCart = async (updatedProducts) => {
    if (!updatedProducts || updatedProducts.length === 0) return;
    
    setItems(currentItems => {
      return currentItems.map(item => {
        const updatedProduct = updatedProducts.find(p => p._id === item.product._id);
        if (updatedProduct) {
          return {
            ...item,
            product: updatedProduct
          };
        }
        return item;
      });
    });
  };

  // Get recommended products based on cart items
  const getRecommendedProducts = () => {
    // Extract categories from cart items
    const categories = [...new Set(items.map(item => item.product.category))];
    const tags = [...new Set(items.flatMap(item => item.product.tags || []))];
    
    return {
      categories,
      tags,
      totalValue: totals.subtotal
    };
  };

  const value = {
    items,
    loading,
    error,
    isUpdating,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isInCart,
    getItemQuantity,
    totals,
    getCartSummary,
    validateCart,
    syncCart,
    getRecommendedProducts,
    itemCount: items.length,
    isEmpty: items.length === 0,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
