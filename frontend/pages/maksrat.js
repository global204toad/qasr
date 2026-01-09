import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Nut, Star, ArrowRight, Award } from 'lucide-react';
import { productsAPI } from '../lib/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useLanguage } from '../contexts/LanguageContext';
import SEOHead from '../components/SEOHead';
import { getOrganizationSchema } from '../lib/seo';

export default function MaksratPage() {
    const { t, language, translateProduct, translateCategory } = useLanguage();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNutsProducts = async () => {
            try {
                // Fetch products from nuts category
                const response = await productsAPI.getAll({ category: 'nuts', limit: 20 });
                setProducts(response.data.data || []);
            } catch (error) {
                console.error('Failed to fetch nuts products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchNutsProducts();
    }, []);

    const seoTitle = language === 'ar'
        ? 'مكسرات فاخرة - القصر | Premium Nuts - ALKASR'
        : 'Premium Nuts - ALKASR | مكسرات فاخرة - القصر';

    const seoDescription = language === 'ar'
        ? 'مكسرات فاخرة من القصر (ALKASR) - فستق إيراني، كاجو، لوز، بندق، وعين الجمل. أفضل أنواع المكسرات الطبيعية المحمصة بجودة عالية. maksrat, nuts, قصر المكسرات'
        : 'Premium nuts from ALKASR (القصر) - Iranian pistachios, cashews, almonds, hazelnuts, and walnuts. Best quality roasted nuts. مكسرات فاخرة، maksrat, qasr nuts';

    return (
        <>
            <SEOHead
                title={seoTitle}
                description={seoDescription}
                keywords={[
                    'مكسرات', 'maksrat', 'nuts', 'قصر', 'qasr', 'alkasr',
                    'فستق', 'pistachios', 'كاجو', 'cashew', 'لوز', 'almonds',
                    'بندق', 'hazelnuts', 'عين الجمل', 'walnuts',
                    'محمصات', 'roasted nuts', 'مكسرات فاخرة', 'premium nuts'
                ]}
                jsonLd={getOrganizationSchema()}
            />

            <div className="min-h-screen cream-gradient">
                {/* Hero Section */}
                <section className="relative burgundy-gradient text-luxury-cream py-16 md:py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 gold-gradient rounded-full mb-6">
                                <Nut className="w-10 h-10 md:w-12 md:h-12" />
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                                {language === 'ar' ? (
                                    <>
                                        مكسرات فاخرة من <span className="text-gold-400">القصر</span>
                                    </>
                                ) : (
                                    <>
                                        Premium Nuts from <span className="text-gold-400">ALKASR</span>
                                    </>
                                )}
                            </h1>

                            <p className="text-xl md:text-2xl mb-4 text-luxury-cream-medium max-w-3xl mx-auto">
                                {language === 'ar'
                                    ? 'أفضل أنواع المكسرات الطبيعية المحمصة - فستق، كاجو، لوز، بندق، وعين الجمل'
                                    : 'Best Quality Roasted Nuts - Pistachios, Cashews, Almonds, Hazelnuts, and Walnuts'
                                }
                            </p>

                            <div className="flex flex-wrap gap-2 justify-center text-sm md:text-base text-luxury-cream-light">
                                <span className="px-3 py-1 bg-luxury-cream/20 rounded-full">مكسرات</span>
                                <span className="px-3 py-1 bg-luxury-cream/20 rounded-full">Maksrat</span>
                                <span className="px-3 py-1 bg-luxury-cream/20 rounded-full">Premium Nuts</span>
                                <span className="px-3 py-1 bg-luxury-cream/20 rounded-full">قصر المكسرات</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="py-16 bg-luxury-cream-light">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl md:text-4xl font-bold text-luxury-burgundy text-center mb-12">
                            {language === 'ar' ? 'لماذا مكسرات القصر؟' : 'Why ALKASR Nuts?'}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="text-center p-6 bg-luxury-cream rounded-lg border border-gold-600">
                                <Award className="w-12 h-12 text-gold-600 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-luxury-burgundy mb-2">
                                    {language === 'ar' ? 'جودة فاخرة' : 'Premium Quality'}
                                </h3>
                                <p className="text-luxury-burgundy-light">
                                    {language === 'ar'
                                        ? 'مكسرات مختارة بعناية من أفضل المصادر العالمية'
                                        : 'Carefully selected nuts from the best global sources'
                                    }
                                </p>
                            </div>

                            <div className="text-center p-6 bg-luxury-cream rounded-lg border border-gold-600">
                                <Star className="w-12 h-12 text-gold-600 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-luxury-burgundy mb-2">
                                    {language === 'ar' ? 'تحميص طبيعي' : 'Natural Roasting'}
                                </h3>
                                <p className="text-luxury-burgundy-light">
                                    {language === 'ar'
                                        ? 'محمصة بطريقة تقليدية للحفاظ على النكهة الطبيعية'
                                        : 'Traditionally roasted to preserve natural flavor'
                                    }
                                </p>
                            </div>

                            <div className="text-center p-6 bg-luxury-cream rounded-lg border border-gold-600">
                                <Nut className="w-12 h-12 text-gold-600 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-luxury-burgundy mb-2">
                                    {language === 'ar' ? 'تشكيلة واسعة' : 'Wide Variety'}
                                </h3>
                                <p className="text-luxury-burgundy-light">
                                    {language === 'ar'
                                        ? 'جميع أنواع المكسرات من فستق وكاجو ولوز وبندق'
                                        : 'All types of nuts: pistachios, cashews, almonds, hazelnuts'
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
                            {language === 'ar' ? 'تصفح مكسراتنا' : 'Browse Our Nuts'}
                        </h2>

                        {loading ? (
                            <div className="flex justify-center">
                                <LoadingSpinner size="lg" />
                            </div>
                        ) : products.length > 0 ? (
                            <>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {products.map((product) => (
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
                                    <h2 className="text-2xl font-bold text-luxury-burgundy mb-4">مكسرات القصر - جودة لا تضاهى</h2>
                                    <p className="text-luxury-burgundy-light mb-4">
                                        القصر (ALKASR) هي وجهتك المثالية للحصول على أفضل أنواع المكسرات الفاخرة في مصر. نقدم تشكيلة واسعة من المكسرات الطبيعية المحمصة بعناية، بما في ذلك الفستق الإيراني، الكاجو الفاخر، اللوز المحمص، البندق الطبيعي، وعين الجمل الطازجة.
                                    </p>
                                    <p className="text-luxury-burgundy-light mb-4">
                                        جميع منتجاتنا من المكسرات (maksrat) يتم اختيارها بعناية فائقة من أفضل المصادر العالمية، ويتم تحميصها بطريقة تقليدية للحفاظ على النكهة الطبيعية والقيمة الغذائية العالية.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <h2 className="text-2xl font-bold text-luxury-burgundy mb-4">ALKASR Nuts - Unmatched Quality</h2>
                                    <p className="text-luxury-burgundy-light mb-4">
                                        ALKASR (القصر) is your ideal destination for the finest premium nuts in Egypt. We offer a wide selection of carefully roasted natural nuts, including Iranian pistachios, premium cashews, roasted almonds, natural hazelnuts, and fresh walnuts.
                                    </p>
                                    <p className="text-luxury-burgundy-light mb-4">
                                        All our nuts products (مكسرات, maksrat) are carefully selected from the best global sources and roasted traditionally to preserve their natural flavor and high nutritional value.
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
