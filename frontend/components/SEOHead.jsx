import Head from 'next/head';
import { useLanguage } from '../contexts/LanguageContext';
import {
    generatePageTitle,
    generateMetaDescription,
    generateKeywords,
    getOpenGraphTags,
    getTwitterCardTags,
    getJsonLdScript,
    SITE_CONFIG
} from '../lib/seo';

/**
 * SEOHead Component
 * Reusable component for consistent SEO implementation across pages
 * 
 * @param {Object} props
 * @param {string} props.title - Page title (will be appended with site name)
 * @param {string} props.description - Page description
 * @param {string[]} props.keywords - Additional keywords for this page
 * @param {string} props.image - Open Graph image URL
 * @param {string} props.url - Canonical URL
 * @param {Object} props.jsonLd - JSON-LD structured data object(s)
 * @param {boolean} props.noindex - Whether to prevent indexing
 */
export default function SEOHead({
    title,
    description,
    keywords = [],
    image,
    url,
    jsonLd,
    noindex = false,
    children
}) {
    const { language } = useLanguage();

    // Generate meta tags
    const pageTitle = generatePageTitle(title, language);
    const metaDescription = generateMetaDescription(description, language);
    const metaKeywords = generateKeywords(keywords);
    const canonicalUrl = url || (typeof window !== 'undefined' ? window.location.href : SITE_CONFIG.siteUrl);

    // Open Graph tags
    const ogTags = getOpenGraphTags({
        title: pageTitle,
        description: metaDescription,
        image,
        url: canonicalUrl
    });

    // Twitter Card tags
    const twitterTags = getTwitterCardTags({
        title: pageTitle,
        description: metaDescription,
        image
    });

    return (
        <Head>
            {/* Basic Meta Tags */}
            <title>{pageTitle}</title>
            <meta name="description" content={metaDescription} />
            <meta name="keywords" content={metaKeywords} />

            {/* Language and Direction */}
            <meta httpEquiv="content-language" content={language} />

            {/* Canonical URL */}
            <link rel="canonical" href={canonicalUrl} />

            {/* Alternate Language Links */}
            <link rel="alternate" hrefLang="ar" href={canonicalUrl.replace('/en/', '/ar/')} />
            <link rel="alternate" hrefLang="en" href={canonicalUrl.replace('/ar/', '/en/')} />
            <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />

            {/* Robots */}
            {noindex ? (
                <meta name="robots" content="noindex, nofollow" />
            ) : (
                <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
            )}

            {/* Open Graph Meta Tags */}
            {Object.entries(ogTags).map(([key, value]) => (
                <meta key={key} property={key} content={value} />
            ))}

            {/* Twitter Card Meta Tags */}
            {Object.entries(twitterTags).map(([key, value]) => (
                <meta key={key} name={key} content={value} />
            ))}

            {/* Additional Meta Tags */}
            <meta name="author" content="ALKASR" />
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
            <meta name="theme-color" content="#8B4513" />

            {/* Favicon */}
            <link rel="icon" href="/favicon.ico" />
            <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

            {/* JSON-LD Structured Data */}
            {jsonLd && (
                Array.isArray(jsonLd) ? (
                    jsonLd.map((schema, index) => (
                        <script
                            key={`jsonld-${index}`}
                            type="application/ld+json"
                            dangerouslySetInnerHTML={getJsonLdScript(schema)}
                        />
                    ))
                ) : (
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={getJsonLdScript(jsonLd)}
                    />
                )
            )}

            {/* Additional custom head elements */}
            {children}
        </Head>
    );
}
