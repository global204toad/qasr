import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="ar" dir="rtl">
      <Head>
        {/* Meta tags for SEO and social sharing */}
        <meta charSet="utf-8" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />

        {/* SEO Keywords - Brand and Products */}
        <meta name="keywords" content="qasr, el qasr, قصر, القصر, alkasr, antigravity, مكسرات, محمصه, محمصة, لب, maksrat, m7msa, mo7amsa, lob, nuts, roasted nuts, seeds, peanuts, pistachios, cashews, almonds, سوداني, فستق, كاجو, لوز, بندق, egypt, cairo, مصر, القاهرة" />

        {/* Author and Copyright */}
        <meta name="author" content="ALKASR - القصر" />
        <meta name="copyright" content="ALKASR" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://js.stripe.com" />

        {/* Theme color - Luxury Burgundy */}
        <meta name="theme-color" content="#8B4513" />

        {/* PWA meta tags */}
        <meta name="application-name" content="ALKASR - القصر" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ALKASR" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#8B4513" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* Security headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />

        {/* Performance hints */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//images.unsplash.com" />
        <link rel="dns-prefetch" href="//res.cloudinary.com" />

        {/* Geo Location */}
        <meta name="geo.region" content="EG" />
        <meta name="geo.placename" content="Cairo" />
      </Head>
      <body>
        {/* No-script fallback */}
        <noscript>
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
            textAlign: 'center'
          }}>
            <div>
              <h1>JavaScript Required</h1>
              <p>This website requires JavaScript to function properly. Please enable JavaScript in your browser settings.</p>
              <p style={{ marginTop: '10px', direction: 'rtl' }}>يتطلب هذا الموقع تفعيل JavaScript للعمل بشكل صحيح. يرجى تفعيل JavaScript في إعدادات المتصفح.</p>
            </div>
          </div>
        </noscript>

        <Main />
        <NextScript />

        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-md"
        >
          Skip to main content
        </a>
      </body>
    </Html>
  );
}
