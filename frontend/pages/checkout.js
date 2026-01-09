import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Lock, CreditCard, Truck, CheckCircle, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatCurrency, isValidEmail } from '../lib/utils';
import api from '../lib/api';

// Egyptian cities list
const EGYPTIAN_CITIES = [
  'Cairo',
  'Alexandria',
  'Giza',
  'Luxor',
  'Aswan',
  'Mansoura',
  'Tanta',
  'Port Said',
  'Suez',
  'Ismailia',
  'Zagazig',
  'Sharm El Sheikh',
  'Hurghada',
  'Dahab',
  'El Gouna',
  'Marsa Alam',
  'Siwa',
  'Bahariya',
  'Dakhla',
  'Kharga',
  'El Minya',
  'Assiut',
  'Sohag',
  'Qena',
  'Beni Suef',
  'Fayoum',
  'El Arish',
  'Rafah',
  'El Tor',
  'Saint Catherine',
  'El Quseir',
  'Marsa Matruh',
  'El Alamein',
  'Ras Gharib',
  'El Qasr',
  'El Dakhla',
  'El Kharga',
  'El Bahariya',
  'El Farafra',
  'El Siwa'
].sort();

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { items, totals, clearCart } = useCart();
  
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Complete
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCityDropdown && !event.target.closest('.city-dropdown-container')) {
        setShowCityDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCityDropdown]);

  const [shippingData, setShippingData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    country: 'Egypt'
  });

  const [paymentData, setPaymentData] = useState({
    method: 'cash_on_delivery'
  });

  // Calculate shipping based on city
  const calculateShipping = (city) => {
    if (!city) return 0;
    const cityLower = city.toLowerCase().trim();
    if (cityLower === 'cairo' || cityLower === 'giza') {
      return 70;
    }
    return 100;
  };

  // Calculate order totals with city-based shipping
  const orderTotals = {
    subtotal: totals.subtotal,
    shipping: calculateShipping(shippingData.city),
    get total() {
      return this.subtotal + this.shipping;
    }
  };

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items, router]);

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCitySelect = (city) => {
    setShippingData(prev => ({
      ...prev,
      city: city
    }));
    setShowCityDropdown(false);
    
    if (errors.city) {
      setErrors(prev => ({
        ...prev,
        city: ''
      }));
    }
  };

  const validateShipping = () => {
    const newErrors = {};
    
    if (!shippingData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!shippingData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!shippingData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(shippingData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!shippingData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!shippingData.address.trim()) newErrors.address = 'Address is required';
    if (!shippingData.city.trim()) newErrors.city = 'City is required';
    if (!shippingData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateShipping()) {
      setStep(2);
    }
  };

  const createOrder = async () => {
    try {
      const shippingCost = calculateShipping(shippingData.city);
      const response = await api.post('/checkout', {
        shippingAddress: {
          fullName: `${shippingData.firstName} ${shippingData.lastName}`,
          email: shippingData.email,
          phone: shippingData.phone,
          street: shippingData.address,
          city: shippingData.city,
          zipCode: shippingData.zipCode,
          country: shippingData.country
        },
        paymentMethod: 'cash_on_delivery',
        shippingCost: shippingCost,
        notes: `Payment Method: Cash on Delivery`
      });

      console.log('Order created successfully:', response.data);
      // Email is automatically sent by the backend
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create order';
      throw new Error(errorMessage);
    }
  };

  const handlePlaceOrder = async () => {
    // Validate shipping data before proceeding
    if (step === 2 && !validateShipping()) {
      setStep(1);
      return;
    }

    setLoading(true);
    setErrors({});
    
    try {
      // Create order (email is automatically sent by backend)
      const orderData = await createOrder();
      
      if (orderData && orderData.success) {
        // Clear cart and go to success step
        await clearCart();
        setStep(3);
      } else {
        throw new Error('Order creation failed');
      }
    } catch (error) {
      console.error('Order failed:', error);
      const errorMessage = error.message || 'Failed to place order. Please try again.';
      setErrors({ general: errorMessage });
      // Show error to user
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && step !== 3) {
    return null; // Will redirect via useEffect
  }

  return (
    <>
      <Head>
        <title>Checkout - ALKASR</title>
        <meta name="description" content="Complete your purchase securely and quickly." />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Progress Steps */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-center space-x-4 sm:space-x-6 md:space-x-8">
              {[
                { step: 1, label: 'Shipping', icon: Truck },
                { step: 2, label: 'Payment', icon: CreditCard },
                { step: 3, label: 'Complete', icon: CheckCircle }
              ].map(({ step: stepNum, label, icon: Icon }) => (
                <div key={stepNum} className="flex flex-col sm:flex-row items-center">
                  <div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 ${
                    step >= stepNum
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : 'border-gray-300 text-gray-400'
                  }`}>
                    {step > stepNum ? (
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                    ) : (
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    )}
                  </div>
                  <span className={`mt-1 sm:mt-0 sm:ml-2 text-xs sm:text-sm font-medium ${
                    step >= stepNum ? 'text-primary-600' : 'text-gray-400'
                  }`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {step === 3 ? (
            /* Order Complete */
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-white rounded-lg shadow-sm p-8">
                <div className="flex items-center justify-center mb-6">
                  <CheckCircle className="w-16 h-16 text-green-500 mr-4" />
                  <Mail className="w-12 h-12 text-blue-500" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Order Complete!
                </h1>
                <p className="text-lg text-gray-600 mb-4">
                  Thank you for your purchase. We've sent a confirmation email to <strong>{shippingData.email}</strong> with your order details.
                </p>
                <p className="text-sm text-gray-500 mb-8">
                  Payment: Cash on Delivery
                </p>
                <div className="space-y-4">
                  <Link
                    href="/orders"
                    className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                  >
                    View Order Status
                  </Link>
                  <br />
                  <Link
                    href="/products"
                    className="inline-block text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                  {step === 1 && (
                    /* Shipping Information */
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-6">Shipping Information</h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            First Name *
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            value={shippingData.firstName}
                            onChange={handleShippingChange}
                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                              errors.firstName ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                          {errors.firstName && (
                            <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name *
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            value={shippingData.lastName}
                            onChange={handleShippingChange}
                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                              errors.lastName ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                          {errors.lastName && (
                            <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email *
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={shippingData.email}
                            onChange={handleShippingChange}
                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                              errors.email ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                          {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone *
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={shippingData.phone}
                            onChange={handleShippingChange}
                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                              errors.phone ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                          {errors.phone && (
                            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                          )}
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address *
                          </label>
                          <input
                            type="text"
                            name="address"
                            value={shippingData.address}
                            onChange={handleShippingChange}
                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                              errors.address ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                          {errors.address && (
                            <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                          )}
                        </div>

                        <div className="relative city-dropdown-container">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            City *
                          </label>
                          <input
                            type="text"
                            name="city"
                            value={shippingData.city}
                            onChange={handleShippingChange}
                            onFocus={() => setShowCityDropdown(true)}
                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                              errors.city ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Select a city"
                          />
                          {showCityDropdown && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                              {EGYPTIAN_CITIES.map((city) => (
                                <button
                                  key={city}
                                  type="button"
                                  onClick={() => handleCitySelect(city)}
                                  className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                                >
                                  {city}
                                </button>
                              ))}
                            </div>
                          )}
                          {errors.city && (
                            <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            ZIP Code *
                          </label>
                          <input
                            type="text"
                            name="zipCode"
                            value={shippingData.zipCode}
                            onChange={handleShippingChange}
                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                              errors.zipCode ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                          {errors.zipCode && (
                            <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Country *
                          </label>
                          <input
                            type="text"
                            name="country"
                            value={shippingData.country}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    /* Payment Information */
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Method</h2>
                      
                      <div className="space-y-4">
                        <div className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="cash_on_delivery"
                              checked={paymentData.method === 'cash_on_delivery'}
                              onChange={(e) => setPaymentData({ method: e.target.value })}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                            />
                            <label className="ml-3 block text-sm font-medium text-gray-700">
                              Cash on Delivery
                            </label>
                          </div>
                          <p className="mt-2 text-sm text-gray-500 ml-7">
                            Pay with cash when your order is delivered
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
                    <button
                      onClick={() => setStep(Math.max(1, step - 1))}
                      disabled={step === 1}
                      className="px-6 py-3 sm:py-2.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] sm:min-h-[44px] text-sm sm:text-base touch-manipulation order-2 sm:order-1"
                    >
                      Back
                    </button>

                    {step < 2 ? (
                      <button
                        onClick={handleNext}
                        className="px-6 py-3 sm:py-2.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 min-h-[48px] sm:min-h-[44px] text-sm sm:text-base touch-manipulation order-1 sm:order-2"
                      >
                        Continue
                      </button>
                    ) : (
                      <button
                        onClick={handlePlaceOrder}
                        disabled={loading}
                        className="px-6 py-3 sm:py-2.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] sm:min-h-[44px] text-sm sm:text-base touch-manipulation order-1 sm:order-2"
                      >
                        {loading ? 'Processing...' : 'Place Order'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-900">{formatCurrency(orderTotals.subtotal)}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="text-gray-900">
                        {shippingData.city 
                          ? formatCurrency(orderTotals.shipping)
                          : 'Select city'
                        }
                      </span>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between text-lg font-semibold">
                        <span className="text-gray-900">Total</span>
                        <span className="text-gray-900">
                          {shippingData.city 
                            ? formatCurrency(orderTotals.total)
                            : formatCurrency(orderTotals.subtotal)
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 text-center text-sm text-gray-500">
                    <p>💳 Cash on Delivery</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
