import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

// Create axios instance with environment-based URL
// For local development: http://localhost:5000/api
// For production (Vercel): /api (serverless functions)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 30000,
});

// Log the base URL for debugging
console.log('API Base URL:', API_BASE_URL);

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Try to get token from multiple sources
    let token = Cookies.get('token') || Cookies.get('auth_token') || localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      // Handle authentication errors
      if (status === 401) {
        removeAuthToken(); // Use our comprehensive token removal function
        if (typeof window !== 'undefined') {
          window.location.href = '/sign-in';
        }
      }

      // Handle validation errors
      if (status === 400 && data.errors) {
        const errorMessages = data.errors.map(err => err.message).join(', ');
        toast.error(errorMessages);
      } else if (data.message) {
        toast.error(data.message);
      }
    } else if (error.request) {
      toast.error('Network error. Please check your connection.');
    } else {
      toast.error('An unexpected error occurred.');
    }

    return Promise.reject(error);
  }
);

// Auth API calls - Updated for OTP email authentication
export const authAPI = {
  sendCode: (email) => api.post('/auth/send-code', { email }),
  verifyCode: (email, code, name) => api.post('/auth/verify-code', { email, code, name }),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// SMS API calls (New Twilio-based endpoints)
export const smsAPI = {
  sendVerification: (phoneNumber) => api.post('/sms/send-verification', { phoneNumber }),
  verifyCode: (phoneNumber, code) => api.post('/sms/verify-code', { phoneNumber, code }),
  getStatus: () => api.get('/sms/status'),
};

// Products API calls
export const productsAPI = {
  getAll: (params = {}) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getFeatured: (limit = 8) => api.get('/products/featured', { params: { limit } }),
  getCategories: () => api.get('/products/categories'),
  search: (query, filters = {}) => api.get('/products', {
    params: { q: query, ...filters }
  }),
  create: (productData) => api.post('/products', productData),
  update: (id, productData) => api.put(`/products/${id}`, productData),
  delete: (id) => api.delete(`/products/${id}`),
  updateInventory: (id, data) => api.patch(`/products/${id}/inventory`, data),
  toggleFeatured: (id) => api.patch(`/products/${id}/featured`),
};

// Cart API calls
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (productId, quantity = 1, weightOption = null) => api.post('/cart', { productId, quantity, weightOption }),
  updateQuantity: (productId, quantity) => api.patch(`/cart/${productId}`, { quantity }),
  removeFromCart: (productId) => api.delete(`/cart/${productId}`),
  clearCart: () => api.delete('/cart'),
};

// Orders API calls
export const ordersAPI = {
  getAll: (params = {}) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (orderData) => api.post('/orders', orderData),
  updateStatus: (id, status, note) => api.patch(`/orders/${id}/status`, { status, note }),
  addTracking: (id, trackingData) => api.patch(`/orders/${id}/tracking`, trackingData),
  cancel: (id) => api.patch(`/orders/${id}/cancel`),
  getStats: () => api.get('/orders/stats/summary'),
};

// Payment API calls
export const paymentAPI = {
  createIntent: (data) => api.post('/payment/create-intent', data),
  confirmPayment: (data) => api.post('/payment/confirm', data),
  refund: (orderId, data) => api.post(`/payment/refund/${orderId}`, data),
  getMethods: () => api.get('/payment/methods'),
};

// Admin API calls
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params = {}) => api.get('/admin/users', { params }),
  updateUserRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
  getOrders: (params = {}) => api.get('/admin/orders', { params }),
  getProducts: (params = {}) => api.get('/admin/products', { params }),
  uploadImages: (formData) => api.post('/admin/upload/images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteImage: (publicId) => api.delete(`/admin/upload/images/${publicId}`),
  getSalesReport: (params = {}) => api.get('/admin/reports/sales', { params }),
  bulkUpdateProducts: (data) => api.patch('/admin/products/bulk-update', data),
};

// Helper functions
export const handleApiError = (error) => {
  console.error('API Error:', error);

  if (error.response?.data?.message) {
    return error.response.data.message;
  } else if (error.message) {
    return error.message;
  } else {
    return 'An unexpected error occurred';
  }
};

export const isAuthenticated = () => {
  return !!(Cookies.get('token') || Cookies.get('auth_token') || localStorage.getItem('token'));
};

export const getAuthToken = () => {
  return Cookies.get('token') || Cookies.get('auth_token') || localStorage.getItem('token');
};

export const setAuthToken = (token) => {
  // Set the main token cookie
  Cookies.set('token', token, {
    expires: 30, // 30 days
    secure: false, // Set to false for localhost development
    sameSite: 'lax'
    // Remove domain restriction for localhost development
  });

  // Also set in localStorage as backup
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
};

export const removeAuthToken = () => {
  // Remove all possible token cookies
  Cookies.remove('token');
  Cookies.remove('auth_token');

  // Also remove from localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
};

export default api;
