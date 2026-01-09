import { useState } from 'react';
import Head from 'next/head';
import { Search, ChevronDown, ChevronRight, MessageCircle, Mail, Phone } from 'lucide-react';

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const helpCategories = [
    {
      title: 'Orders & Shipping',
      icon: '📦',
      topics: [
        'How to track my order',
        'Shipping times and costs',
        'Order modifications',
        'International shipping'
      ]
    },
    {
      title: 'Returns & Refunds',
      icon: '↩️',
      topics: [
        'Return policy',
        'How to return an item',
        'Refund processing time',
        'Exchange process'
      ]
    },
    {
      title: 'Account & Payment',
      icon: '💳',
      topics: [
        'Account registration',
        'Payment methods',
        'Security and privacy',
        'Account management'
      ]
    },
    {
      title: 'Products',
      icon: '🛍️',
      topics: [
        'Product information',
        'Stock availability',
        'Product reviews',
        'Warranty information'
      ]
    }
  ];

  const faqs = [
    {
      category: 'General',
      questions: [
        {
          question: 'How do I create an account?',
          answer: 'You can create an account by clicking the "Sign Up" button in the top right corner of our website. Fill in your details and verify your email address to get started.'
        },
        {
          question: 'Do I need an account to place an order?',
          answer: 'While you can browse our products without an account, you\'ll need to create one to place orders, track shipments, and access your order history.'
        },
        {
          question: 'How do I track my order?',
          answer: 'Once your order ships, you\'ll receive a tracking number via email. You can also track your order by logging into your account and visiting the "My Orders" section.'
        }
      ]
    },
    {
      category: 'Shipping',
      questions: [
        {
          question: 'What are your shipping options?',
          answer: 'We offer standard shipping (5-7 business days) and express shipping (2-3 business days). Free shipping is available on orders over $100.'
        },
        {
          question: 'Do you ship internationally?',
          answer: 'Yes, we ship to most countries worldwide. International shipping costs and delivery times vary by destination.'
        },
        {
          question: 'Can I change my shipping address after placing an order?',
          answer: 'You can change your shipping address within 1 hour of placing your order. After that, please contact customer service for assistance.'
        }
      ]
    },
    {
      category: 'Returns',
      questions: [
        {
          question: 'What is your return policy?',
          answer: 'We accept returns within 30 days of purchase. Items must be unused, in original packaging, and in the same condition you received them.'
        },
        {
          question: 'How do I return an item?',
          answer: 'To return an item, log into your account, go to "My Orders," and select "Return Item" next to the product you want to return. Follow the instructions to print a return label.'
        },
        {
          question: 'How long does it take to process a refund?',
          answer: 'Refunds are typically processed within 5-7 business days after we receive your returned item. The refund will appear on your original payment method.'
        }
      ]
    },
    {
      category: 'Payment',
      questions: [
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and digital wallets like Apple Pay and Google Pay.'
        },
        {
          question: 'Is my payment information secure?',
          answer: 'Yes, we use industry-standard SSL encryption to protect your payment information. We never store your full credit card details on our servers.'
        },
        {
          question: 'Can I save my payment information for future purchases?',
          answer: 'Yes, you can securely save your payment information in your account for faster checkout. You can manage saved payment methods in your account settings.'
        }
      ]
    }
  ];

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  const toggleFaq = (categoryIndex, questionIndex) => {
    const faqId = `${categoryIndex}-${questionIndex}`;
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  return (
    <>
      <Head>
        <title>Help Center - eCommerce</title>
        <meta name="description" content="Find answers to your questions and get help with your orders, shipping, returns, and more." />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              How can we help you?
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              Search our help articles or browse categories below
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for help articles..."
                className="block w-full pl-10 pr-3 py-3 border border-transparent rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Help Categories */}
          {!searchQuery && (
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                Browse Help Topics
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {helpCategories.map((category, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                    <div className="text-center">
                      <div className="text-4xl mb-4">{category.icon}</div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        {category.title}
                      </h3>
                      <ul className="space-y-2 text-sm text-gray-600">
                        {category.topics.map((topic, topicIndex) => (
                          <li key={topicIndex} className="hover:text-primary-600 cursor-pointer">
                            {topic}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQ Section */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              {searchQuery ? 'Search Results' : 'Frequently Asked Questions'}
            </h2>

            {filteredFaqs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">
                  No results found for "{searchQuery}"
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto">
                {filteredFaqs.map((category, categoryIndex) => (
                  <div key={categoryIndex} className="mb-8">
                    {!searchQuery && (
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        {category.category}
                      </h3>
                    )}
                    
                    <div className="space-y-4">
                      {category.questions.map((faq, questionIndex) => {
                        const faqId = `${categoryIndex}-${questionIndex}`;
                        const isExpanded = expandedFaq === faqId;
                        
                        return (
                          <div key={questionIndex} className="bg-white rounded-lg shadow-sm">
                            <button
                              onClick={() => toggleFaq(categoryIndex, questionIndex)}
                              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                            >
                              <span className="font-medium text-gray-900">
                                {faq.question}
                              </span>
                              {isExpanded ? (
                                <ChevronDown className="w-5 h-5 text-gray-500" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-gray-500" />
                              )}
                            </button>
                            
                            {isExpanded && (
                              <div className="px-6 pb-4">
                                <div className="border-t border-gray-200 pt-4">
                                  <p className="text-gray-600 leading-relaxed">
                                    {faq.answer}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contact Support */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Still need help?
              </h2>
              <p className="text-gray-600">
                Our customer support team is here to help you with any questions or concerns.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Chat with our support team in real-time
                </p>
                <button className="text-primary-600 hover:text-primary-700 font-medium">
                  Start Chat
                </button>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Send us an email and we'll respond within 24 hours
                </p>
                <a
                  href="mailto:support@ecommerce.com"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Send Email
                </a>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Phone Support</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Call us Monday through Friday, 8am to 5pm
                </p>
                <a
                  href="tel:+1234567890"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  +1 (234) 567-890
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
