import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from './Header';
import Footer from './Footer';
import LoadingSpinner from './LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { generateMetaTags } from '../lib/utils';

const Layout = ({ children, title, description, image, noIndex = false }) => {
  const router = useRouter();
  const { initialized, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Handle route change loading
  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleComplete = () => setIsLoading(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  // Generate meta tags
  const metaTags = generateMetaTags({
    title,
    description,
    image,
    url: router.asPath,
  });

  // Show loading spinner while auth is initializing
  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{metaTags.title}</title>
        <meta name="description" content={metaTags.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        
        {/* Robots meta tag */}
        {noIndex && <meta name="robots" content="noindex, nofollow" />}
        
        {/* Open Graph tags */}
        <meta property="og:title" content={metaTags.openGraph.title} />
        <meta property="og:description" content={metaTags.openGraph.description} />
        <meta property="og:type" content={metaTags.openGraph.type} />
        <meta property="og:url" content={metaTags.openGraph.url} />
        <meta property="og:site_name" content={metaTags.openGraph.siteName} />
        {metaTags.openGraph.images.length > 0 && (
          <meta property="og:image" content={metaTags.openGraph.images[0].url} />
        )}
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content={metaTags.twitter.card} />
        <meta name="twitter:title" content={metaTags.twitter.title} />
        <meta name="twitter:description" content={metaTags.twitter.description} />
        {metaTags.twitter.images.length > 0 && (
          <meta name="twitter:image" content={metaTags.twitter.images[0]} />
        )}
        
        {/* Canonical URL */}
        <link rel="canonical" href={metaTags.openGraph.url} />
      </Head>

      <div className="min-h-screen flex flex-col cream-gradient">
        {/* Loading bar */}
        {isLoading && (
          <div className="fixed top-0 left-0 right-0 z-50">
            <div className="h-1 gold-gradient animate-pulse"></div>
          </div>
        )}

        {/* Header */}
        <Header />

        {/* Main content */}
        <main id="main-content" className="flex-1 focus:outline-none">
          {children}
        </main>

        {/* Footer */}
        <Footer />

        {/* Back to top button */}
        <BackToTopButton />
      </div>
    </>
  );
};

// Back to top button component
const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-4 right-4 z-40 p-3 gold-gradient text-luxury-cream rounded-full shadow-xl hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2"
      aria-label="Back to top"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    </button>
  );
};

export default Layout;
