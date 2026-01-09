import Head from 'next/head';
import { Mail, Phone, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function ContactPage() {
  const { t, isRTL } = useLanguage();

  return (
    <>
      <Head>
        <title>Contact Us - eCommerce</title>
        <meta name="description" content="Get in touch with us. We're here to help with any questions or concerns." />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                {t('contactUs')}
              </h1>
              <p className="text-xl text-primary-100 max-w-2xl mx-auto">
                {t('loveToHearFromYou')}
              </p>
            </div>
          </div>
        </div>

        {/* Contact Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-3xl mx-auto">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  {t('getInTouch')}
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  {t('hereToHelp')}
                </p>
              </div>

              {/* Contact Methods */}
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-6 h-6 text-primary-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{t('emailUs')}</h3>
                    <p className="text-gray-600 mb-2">{t('sendEmailResponse')}</p>
                    <a 
                      href="mailto:nourabdelreheemali@gmail.com" 
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      nourabdelreheemali@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Phone className="w-6 h-6 text-primary-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{t('callUs')}</h3>
                    <p className="text-gray-600 mb-2">{t('monFriHours')}</p>
                    <a 
                      href="tel:+201055661002" 
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      +201055661002
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-primary-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Business Hours</h3>
                    <p className="text-gray-600">
                      Serving You 24/7
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {t('frequentlyAskedQuestions')}
              </h2>
              <p className="text-lg text-gray-600">
                {t('quickAnswersToCommonQuestions')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  question: t('shippingOptionsQuestion'),
                  answer: t('shippingOptionsAnswer')
                },
                {
                  question: t('returnPolicyQuestion'),
                  answer: t('returnPolicyAnswer')
                },
                {
                  question: t('trackOrderQuestion'),
                  answer: t('trackOrderAnswer')
                }
              ].map((faq, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
