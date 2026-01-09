import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { config } from '../lib/config';
import api, { setAuthToken } from '../lib/api';

export default function SignInPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, setUser } = useAuth();
  
  const [step, setStep] = useState(1); // 1: email input, 2: code input
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    name: ''
  });
  
  const [isNewUser, setIsNewUser] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [expiresIn, setExpiresIn] = useState(600); // 10 minutes

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      const redirectTo = router.query.redirect || '/';
      router.push(redirectTo);
    }
  }, [isAuthenticated, authLoading, router]);

  // Countdown timer for OTP expiry
  useEffect(() => {
    if (step === 2 && expiresIn > 0) {
      const timer = setInterval(() => {
        setExpiresIn(prev => prev > 0 ? prev - 1 : 0);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, expiresIn]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
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

  // Validate email
  const validateEmail = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle send code
  const handleSendCode = async (e) => {
    e.preventDefault();
    
    if (!validateEmail()) {
      return;
    }

    setLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const response = await api.post('/auth/send-code', {
        email: formData.email
      });

      if (response.data.success) {
        setIsNewUser(response.data.data.isNewUser);
        setExpiresIn(response.data.data.expiresIn || 600);
        setSuccessMessage(response.data.message);
        setStep(2);
      }
    } catch (error) {
      console.error('Send code error:', error);
      
      if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      } else {
        setErrors({ general: 'Failed to send verification code. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle verify code
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    
    const newErrors = {};

    if (!formData.code || formData.code.length !== 6) {
      newErrors.code = 'Please enter the 6-digit code';
    }

    if (isNewUser && (!formData.name || formData.name.trim().length === 0)) {
      newErrors.name = 'Name is required for new accounts';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await api.post('/auth/verify-code', {
        email: formData.email,
        code: formData.code,
        name: isNewUser ? formData.name : undefined
      });

      if (response.data.success) {
        // Store the token first
        if (response.data.token) {
          setAuthToken(response.data.token);
        }
        
        // Set user data in context
        if (setUser && response.data.data?.user) {
          setUser(response.data.data.user);
        }
        
        // Show success message
        setSuccessMessage(response.data.message);
        
        // Redirect after short delay
        setTimeout(() => {
          const redirectTo = router.query.redirect || '/';
          router.push(redirectTo);
        }, 1000);
      }
    } catch (error) {
      console.error('Verify code error:', error);
      
      if (error.response?.data?.error === 'NAME_REQUIRED') {
        setIsNewUser(true);
        setErrors({ name: error.response.data.message });
      } else if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      } else {
        setErrors({ general: 'Verification failed. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle resend code
  const handleResendCode = async () => {
    setFormData(prev => ({ ...prev, code: '' }));
    setErrors({});
    await handleSendCode({ preventDefault: () => {} });
  };

  // Show loading spinner while checking auth status
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Don't render if already authenticated
  if (isAuthenticated) {
    return null;
  }

  // Format time remaining
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <Head>
        <title>Sign In - ALKASR</title>
        <meta name="description" content="Sign in to your ALKASR account with just your email." />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Logo */}
          <Link href="/" className="flex justify-center">
            <Image
              src="/el-2aser-logo.png"
              alt="ALKASR"
              width={150}
              height={113}
              className="h-16 w-auto"
              priority
            />
          </Link>
          
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            {step === 1 ? 'Sign in with Email' : 'Enter Verification Code'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {step === 1 ? (
              <>Don't have an account? Just enter your email and we'll create one for you.</>
            ) : (
              <>We sent a 6-digit code to <strong>{formData.email}</strong></>
            )}
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-gray-200">
            {/* Success Message */}
            {successMessage && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4 flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                <div className="text-sm text-green-800">{successMessage}</div>
              </div>
            )}

            {/* General Error */}
            {errors.general && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                <div className="text-sm text-red-600">{errors.general}</div>
              </div>
            )}

            {step === 1 ? (
              // Step 1: Email Input
              <form className="space-y-6" onSubmit={handleSendCode}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="you@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center py-3 sm:py-4 px-4 border border-transparent rounded-lg shadow-sm text-sm sm:text-base font-medium text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all min-h-[48px] sm:min-h-[56px] touch-manipulation"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    By continuing, you agree to ALKASR's{' '}
                    <Link href="/terms" className="text-primary-600 hover:text-primary-500">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-primary-600 hover:text-primary-500">
                      Privacy Policy
                    </Link>
                  </p>
                </div>
              </form>
            ) : (
              // Step 2: Code Input
              <form className="space-y-6" onSubmit={handleVerifyCode}>
                {isNewUser && (
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                      Your Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required={isNewUser}
                      value={formData.name}
                      onChange={handleChange}
                      className={`block w-full px-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {errors.name && (
                      <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>
                )}

                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-900 mb-2">
                    Verification Code
                  </label>
                  <input
                    id="code"
                    name="code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    required
                    value={formData.code}
                    onChange={handleChange}
                    className={`block w-full px-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.code ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="000000"
                    autoComplete="one-time-code"
                  />
                  {errors.code && (
                    <p className="mt-2 text-sm text-red-600">{errors.code}</p>
                  )}
                  
                  <div className="mt-2 flex justify-between items-center text-sm">
                    <span className="text-gray-500">
                      {expiresIn > 0 ? `Expires in ${formatTime(expiresIn)}` : 'Code expired'}
                    </span>
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={loading || expiresIn > 540} // Can resend after 1 minute
                      className="text-primary-600 hover:text-primary-500 disabled:text-gray-400 disabled:cursor-not-allowed font-medium"
                    >
                      Resend Code
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center py-3 sm:py-4 px-4 border border-transparent rounded-lg shadow-sm text-sm sm:text-base font-medium text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all min-h-[48px] sm:min-h-[56px] touch-manipulation"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Verify & Continue'
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setFormData({ email: formData.email, code: '', name: '' });
                      setErrors({});
                    }}
                    className="w-full py-3 sm:py-4 px-4 border border-gray-300 rounded-lg shadow-sm text-sm sm:text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors min-h-[48px] sm:min-h-[56px] touch-manipulation"
                  >
                    Change Email
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
