import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  // Handle route changes for analytics (placeholder)
  useEffect(() => {
    const handleRouteChange = (url) => {
      // Google Analytics or other tracking
      console.log('Route changed to:', url);
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  // Get layout from page component or use default
  const getLayout = Component.getLayout || ((page) => <Layout>{page}</Layout>);

  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <Head>
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
          </Head>
          {getLayout(<Component {...pageProps} />)}
          
          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default MyApp;
