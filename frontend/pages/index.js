import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Star, ShoppingBag, Users, Award, Truck } from 'lucide-react';
import { productsAPI } from '../lib/api';
import { formatCurrency } from '../lib/utils';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useLanguage } from '../contexts/LanguageContext';
import SEOHead from '../components/SEOHead';
import {
  DEFAULT_META,
  getOrganizationSchema,
  getLocalBusinessSchema,
  getWebSiteSchema
} from '../lib/seo';

export default function HomePage() {
  const { t, isRTL, language } = useLanguage();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await productsAPI.getFeatured(8);
        setFeaturedProducts(response.data.data);
      } catch (error) {
        console.error('Failed to fetch featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // Generate structured data for homepage
  const structuredData = [
    getOrganizationSchema(),
    getLocalBusinessSchema(),
    getWebSiteSchema()
  ];

  return (
    <>
      <SEOHead
        title={DEFAULT_META.home.title[language]}
        description={DEFAULT_META.home.description[language]}
        jsonLd={structuredData}
      />

      <div className="min-h-screen cream-gradient">
        {/* Hero Section */}
        <section className="relative cream-gradient text-luxury-burgundy">
          <div className="absolute inset-0 bg-luxury-cream-medium opacity-30"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 md:py-32">
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-luxury-burgundy">
                {t('welcomeTo')}
              </h1>
              <div className="flex justify-center mb-6 sm:mb-8">
                <Image
                  src="/el-2aser-logo.png"
                  alt="ALKASR - عطارة وتحميص حبات القصر"
                  width={400}
                  height={300}
                  className="drop-shadow-2xl w-full max-w-[250px] sm:max-w-[300px] md:max-w-[400px] h-auto"
                  priority
                />
              </div>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 max-w-3xl mx-auto text-luxury-burgundy-light px-2">
                {t('discoverPremiumProducts')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
                <Link href="/products" className="btn-primary px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold min-h-[48px] sm:min-h-[56px] flex items-center justify-center">
                  {t('shopCollection')}
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
                <Link href="/about" className="btn-outline px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold min-h-[48px] sm:min-h-[56px] flex items-center justify-center">
                  {t('ourStoryButton')}
                </Link>
              </div>
            </div>
          </div>

          {/* Hero Decorative Elements */}
          <div className="absolute bottom-0 right-0 hidden lg:block">
            <div className="w-64 h-64 gold-gradient opacity-20 rounded-tl-full"></div>
          </div>
          <div className="absolute top-20 left-10 hidden lg:block">
            <div className="w-32 h-32 burgundy-gradient opacity-10 rounded-full"></div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-8 sm:py-12 md:py-16 bg-luxury-cream-light border-t border-gold-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-luxury-burgundy mb-3 sm:mb-4">
                {t('whyChooseAlkasr')}
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-luxury-burgundy-light max-w-2xl mx-auto px-2">
                {t('luxuryExperience')}
              </p>
            </div>

            <div className="grid grid-cols-4 gap-4 sm:gap-6 md:gap-8">
              {[
                {
                  icon: <Truck className="w-8 h-8" />,
                  title: t('premiumDelivery'),
                  description: t('premiumDeliveryDesc')
                },
                {
                  icon: <Award className="w-8 h-8" />,
                  title: t('luxuryGuarantee'),
                  description: t('luxuryGuaranteeDesc')
                },
                {
                  icon: <Users className="w-8 h-8" />,
                  title: t('conciergeSupport'),
                  description: t('conciergeSupportDesc')
                },
                {
                  icon: <ShoppingBag className="w-8 h-8" />,
                  title: t('vipReturns'),
                  description: t('vipReturnsDesc')
                }
              ].map((feature, index) => (
                <div key={index} className="text-center p-4 sm:p-6 bg-luxury-cream rounded-lg border border-gold-600 hover:shadow-xl hover:border-gold-400 transition-all duration-300 group">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 gold-gradient text-luxury-cream rounded-full mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold text-luxury-burgundy mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm md:text-base text-luxury-burgundy-light">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="py-8 sm:py-12 md:py-16 burgundy-gradient border-t border-gold-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-luxury-cream mb-3 sm:mb-4">
                {t('featuredCollection')}
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-luxury-cream-medium px-2">
                {t('discoverCovetedProducts')}
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center">
                <LoadingSpinner size="lg" text={t('loadingProducts')} />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-4 gap-6">
                  {featuredProducts.slice(0, 8).map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                <div className="text-center mt-8 sm:mt-12">
                  <Link href="/products" className="btn-primary px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold min-h-[48px] sm:min-h-[56px] inline-flex items-center justify-center">
                    {t('exploreFullCollection')}
                    <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-8 sm:py-12 md:py-16 gold-gradient text-luxury-cream border-t border-gold-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 text-center">
              {[
                { number: '10,000+', label: t('eliteCustomers') },
                { number: '5,000+', label: t('luxuryItemsSold') },
                { number: '50+', label: t('premiumCategories') },
                { number: '4.9', label: t('exceptionalRating') }
              ].map((stat, index) => (
                <div key={index} className="group py-2">
                  <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-1 sm:mb-2 group-hover:scale-110 transition-transform duration-300">
                    {stat.number}
                  </div>
                  <div className="text-xs sm:text-sm md:text-base text-luxury-cream-medium font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-8 sm:py-12 md:py-16 cream-gradient border-t border-gold-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-luxury-burgundy mb-3 sm:mb-4">
                {t('whatOurClientsSay')} <span className="burgundy-text">{t('clients')}</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {[
                {
                  name: t('sarahJohnson'),
                  title: t('fashionExecutive'),
                  rating: 5,
                  comment: t('sarahComment'),
                  avatar: 'SJ'
                },
                {
                  name: t('michaelChen'),
                  title: t('businessOwner'),
                  rating: 5,
                  comment: t('michaelComment'),
                  avatar: 'MC'
                },
                {
                  name: t('emilyDavis'),
                  title: t('interiorDesigner'),
                  rating: 5,
                  comment: t('emilyComment'),
                  avatar: 'ED'
                }
              ].map((testimonial, index) => (
                <div key={index} className="bg-luxury-cream p-4 sm:p-6 rounded-lg border border-gold-600 shadow-xl hover:border-gold-400 transition-all duration-300">
                  <div className="flex items-center mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 gold-gradient text-luxury-cream rounded-full flex items-center justify-center font-bold mr-3 sm:mr-4 flex-shrink-0">
                      {testimonial.avatar}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-sm sm:text-base text-luxury-burgundy truncate">{testimonial.name}</h4>
                      <p className="text-luxury-burgundy-light text-xs sm:text-sm truncate">{testimonial.title}</p>
                      <div className="flex items-center mt-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 text-gold-600 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm md:text-base text-luxury-burgundy-light italic">"{testimonial.comment}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

HomePage.getLayout = function getLayout(page) {
  return page;
};

