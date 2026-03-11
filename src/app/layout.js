import { Suspense } from 'react';
import './globals.css';
import StickyNav from '../components/StickyNav';
import ErrorBoundary from '../components/ErrorBoundary';
import GlobalErrorHandler from '../components/GlobalErrorHandler';
import ScrollToTop from '../components/ScrollToTop';
import CookieConsent from '../components/CookieConsent';
import FacebookPixel from '../components/FacebookPixel';
import TrackingUtils from '../components/TrackingUtils';
import RecaptchaProvider from '../components/RecaptchaProvider';
import Link from 'next/link';
import Script from 'next/script';
import { AuthProvider } from '../context/AuthContext';
import { SiteConfigProvider } from '../context/SiteConfigContext';

import { Open_Sans, Oswald } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-open-sans',
  display: 'swap',
  adjustFontFallback: true,
  preload: true,
});

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-oswald',
  display: 'swap',
  adjustFontFallback: true,
  preload: true,
});

export const metadata = {
  metadataBase: new URL('https://www.dougcharles.com'),
  applicationName: 'Doug Charles',
  authors: [{ name: 'Doug Charles', url: 'https://www.dougcharles.com' }],
  creator: 'Doug Charles',
  publisher: 'Doug Charles for Prosper Town Council Place 5',
  keywords: [
    'Doug Charles',
    'Prosper Town Council',
    'Place 5',
    'Prosper Texas',
    'Town Council',
    'local government',
    'Prosper TX',
    'Common Sense leadership',
    'Planning and Zoning',
    'Windsong Ranch',
  ],
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Doug Charles',
  },
  alternates: {
    canonical: '/',
    languages: {
      'en-US': 'https://www.dougcharles.com',
    },
  },
  title: 'Doug Charles — Prosper, Texas Town Council, Place 5',
  description:
    'Doug Charles, Prosper Town Council Place 5. 20-year resident, former P&Z Commissioner. Common Sense leadership. Listen. Plan. Protect.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Doug Charles — Prosper, Texas Town Council, Place 5',
    description:
      'Doug Charles, Prosper Town Council Place 5. 20-year resident, former Planning & Zoning Commissioner. Serving with Common Sense leadership. Listen. Plan. Protect.',
    url: 'https://www.dougcharles.com',
    siteName: 'Doug Charles — Prosper, Texas Town Council, Place 5',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://www.dougcharles.com/dc-preview.webp',
        width: 1200,
        height: 630,
        alt: 'Doug Charles — Prosper, Texas Town Council, Place 5 — A Common Sense Leader for ALL of Prosper',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Doug Charles — Prosper, Texas Town Council, Place 5',
    description: 'A Common Sense Leader for ALL of Prosper',
    images: ['https://www.dougcharles.com/dc-preview.webp'],
  },
  other: {
    'facebook-domain-verification': 'nuadj9w5mfwlzj6t37sb0l44k7fuwy',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#1B3A5D',
};

const BANNER_MESSAGE = 'Serving Prosper — Town Council, Place 5';

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${openSans.variable} ${oswald.variable}`}>
      <head>
        <link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        {/* Resource hints for external services */}
        <link rel="preconnect" href="https://www.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.recaptcha.net" />
        {/* Preload hero image for LCP optimization */}
        <link
          rel="preload"
          href="/dc-logo.webp"
          as="image"
          type="image/webp"
          fetchPriority="high"
        />
      </head>
      <body>
        <RecaptchaProvider>
          <AuthProvider>
          <SiteConfigProvider>
            <ScrollToTop />
            {/* Skip to main content - Accessibility */}
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-[100] focus:bg-navy focus:text-white focus:px-4 focus:py-2 focus:underline"
            >
              Skip to main content
            </a>
            {/* Status banner */}
            <header
              aria-label="Town Council status"
              className="bg-navy text-white text-sm py-2 px-3 sm:px-4 sticky top-0 z-50 shadow-md"
            >
              <div className="flex items-center justify-center gap-3 max-w-6xl mx-auto">
                <span className="text-xs sm:text-sm font-medium text-white/90">{BANNER_MESSAGE}</span>
              </div>
            </header>
            {/* Navigation */}
            <StickyNav />
            {/* SEO: JSON-LD structured data */}
            <Script id="structured-data" type="application/ld+json" strategy="afterInteractive">
              {`
            {
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "@id": "https://www.dougcharles.com/#website",
                  "name": "Doug Charles — Prosper, Texas Town Council, Place 5",
                  "url": "https://www.dougcharles.com",
                  "description": "Personal website for Doug Charles, Prosper Town Council Member, Place 5. Serving with Common Sense leadership for ALL of Prosper.",
                  "publisher": {
                    "@id": "https://www.dougcharles.com/#organization"
                  }
                },
                {
                  "@type": "Organization",
                  "@id": "https://www.dougcharles.com/#organization",
                  "name": "Doug Charles for Prosper Town Council Place 5",
                  "url": "https://www.dougcharles.com",
                  "logo": {
                    "@type": "ImageObject",
                    "url": "https://www.dougcharles.com/dc-logo.webp",
                    "width": 512,
                    "height": 512
                  },
                  "description": "Committee for Doug Charles, Prosper Town Council Member, Place 5. Treasurer: Robert Bye.",
                  "sameAs": ["https://www.facebook.com/profile.php?id=61587237416382"],
                  "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "4360 Mill Branch Drive",
                    "addressLocality": "Prosper",
                    "addressRegion": "TX",
                    "postalCode": "75078",
                    "addressCountry": "US"
                  },
                  "contactPoint": {
                    "@type": "ContactPoint",
                    "contactType": "General Inquiries",
                    "email": "doug@dougcharles.com"
                  },
                  "foundingDate": "2025",
                  "areaServed": {
                    "@type": "City",
                    "name": "Prosper",
                    "containedInPlace": {
                      "@type": "State",
                      "name": "Texas"
                    }
                  },
                  "employee": {
                    "@type": "Person",
                    "name": "Robert Bye",
                    "jobTitle": "Campaign Treasurer"
                  }
                },
                {
                  "@type": "Person",
                  "@id": "https://www.dougcharles.com/#person",
                  "name": "Doug Charles",
                  "jobTitle": "Prosper Town Council Member, Place 5",
                  "description": "20-year Prosper resident, former Planning & Zoning Commissioner (2021-2023), 2020 Bond Election Committee member, PISD annexation lead petitioner. Prosper Town Council Member, Place 5.",
                  "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "4360 Mill Branch Drive",
                    "addressLocality": "Prosper",
                    "addressRegion": "TX",
                    "postalCode": "75078",
                    "addressCountry": "US"
                  },
                  "email": "doug@dougcharles.com",
                  "url": "https://www.dougcharles.com",
                  "image": "https://www.dougcharles.com/headshot.webp"
                }
              ]
            }
          `}
            </Script>
            <main
              id="main-content"
              tabIndex={-1}
              className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 sm:pb-8 relative focus:outline-none"
              style={{ zIndex: 1 }}
            >
              <ErrorBoundary>{children}</ErrorBoundary>
            </main>
            <footer
              aria-label="Site footer"
              className="bg-navy text-white py-6 mt-16 pb-24 sm:pb-6"
            >
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-sm text-center space-y-2">
                <p>
                  Political advertising paid for by Doug Charles for Town of Prosper Town Council Place 5.
                  <br />
                  Robert Bye, Campaign Treasurer
                </p>
                <p className="text-white/90 text-xs leading-relaxed max-w-lg mx-auto">
                  This is a personal website. It does not represent the Town of Prosper,
                  the Prosper Town Council, or any official government position.
                  For official Town of Prosper information, visit{' '}
                  <a
                    href="https://www.prospertx.gov"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white underline hover:text-gray-300"
                  >
                    prospertx.gov
                  </a>.
                </p>
                <p>
                  Questions? Email{' '}
                  <a
                    href="mailto:doug@dougcharles.com"
                    className="text-white underline hover:text-gray-300"
                  >
                    doug@dougcharles.com
                  </a>
                </p>
                <nav aria-label="Footer navigation" className="flex flex-wrap justify-center gap-x-4 gap-y-1 pt-2">
                  <Link href="/about" className="text-white hover:text-gray-300 hover:underline py-2">
                    About
                  </Link>
                  <Link
                    href="/priorities"
                    className="text-white hover:text-gray-300 hover:underline py-2"
                  >
                    Priorities
                  </Link>
                  <Link
                    href="/get-involved"
                    className="text-white hover:text-gray-300 hover:underline py-2"
                  >
                    Engage
                  </Link>
                </nav>
                {/* Social Media Links */}
                <div className="flex justify-center gap-4 pt-3" role="group" aria-label="Social media links">
                  <a href="https://www.facebook.com/profile.php?id=61587237416382" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300 min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Follow on Facebook">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
                  </a>
                </div>
                <p>
                  © {new Date().getFullYear()} Doug Charles — Prosper, Texas Town Council, Place 5
                  {' | '}
                  <Link href="/privacy" className="text-white underline hover:text-gray-300">
                    Privacy Policy
                  </Link>
                  {' | '}
                  <Link href="/terms" className="text-white underline hover:text-gray-300">
                    Terms of Use
                  </Link>
                </p>
              </div>
            </footer>
            {/* Mobile call to action - Dual CTA for conversion */}
            <div
              role="region"
              aria-label="Mobile call to action"
              className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 py-3 px-4 pb-safe sm:hidden z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
            >
              <div className="flex gap-3 max-w-md mx-auto">
                <Link
                  href="/get-involved"
                  className="flex-1 bg-navy text-white py-3.5 rounded-full text-base font-bold shadow-lg min-h-[48px] flex items-center justify-center active:scale-[0.98] transition-transform"
                >
                  Engage
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-prosper-red text-white px-5 py-3.5 rounded-full text-base font-bold shadow-lg min-h-[48px] flex items-center justify-center active:scale-[0.98] transition-transform"
                >
                  Create Account
                </Link>
              </div>
            </div>
          </SiteConfigProvider>
          </AuthProvider>
        </RecaptchaProvider>
        <CookieConsent />
        <GlobalErrorHandler />
        {/* Polyfill for Safari/Facebook in-app browser WebView */}
        <Script id="webkit-polyfill" strategy="afterInteractive">
          {`
            if(window.webkit&&!window.webkit.messageHandlers){
              window.webkit.messageHandlers={};
            }
          `}
        </Script>
        {/* Facebook Pixel — consent-gated with SPA route tracking */}
        <FacebookPixel />
        {/* UTM + fbclid capture to sessionStorage */}
        <Suspense fallback={null}>
          <TrackingUtils />
        </Suspense>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
