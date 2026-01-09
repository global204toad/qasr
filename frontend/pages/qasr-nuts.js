import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Crown, Star, ArrowRight, Award, Truck, Shield } from 'lucide-react';
import { productsAPI } from '../lib/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useLanguage } from '../contexts/LanguageContext';
import SEOHead from '../components/SEOHead';
import { getOrganizationSchema, getLocalBusinessSchema } from '../lib/seo';

export default function QasrNutsPage() {
    const { t, language, translateProduct } = useLanguage();
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeaturedProducts = async () => {
            try {
                const response = await productsAPI.getFeatured(12);
                setFeaturedProducts(response.data.data || []);
            } catch (error) {
                console.error('Failed to fetch featured products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedProducts();
    }, []);

    const seoTitle = language === 'ar'
        ? 'قصر المكسرات والمحمصة - ALKASR | Qasr El Qasr Nuts & Roasted Products'
        : 'Qasr El Qasr Nuts & Roasted Products - ALKASR | قصر المكسرات والمحمصة';

    const seoDescription = language === 'ar'
        ? 'قصر المكسرات (Qasr, El Qasr, ALKASR) - أفضل محل مكسرات ومحمصات في مصر. فستق إيراني، كاجو، لوز، سوداني محمص، ولب. جودة فاخرة وتوصيل سريع. qasr nuts, el qasr, قصر'
        : 'Qasr Nuts (قصر, القصر, ALKASR) - Best nuts and roasted products store in Egypt. Iranian pistachios, cashews, almonds, roasted peanuts, and seeds. Premium quality and fast delivery. مكسرات القصر';

    return (
        <>
            <SEOHead
                title={seoTitle}
                description={seoDescription}
                keywords={[
                    'qasr', 'el qasr', 'قصر', 'القصر', 'alkasr', 'antigravity',
                    'qasr nuts', 'el qasr nuts', 'قصر المكسرات', 'قصر المحمصة',
                    'مكسرات', 'maksrat', 'محمصه', 'm7msa', 'لب', 'nuts', 'roasted',
                    'فستق', 'كاجو', 'لوز', 'سوداني', 'pistachios', 'cashews', 'almonds', 'peanuts',
                    'egypt nuts', 'cairo nuts', 'مصر', 'القاهرة'
                ]}
                jsonLd={[getOrganizationSchema(), getLocalBusinessSchema()]}
            />

            <div className="min-h-screen cream-gradient">
                {/* Hero Section */}
                <section className="relative burgundy-gradient text-luxury-cream py-20 md:py-32">
                    <div className="absolute inset-0 bg-luxury-burgundy opacity-20"></div>
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-24 h-24 md:w-32 md:h-32 gold-gradient rounded-full mb-8">
                                <Crown className="w-12 h-12 md:w-16 md:h-16" />
                            </div>

                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
                                {language === 'ar' ? (
                                    <>
                                        <span className="text-gold-400">القصر</span> للمكسرات والمحمصة
                                    </>
                                ) : (
                                    <>
                                        <span className="text-gold-400">QASR</span> Nuts & Roasted Products
                                    </>
                                )}
                            </h1>

                            <p className="text-2xl md:text-3xl mb-6 text-luxury-cream-medium max-w-4xl mx-auto">
                                {language === 'ar'
                                    ? 'وجهتك الأولى للمكسرات والمحمصات الفاخرة في مصر'
                                    : 'Your Premier Destination for Premium Nuts & Roasted Products in Egypt'
                                }
                            </p>

                            <div className="flex flex-wrap gap-3 justify-center text-base md:text-lg text-luxury-cream-light mb-8">
                                <span className="px-4 py-2 bg-luxury-cream/20 rounded-full font-semibold">Qasr</span>
                                <span className="px-4 py-2 bg-luxury-cream/20 rounded-full font-semibold">El Qasr</span>
                                <span className="px-4 py-2 bg-luxury-cream/20 rounded-full font-semibold">قصر</span>
                                <span className="px-4 py-2 bg-luxury-cream/20 rounded-full font-semibold">القصر</span>
                                <span className="px-4 py-2 bg-luxury-cream/20 rounded-full font-semibold">ALKASR</span>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/products" className="btn-primary px-8 py-4 text-lg font-semibold inline-flex items-center justify-center">
                                    {language === 'ar' ? 'تسوق الآن' : 'Shop Now'}
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Link>
                                <Link href="/about" className="btn-outline px-8 py-4 text-lg font-semibold inline-flex items-center justify-center border-luxury-cream text-luxury-cream hover:bg-luxury-cream hover:text-luxury-burgundy">
                                    {language === 'ar' ? 'من نحن' : 'About Us'}
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Why Choose Qasr Section */}
                <section className="py-16 bg-luxury-cream-light">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-4xl md:text-5xl font-bold text-luxury-burgundy text-center mb-4">
                            {language === 'ar' ? 'لماذا القصر؟' : 'Why Qasr?'}
                        </h2>
                        <p className="text-xl text-luxury-burgundy-light text-center mb-12 max-w-3xl mx-auto">
                            {language === 'ar'
                                ? 'القصر (Qasr, El Qasr, ALKASR) - اسم يعني الجودة والثقة منذ سنوات'
                                : 'Qasr (قصر, القصر, ALKASR) - A name that means quality and trust for years'
                            }
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="text-center p-6 bg-luxury-cream rounded-lg border border-gold-600 hover:shadow-xl transition-shadow">
                                <Award className="w-16 h-16 text-gold-600 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-luxury-burgundy mb-2">
                                    {language === 'ar' ? 'جودة فاخرة' : 'Premium Quality'}
                                </h3>
                                <p className="text-luxury-burgundy-light">
                                    {language === 'ar'
                                        ? 'أفضل المكسرات والمحمصات المختارة بعناية'
                                        : 'Best carefully selected nuts and roasted products'
                                    }
                                </p>
                            </div>

                            <div className="text-center p-6 bg-luxury-cream rounded-lg border border-gold-600 hover:shadow-xl transition-shadow">
                                <Truck className="w-16 h-16 text-gold-600 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-luxury-burgundy mb-2">
                                    {language === 'ar' ? 'توصيل سريع' : 'Fast Delivery'}
                                </h3>
                                <p className="text-luxury-burgundy-light">
                                    {language === 'ar'
                                        ? 'توصيل لجميع أنحاء مصر في أسرع وقت'
                                        : 'Delivery to all parts of Egypt in the fastest time'
                                    }
                                </p>
                            </div>

                            <div className="text-center p-6 bg-luxury-cream rounded-lg border border-gold-600 hover:shadow-xl transition-shadow">
                                <Shield className="w-16 h-16 text-gold-600 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-luxury-burgundy mb-2">
                                    {language === 'ar' ? 'ضمان الجودة' : 'Quality Guarantee'}
                                </h3>
                                <p className="text-luxury-burgundy-light">
                                    {language === 'ar'
                                        ? 'ضمان استرجاع المنتج في حالة عدم الرضا'
                                        : 'Product return guarantee in case of dissatisfaction'
                                    }
                                </p>
                            </div>

                            <div className="text-center p-6 bg-luxury-cream rounded-lg border border-gold-600 hover:shadow-xl transition-shadow">
                                <Star className="w-16 h-16 text-gold-600 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-luxury-burgundy mb-2">
                                    {language === 'ar' ? 'أسعار تنافسية' : 'Competitive Prices'}
                                </h3>
                                <p className="text-luxury-burgundy-light">
                                    {language === 'ar'
                                        ? 'أفضل الأسعار مع أعلى جودة'
                                        : 'Best prices with highest quality'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Featured Products Section */}
                <section className="py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-4xl md:text-5xl font-bold text-luxury-burgundy text-center mb-4">
                            {language === 'ar' ? 'منتجاتنا المميزة' : 'Our Featured Products'}
                        </h2>
                        <p className="text-xl text-luxury-burgundy-light text-center mb-12">
                            {language === 'ar'
                                ? 'تصفح أفضل المكسرات والمحمصات من القصر'
                                : 'Browse the best nuts and roasted products from Qasr'
                            }
                        </p>

                        {loading ? (
                            <div className="flex justify-center">
                                <LoadingSpinner size="lg" />
                            </div>
                        ) : featuredProducts.length > 0 ? (
                            <>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {featuredProducts.map((product) => (
                                        <ProductCard key={product._id} product={product} />
                                    ))}
                                </div>

                                <div className="text-center mt-12">
                                    <Link href="/products" className="btn-primary px-10 py-5 text-xl font-semibold inline-flex items-center">
                                        {language === 'ar' ? 'عرض جميع المنتجات' : 'View All Products'}
                                        <ArrowRight className="ml-2 w-6 h-6" />
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
                                    <h2 className="text-3xl font-bold text-luxury-burgundy mb-6">قصر المكسرات والمحمصة - ALKASR</h2>
                                    <p className="text-luxury-burgundy-light mb-4 text-lg">
                                        القصر (Qasr, El Qasr, ALKASR, Antigravity) هو المتجر الرائد في مصر لبيع المكسرات والمحمصات الفاخرة. نقدم تشكيلة واسعة من أفضل أنواع المكسرات (مكسرات، maksrat) والمحمصات (محمصه، m7msa، mo7amsa) واللب بجميع أنواعه.
                                    </p>
                                    <h3 className="text-2xl font-bold text-luxury-burgundy mb-4">منتجاتنا</h3>
                                    <p className="text-luxury-burgundy-light mb-4">
                                        نوفر في القصر جميع أنواع المكسرات الفاخرة بما في ذلك الفستق الإيراني، الكاجو الفاخر، اللوز المحمص والطبيعي، البندق، وعين الجمل. كما نقدم أفضل أنواع السوداني المحمص بنكهات متعددة، واللب السوري والأبيض، والمقرمشات السورية.
                                    </p>
                                    <h3 className="text-2xl font-bold text-luxury-burgundy mb-4">لماذا نحن الأفضل؟</h3>
                                    <p className="text-luxury-burgundy-light mb-4">
                                        القصر (qasr, el qasr) ليس مجرد محل مكسرات، بل هو تجربة فريدة من نوعها. نحن نختار منتجاتنا بعناية فائقة من أفضل المصادر العالمية، ونحمصها بطرق تقليدية للحفاظ على النكهة الطبيعية والقيمة الغذائية. جميع منتجاتنا طازجة ومحمصة يومياً.
                                    </p>
                                    <p className="text-luxury-burgundy-light">
                                        سواء كنت تبحث عن مكسرات للضيافة، أو محمصات للتسلية، أو لب للمناسبات، ستجد في القصر كل ما تحتاجه بأفضل جودة وأفضل سعر. نوفر خدمة توصيل سريعة لجميع أنحاء القاهرة ومصر.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <h2 className="text-3xl font-bold text-luxury-burgundy mb-6">Qasr Nuts & Roasted Products - ALKASR</h2>
                                    <p className="text-luxury-burgundy-light mb-4 text-lg">
                                        Qasr (قصر, القصر, El Qasr, ALKASR, Antigravity) is the leading store in Egypt for selling premium nuts and roasted products. We offer a wide selection of the best types of nuts (مكسرات, maksrat), roasted products (محمصه, m7msa, mo7amsa), and all types of seeds (لب).
                                    </p>
                                    <h3 className="text-2xl font-bold text-luxury-burgundy mb-4">Our Products</h3>
                                    <p className="text-luxury-burgundy-light mb-4">
                                        At Qasr, we provide all types of premium nuts including Iranian pistachios, premium cashews, roasted and natural almonds, hazelnuts, and walnuts. We also offer the best types of roasted peanuts in multiple flavors, Syrian and white seeds, and Syrian snacks.
                                    </p>
                                    <h3 className="text-2xl font-bold text-luxury-burgundy mb-4">Why We're the Best?</h3>
                                    <p className="text-luxury-burgundy-light mb-4">
                                        Qasr (قصر, el qasr) is not just a nuts store, it's a unique experience. We carefully select our products from the best global sources and roast them using traditional methods to preserve natural flavor and nutritional value. All our products are fresh and roasted daily.
                                    </p>
                                    <p className="text-luxury-burgundy-light">
                                        Whether you're looking for nuts for hospitality, roasted products for snacking, or seeds for occasions, you'll find everything you need at Qasr with the best quality and best price. We provide fast delivery service to all parts of Cairo and Egypt.
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
