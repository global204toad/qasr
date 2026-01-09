import { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { Star, Users, Award, Truck, Shield, Heart } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function AboutPage() {
  const { t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState('story');

  const stats = [
    { number: '10,000+', label: t('happyCustomers'), icon: Users },
    { number: '5,000+', label: t('productsSold'), icon: Award },
    { number: '50+', label: t('productCategoriesCount'), icon: Shield },
    { number: '4.9', label: t('averageRating'), icon: Star }
  ];

  const values = [
    {
      icon: Heart,
      title: t('qualityFirst'),
      description: t('qualityFirstDesc')
    },
    {
      icon: Users,
      title: t('customerFocused'),
      description: t('customerFocusedDesc')
    },
    {
      icon: Shield,
      title: t('trustReliability'),
      description: t('trustReliabilityDesc')
    },
    {
      icon: Truck,
      title: t('fastDelivery'),
      description: t('fastDeliveryDesc')
    }
  ];


  return (
    <>
      <Head>
        <title>About Us - eCommerce</title>
        <meta name="description" content="Learn about our company, mission, and the team behind our success." />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                {t('aboutOurStory')}
              </h1>
              <p className="text-xl text-primary-100 max-w-3xl mx-auto">
                {t('passionateAboutProducts')}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 text-primary-600 rounded-full mb-4">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {stat.number}
                    </div>
                    <div className="text-gray-600">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Tab Navigation */}
          <div className="flex justify-center mb-12">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {[
                { id: 'story', label: t('ourStory') },
                { id: 'mission', label: t('missionVision') }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="max-w-4xl mx-auto">
            {/* Our Story Tab */}
            {activeTab === 'story' && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    {t('howItAllStarted')}
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="space-y-6">
                    <p className="text-lg text-gray-600 leading-relaxed">
                      {t('ourJourneyBegan')}
                    </p>
                    
                    <p className="text-gray-600 leading-relaxed">
                      {t('weBelieveGoodFood')}
                    </p>
                    
                    <p className="text-gray-600 leading-relaxed">
                      {t('todayWeAreProud')}
                    </p>
                  </div>
                  
                  <div className="relative">
                    <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                      <img
                        src="/images/el 7ag.jpg"
                        alt="Our Story - ALKASR Store"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mission & Vision Tab */}
            {activeTab === 'mission' && (
              <div className="space-y-12">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    {t('missionVision')}
                  </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Mission */}
                  <div className="text-center bg-gray-50 p-8 rounded-lg">
                    <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Heart className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('ourMission')}</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {t('ourMissionText')}
                    </p>
                  </div>

                  {/* Vision */}
                  <div className="text-center bg-gray-50 p-8 rounded-lg">
                    <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Star className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('ourVision')}</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {t('ourVisionText')}
                    </p>
                  </div>
                </div>

                {/* Values */}
                <div className="mt-16">
                  <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">{t('ourValues')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {values.map((value, index) => {
                      const IconComponent = value.icon;
                      return (
                        <div key={index} className="text-center p-6">
                          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 text-primary-600 rounded-full mb-4">
                            <IconComponent className="w-6 h-6" />
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-2">{value.title}</h4>
                          <p className="text-sm text-gray-600">{value.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('getInTouch')}
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              {t('haveQuestions')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
              >
                {t('contactUs')}
              </a>
              <a
                href="/products"
                className="inline-flex items-center px-6 py-3 border-2 border-primary-600 text-primary-600 font-semibold rounded-lg hover:bg-primary-600 hover:text-white transition-colors"
              >
                {t('shopNow')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
