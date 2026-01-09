import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, Star, ArrowRight, Award } from 'lucide-react';
import { productsAPI } from '../lib/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useLanguage } from '../contexts/LanguageContext';
import SEOHead from '../components/SEOHead';
import { getOrganizationSchema } from '../lib/seo';

export default function M7msaPage() {
    const { t, language, translateProduct } = useLanguage();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRoastedProducts = async () => {
            try {
                // Fetch all products (we'll show roasted/peanuts categories)
                const response = await productsAPI.getAll({ limit: 20 });
                setProducts(response.data.data || []);
            } catch (error) {
                console.error('Failed to fetch roasted products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRoastedProducts();
    }, []);

    const seoTitle = language === 'ar'
        ? 'محمصات فاخرة - القصر | Premium Roasted Products - ALKASR'
        : 'Premium Roasted Products - ALKASR | محمصات فاخرة - القصر';

    const seoDescription = language === 'ar'
        ? 'محمصات ومقرمشات فاخرة من القصر (ALKASR) - سوداني محمص، مكسرات محمصة، ولب بأنواعه. أفضل المحمصات الطبيعية بجودة عالية. m7msa, mo7amsa, roasted nuts, قصر المحمصة'
        : 'Premium roasted products from ALKASR (القصر) - roasted peanuts, roasted nuts, and seeds. Best quality traditional roasting. محمصات فاخرة، m7msa, mo7amsa, qasr roasted';

    return (
        <>
            <SEOHead
                title={seoTitle}
                description={seoDescription}
                keywords={[
                    'محمصه', 'محمصة', 'm7msa', 'mo7amsa', 'roasted', 'قصر', 'qasr', 'alkasr',
                    'سوداني', 'peanuts', 'مقرمشات', 'snacks', 'لب', 'seeds',
                    'محمصات', 'roasted nuts', 'محمصات فاخرة', 'premium roasted'
                ]}
                jsonLd={getOrganizationSchema()}
            />

            <div className="min-h-screen cream-gradient">
                {/* Hero Section */}
                <section className="relative burgundy-gradient text-luxury-cream py-16 md:py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 gold-gradient rounded-full mb-6">
                                <Flame className="w-10 h-10 md:w-12 md:h-12" />
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                                {language === 'ar' ? (
                                    <>
                                        محمصات فاخرة من <span className="text-gold-400">القصر</span>
                                    </>
                                ) : (
                                    <>
                                        Premium Roasted Products from <span className="text-gold-400">ALKASR</span>
                                    </>
                                )}
                            </h1>

                            <p className="text-xl md:text-2xl mb-4 text-luxury-cream-medium max-w-3xl mx-auto">
                                {language === 'ar'
                                    ? 'أفضل المحمصات الطبيعية - سوداني محمص، مكسرات محمصة، ولب بأنواعه'
                                    : 'Best Natural Roasted Products - Roasted Peanuts, Roasted Nuts, and Seeds'
                                }
                            </p>

                            <div className="flex flex-wrap gap-2 justify-center text-sm md:text-base text-luxury-cream-light">
                                <span className="px-3 py-1 bg-luxury-cream/20 rounded-full">محمصه</span>
                                <span className="px-3 py-1 bg-luxury-cream/20 rounded-full">M7msa</span>
                                <span className="px-3 py-1 bg-luxury-cream/20 rounded-full">Roasted</span>
                                <span className="px-3 py-1 bg-luxury-cream/20 rounded-full">قصر المحمصة</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="py-16 bg-luxury-cream-light">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl md:text-4xl font-bold text-luxury-burgundy text-center mb-12">
                            {language === 'ar' ? 'لماذا محمصات القصر؟' : 'Why ALKASR Roasted Products?'}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="text-center p-6 bg-luxury-cream rounded-lg border border-gold-600">
                                <Flame className="w-12 h-12 text-gold-600 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-luxury-burgundy mb-2">
                                    {language === 'ar' ? 'تحميص تقليدي' : 'Traditional Roasting'}
                                </h3>
                                <p className="text-luxury-burgundy-light">
                                    {language === 'ar'
                                        ? 'محمصة بطريقة تقليدية على نار هادئة للحفاظ على النكهة'
                                        : 'Traditionally roasted over low heat to preserve flavor'
                                    }
                                </p>
                            </div>

                            <div className="text-center p-6 bg-luxury-cream rounded-lg border border-gold-600">
                                <Award className="w-12 h-12 text-gold-600 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-luxury-burgundy mb-2">
                                    {language === 'ar' ? 'طازجة يومياً' : 'Fresh Daily'}
                                </h3>
                                <p className="text-luxury-burgundy-light">
                                    {language === 'ar'
                                        ? 'نحمص منتجاتنا يومياً لضمان أقصى درجات الطزاجة'
                                        : 'We roast our products daily to ensure maximum freshness'
                                    }
                                </p>
                            </div>

                            <div className="text-center p-6 bg-luxury-cream rounded-lg border border-gold-600">
                                <Star className="w-12 h-12 text-gold-600 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-luxury-burgundy mb-2">
                                    {language === 'ar' ? 'بدون إضافات' : 'No Additives'}
                                </h3>
                                <p className="text-luxury-burgundy-light">
                                    {language === 'ar'
                                        ? 'منتجات طبيعية 100% بدون مواد حافظة أو إضافات صناعية'
                                        : '100% natural products without preservatives or artificial additives'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Products Section */}
                <section className="py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl md:text-4xl font-bold text-luxury-burgundy text-center mb-12">
                            {language === 'ar' ? 'تصفح محمصاتنا' : 'Browse Our Roasted Products'}
                        </h2>

                        {loading ? (
                            <div className="flex justify-center">
                                <LoadingSpinner size="lg" />
                            </div>
                        ) : products.length > 0 ? (
                            <>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {products.slice(0, 12).map((product) => (
                                        <ProductCard key={product._id} product={product} />
                                    ))}
                                </div>

                                <div className="text-center mt-12">
                                    <Link href="/products" className="btn-primary px-8 py-4 text-lg font-semibold inline-flex items-center">
                                        {language === 'ar' ? 'عرض جميع المنتجات' : 'View All Products'}
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <p className="text-center text-luxury-burgundy-light">
                                {language === 'ar' ? 'لا توجد منتجات متاحة حالياً' : 'No products available at the moment'}
                            </p>
                        )}
                    </div>
                </section>

                {/* SEO Content Section */}
                <section className="py-16 bg-luxury-cream-light">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="prose prose-lg max-w-none">
                            {language === 'ar' ? (
                                <>
                                    <h2 className="text-2xl font-bold text-luxury-burgundy mb-4">محمصات القصر - تحميص تقليدي بجودة عالية</h2>
                                    <p className="text-luxury-burgundy-light mb-4">
                                        القصر (ALKASR) متخصصون في تقديم أفضل المحمصات والمقرمشات في مصر. نستخدم طرق التحميص التقليدية التي توارثناها عبر الأجيال لضمان الحصول على أفضل نكهة وأعلى جودة.
                                    </p>
                                    <p className="text-luxury-burgundy-light mb-4">
                                        تشمل منتجاتنا من المحمصات (m7msa, mo7amsa) السوداني المحمص بأنواعه، المكسرات المحمصة، اللب السوري، واللب الأبيض، والمقرمشات السورية. جميع منتجاتنا طبيعية 100% بدون مواد حافظة.
                                    </p>
                                    <h3 className="text-xl font-bold text-luxury-burgundy mb-3">أنواع المحمصات المتوفرة</h3>
                                    <ul className="list-disc list-inside text-luxury-burgundy-light mb-4">
                                        <li>سوداني أسواني محمص</li>
                                        <li>سوداني حلواني</li>
                                        <li>سوداني بالعسل والسمسم</li>
                                        <li>سوداني بطعم الجبنة والكاتشب</li>
                                        <li>لب سوري ولب أبيض</li>
                                        <li>مقرمشات سورية بالشطة والجبنة</li>
                                    </ul>
                                </>
                            ) : (
                                <>
                                    <h2 className="text-2xl font-bold text-luxury-burgundy mb-4">ALKASR Roasted Products - Traditional Roasting with High Quality</h2>
                                    <p className="text-luxury-burgundy-light mb-4">
                                        ALKASR (القصر) specializes in providing the best roasted products and snacks in Egypt. We use traditional roasting methods passed down through generations to ensure the best flavor and highest quality.
                                    </p>
                                    <p className="text-luxury-burgundy-light mb-4">
                                        Our roasted products (محمصات, m7msa, mo7amsa) include various types of roasted peanuts, roasted nuts, Syrian seeds, white seeds, and Syrian snacks. All our products are 100% natural without preservatives.
                                    </p>
                                    <h3 className="text-xl font-bold text-luxury-burgundy mb-3">Available Roasted Products</h3>
                                    <ul className="list-disc list-inside text-luxury-burgundy-light mb-4">
                                        <li>Aswani Roasted Peanuts</li>
                                        <li>Halawani Peanuts</li>
                                        <li>Honey Sesame Peanuts</li>
                                        <li>Cheese and Ketchup Flavored Peanuts</li>
                                        <li>Syrian and White Seeds</li>
                                        <li>Syrian Snacks with Chili and Cheese</li>
                                    </ul>
                                </>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
