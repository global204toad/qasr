// SEO Configuration and Utilities for Antigravity
// Centralized SEO settings for consistent implementation across the site

// Base site information
export const SITE_CONFIG = {
    siteName: 'ALKASR',
    siteNameAr: 'القصر',
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://qasrnuts.com',
    description: {
        en: 'Antigravity - Premium nuts, roasted products, and seeds. Quality مكسرات (maksrat), محمصه (m7msa), and لب delivered fresh.',
        ar: 'القصر - مكسرات فاخرة، محمصات، ولب. منتجات عالية الجودة من المكسرات والمحمصات واللب الطازج.'
    },
    keywords: [
        // Brand keywords
        'qasr', 'el qasr', 'قصر', 'القصر', 'alkasr', 'antigravity',
        // Product keywords - Arabic
        'مكسرات', 'محمصه', 'محمصة', 'لب', 'سوداني', 'فستق', 'كاجو', 'لوز', 'بندق',
        // Product keywords - Transliterated
        'maksrat', 'm7msa', 'mo7amsa', 'lib', 'sudani', 'fosta2', 'cashew', 'almonds',
        // Product keywords - English
        'nuts', 'roasted nuts', 'seeds', 'peanuts', 'pistachios', 'cashews', 'almonds', 'hazelnuts',
        // Location
        'egypt', 'cairo', 'egyptian nuts', 'مصر', 'القاهرة'
    ],
    social: {
        facebook: 'https://facebook.com/alkasr',
        instagram: 'https://instagram.com/alkasr',
        twitter: 'https://twitter.com/alkasr'
    },
    contact: {
        phone: '+20 123 456 7890',
        email: 'info@qasrnuts.com',
        address: 'Cairo, Egypt'
    }
};

// Default meta tags for each page type
export const DEFAULT_META = {
    home: {
        title: {
            en: 'ALKASR - Premium Nuts & Roasted Products | قصر المكسرات والمحمصة',
            ar: 'القصر - مكسرات ومحمصات فاخرة | ALKASR Premium Nuts'
        },
        description: {
            en: 'Antigravity (قصر/القصر) - Premium مكسرات (maksrat), محمصه (m7msa), and لب. Quality nuts, roasted products, and seeds delivered fresh across Egypt.',
            ar: 'القصر (Antigravity) - مكسرات فاخرة، محمصات، ولب طازج. أفضل أنواع المكسرات والمحمصات واللب في مصر.'
        }
    },
    products: {
        title: {
            en: 'Premium Nuts & Products | مكسرات ومحمصات - ALKASR',
            ar: 'مكسرات ومحمصات فاخرة - القصر | Premium Nuts'
        },
        description: {
            en: 'Browse our premium selection of nuts (مكسرات), roasted products (محمصه), and seeds (لب). Quality maksrat and m7msa delivered fresh.',
            ar: 'تصفح مجموعتنا الفاخرة من المكسرات، المحمصات، واللب. جودة عالية وتوصيل سريع.'
        }
    },
    about: {
        title: {
            en: 'About ALKASR | قصر المكسرات',
            ar: 'عن القصر | About ALKASR'
        },
        description: {
            en: 'Learn about ALKASR (قصر) - Egypt\'s premium destination for nuts, roasted products, and traditional مكسرات.',
            ar: 'تعرف على القصر - وجهتك المفضلة للمكسرات والمحمصات الفاخرة في مصر.'
        }
    }
};

// Generate page title with proper formatting
export const generatePageTitle = (pageTitle, language = 'ar') => {
    const siteName = language === 'ar' ? SITE_CONFIG.siteNameAr : SITE_CONFIG.siteName;
    return pageTitle ? `${pageTitle} - ${siteName}` : siteName;
};

// Generate meta description
export const generateMetaDescription = (description, language = 'ar') => {
    return description || SITE_CONFIG.description[language];
};

// Generate keywords string
export const generateKeywords = (additionalKeywords = []) => {
    return [...SITE_CONFIG.keywords, ...additionalKeywords].join(', ');
};

// Structured Data (Schema.org) Templates

// Organization Schema
export const getOrganizationSchema = () => ({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ALKASR',
    alternateName: ['القصر', 'Qasr', 'El Qasr', 'Antigravity'],
    url: SITE_CONFIG.siteUrl,
    logo: `${SITE_CONFIG.siteUrl}/logo.png`,
    description: SITE_CONFIG.description.en,
    contactPoint: {
        '@type': 'ContactPoint',
        telephone: SITE_CONFIG.contact.phone,
        contactType: 'customer service',
        email: SITE_CONFIG.contact.email,
        availableLanguage: ['Arabic', 'English']
    },
    sameAs: [
        SITE_CONFIG.social.facebook,
        SITE_CONFIG.social.instagram,
        SITE_CONFIG.social.twitter
    ],
    address: {
        '@type': 'PostalAddress',
        addressCountry: 'EG',
        addressLocality: 'Cairo'
    }
});

// LocalBusiness Schema
export const getLocalBusinessSchema = () => ({
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: 'ALKASR - القصر',
    image: `${SITE_CONFIG.siteUrl}/logo.png`,
    '@id': SITE_CONFIG.siteUrl,
    url: SITE_CONFIG.siteUrl,
    telephone: SITE_CONFIG.contact.phone,
    priceRange: '$$',
    address: {
        '@type': 'PostalAddress',
        addressCountry: 'EG',
        addressLocality: 'Cairo'
    },
    geo: {
        '@type': 'GeoCoordinates',
        latitude: 30.0444,
        longitude: 31.2357
    },
    openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday'
        ],
        opens: '09:00',
        closes: '22:00'
    },
    sameAs: [
        SITE_CONFIG.social.facebook,
        SITE_CONFIG.social.instagram,
        SITE_CONFIG.social.twitter
    ]
});

// Product Schema
export const getProductSchema = (product, language = 'ar') => {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: product.images?.map(img => img.url) || [],
        description: product.description || '',
        sku: product._id,
        brand: {
            '@type': 'Brand',
            name: 'ALKASR'
        },
        offers: {
            '@type': 'Offer',
            url: `${SITE_CONFIG.siteUrl}/products/${product._id}`,
            priceCurrency: 'EGP',
            price: product.price || 0,
            availability: product.inventory?.quantity > 0
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            seller: {
                '@type': 'Organization',
                name: 'ALKASR'
            }
        }
    };

    // Add rating if available
    if (product.rating?.count > 0) {
        schema.aggregateRating = {
            '@type': 'AggregateRating',
            ratingValue: product.rating.average,
            reviewCount: product.rating.count
        };
    }

    return schema;
};

// Breadcrumb Schema
export const getBreadcrumbSchema = (items) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url ? `${SITE_CONFIG.siteUrl}${item.url}` : undefined
    }))
});

// WebSite Schema (for search functionality)
export const getWebSiteSchema = () => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ALKASR',
    alternateName: 'القصر',
    url: SITE_CONFIG.siteUrl,
    potentialAction: {
        '@type': 'SearchAction',
        target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_CONFIG.siteUrl}/products?search={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
    }
});

// Helper to inject JSON-LD script
export const getJsonLdScript = (schema) => {
    return {
        __html: JSON.stringify(schema)
    };
};

// Open Graph meta tags
export const getOpenGraphTags = (config) => {
    const { title, description, image, url, type = 'website' } = config;

    return {
        'og:type': type,
        'og:site_name': 'ALKASR',
        'og:title': title,
        'og:description': description,
        'og:image': image || `${SITE_CONFIG.siteUrl}/og-image.jpg`,
        'og:url': url || SITE_CONFIG.siteUrl,
        'og:locale': 'ar_EG',
        'og:locale:alternate': 'en_US'
    };
};

// Twitter Card meta tags
export const getTwitterCardTags = (config) => {
    const { title, description, image } = config;

    return {
        'twitter:card': 'summary_large_image',
        'twitter:site': '@alkasr',
        'twitter:title': title,
        'twitter:description': description,
        'twitter:image': image || `${SITE_CONFIG.siteUrl}/twitter-card.jpg`
    };
};

export default {
    SITE_CONFIG,
    DEFAULT_META,
    generatePageTitle,
    generateMetaDescription,
    generateKeywords,
    getOrganizationSchema,
    getLocalBusinessSchema,
    getProductSchema,
    getBreadcrumbSchema,
    getWebSiteSchema,
    getJsonLdScript,
    getOpenGraphTags,
    getTwitterCardTags
};
