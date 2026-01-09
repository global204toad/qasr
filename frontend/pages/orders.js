import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../lib/utils';
import { ordersAPI } from '../lib/api';

export default function OrdersPage() {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock orders data - replace with API call
  const mockOrders = [
    {
      _id: '1',
      orderNumber: 'ORD-2024-001',
      status: 'delivered',
      total: 129.99,
      items: [
        { name: 'Wireless Headphones', quantity: 1, price: 99.99 },
        { name: 'Phone Case', quantity: 2, price: 15.00 }
      ],
      shippingAddress: {
        name: 'John Doe',
        address: '123 Main St, City, State 12345'
      },
      createdAt: '2024-01-15T10:30:00Z',
      deliveredAt: '2024-01-18T14:20:00Z'
    },
    {
      _id: '2',
      orderNumber: 'ORD-2024-002',
      status: 'shipped',
      total: 75.50,
      items: [
        { name: 'Book Set', quantity: 3, price: 25.00 }
      ],
      shippingAddress: {
        name: 'John Doe',
        address: '123 Main St, City, State 12345'
      },
      createdAt: '2024-01-20T09:15:00Z',
      shippedAt: '2024-01-21T16:45:00Z'
    },
    {
      _id: '3',
      orderNumber: 'ORD-2024-003',
      status: 'processing',
      total: 199.99,
      items: [
        { name: 'Smart Watch', quantity: 1, price: 199.99 }
      ],
      shippingAddress: {
        name: 'John Doe',
        address: '123 Main St, City, State 12345'
      },
      createdAt: '2024-01-22T11:00:00Z'
    },
    {
      _id: '4',
      orderNumber: 'ORD-2024-004',
      status: 'completed',
      total: 249.99,
      items: [
        { name: 'Laptop Stand', quantity: 1, price: 149.99 },
        { name: 'Wireless Mouse', quantity: 2, price: 50.00 }
      ],
      shippingAddress: {
        name: 'John Doe',
        address: '123 Main St, City, State 12345'
      },
      createdAt: '2024-01-10T08:00:00Z',
      completedAt: '2024-01-25T16:00:00Z'
    }
  ];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Try to fetch from API with status filter for completed orders only
        try {
          const response = await ordersAPI.getAll({ status: 'completed' });
          if (response.data && response.data.success) {
            setOrders(response.data.data || []);
          } else {
            // Fallback to mock data filtered for completed orders
            const filteredOrders = mockOrders.filter(order => order.status === 'completed');
            setOrders(filteredOrders);
          }
        } catch (apiError) {
          // If API fails, use mock data filtered for completed orders
          console.log('API not available, using mock data');
          const filteredOrders = mockOrders.filter(order => order.status === 'completed');
          setOrders(filteredOrders);
        }
      } catch (err) {
        setError('Failed to load orders');
        console.error('Error fetching orders:', err);
        // Fallback to empty array or mock data
        const filteredOrders = mockOrders.filter(order => order.status === 'completed');
        setOrders(filteredOrders);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-blue-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isAuthenticated) {
    return (
      <>
        <Head>
          <title>Orders - eCommerce</title>
          <meta name="description" content="View and track your orders." />
        </Head>

        <div className="min-h-screen bg-gray-50 py-16">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Sign in to view your orders
              </h1>
              <p className="text-gray-600 mb-8">
                Please sign in to your account to view your order history and track current orders.
              </p>
              <Link
                href="/sign-in"
                className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>My Orders - eCommerce</title>
        <meta name="description" content="View and track your orders and order history." />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-600 mt-2">
              Track and manage your orders
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="text-red-600 mb-4">{error}</div>
              <button
                onClick={() => window.location.reload()}
                className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
              >
                Try Again
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                No orders yet
              </h2>
              <p className="text-gray-600 mb-8">
                Start shopping to see your orders here
              </p>
              <Link
                href="/products"
                className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order._id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                  {/* Order Header */}
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.orderNumber}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Placed on {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1 capitalize">{order.status}</span>
                        </span>
                        <span className="text-lg font-semibold text-gray-900">
                          {formatCurrency(order.total)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="px-6 py-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Items */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Items</h4>
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="text-gray-600">
                                {item.name} × {item.quantity}
                              </span>
                              <span className="text-gray-900">
                                {formatCurrency(item.price * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Shipping Address</h4>
                        <div className="text-sm text-gray-600">
                          <p>{order.shippingAddress.name}</p>
                          <p>{order.shippingAddress.address}</p>
                        </div>
                      </div>
                    </div>

                    {/* Order Timeline */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Order Timeline</h4>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          <span className="text-gray-600">
                            Order placed on {formatDate(order.createdAt)}
                          </span>
                        </div>
                        
                        {order.status !== 'processing' && (
                          <div className="flex items-center text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            <span className="text-gray-600">
                              Order shipped on {formatDate(order.shippedAt || order.createdAt)}
                            </span>
                          </div>
                        )}
                        
                        {order.status === 'delivered' && (
                          <div className="flex items-center text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            <span className="text-gray-600">
                              Order delivered on {formatDate(order.deliveredAt)}
                            </span>
                          </div>
                        )}
                        
                        {order.status === 'completed' && (
                          <div className="flex items-center text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            <span className="text-gray-600">
                              Order completed on {formatDate(order.completedAt || order.deliveredAt || order.createdAt)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between items-center">
                      <div className="flex space-x-4">
                        <Link
                          href={`/orders/${order._id}`}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          View Details
                        </Link>
                        {(order.status === 'delivered' || order.status === 'completed') && (
                          <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                            Reorder
                          </button>
                        )}
                        {(order.status === 'processing' || order.status === 'shipped') && (
                          <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                            Cancel Order
                          </button>
                        )}
                      </div>
                      
                      {order.status === 'shipped' && (
                        <button className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors">
                          Track Package
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
