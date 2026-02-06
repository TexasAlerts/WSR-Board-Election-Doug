import './globals.css';
import StickyNav from '../components/StickyNav';
import ErrorBoundary from '../components/ErrorBoundary';
import GlobalErrorHandler from '../components/GlobalErrorHandler';
import ScrollToTop from '../components/ScrollToTop';
import CookieConsent from '../components/CookieConsent';
import RecaptchaProvider from '../components/RecaptchaProvider';
import Link from 'next/link';
import Script from 'next/script';
import { AuthProvider } from '../context/AuthContext';
import { Open_Sans, Oswald } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-open-sans',
  display: 'swap',
});

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-oswald',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL('https://www.dougcharles.com'),
  alternates: {
    canonical: '/',
  },
  title: 'Doug Charles for Prosper Town Council - Place 5',
  description:
    'Doug Charles for Prosper Town Council Place 5. 20-year resident, former Planning & Zoning Commissioner. Listen. Plan. Protect. May 2, 2026 Election.',
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
    title: 'Doug Charles for Prosper Town Council - Place 5',
    description:
      'Doug Charles for Prosper Town Council Place 5. 20-year resident, former Planning & Zoning Commissioner. Listen. Plan. Protect. May 2, 2026 Election.',
    url: 'https://www.dougcharles.com',
    siteName: 'Doug Charles for Prosper',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://www.dougcharles.com/campaign-preview.png',
        width: 1200,
        height: 630,
        alt: 'Doug Charles for Prosper Town Council Place 5 - A Common Sense Leader for ALL of Prosper',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Doug Charles for Prosper Town Council - Place 5',
    description: 'A Common Sense Leader for All of Prosper',
    images: ['https://www.dougcharles.com/campaign-preview.png'],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#1B3A5D',
};

const KEY_DATES = [
  { label: 'Early Voting', date: 'Apr 20-28, 2026' },
  { label: 'Election Day', date: 'May 2, 2026' },
];

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
          href="/campaign-logo.webp"
          as="image"
          type="image/webp"
          fetchPriority="high"
        />
      </head>
      <body>
        <RecaptchaProvider>
          <AuthProvider>
            <ScrollToTop />
            {/* Skip to main content - Accessibility */}
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-[100] focus:bg-navy focus:text-white focus:px-4 focus:py-2 focus:underline"
            >
              Skip to main content
            </a>
            {/* Key dates banner */}
            <header
              aria-label="Election dates"
              className="bg-navy text-white text-sm py-2 px-3 sm:px-4 sticky top-0 z-50 shadow-md"
            >
              <div className="flex items-center justify-between gap-2 max-w-6xl mx-auto">
                {/* Mobile: Compact single line | Desktop: Full dates */}
                <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm min-w-0">
                  {KEY_DATES.map((item, idx) => (
                    <div key={idx} className="whitespace-nowrap flex items-center gap-1">
                      <span className="font-bold">{item.label}</span>
                      <span className="hidden xs:inline">–</span>
                      <span className="text-white/90">{item.date}</span>
                    </div>
                  ))}
                </div>
                <div className="whitespace-nowrap font-bold text-prosper-red bg-white px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm shrink-0">
                  Place 5
                </div>
              </div>
            </header>
            {/* Navigation */}
            <StickyNav />
            {/* SEO: JSON-LD structured data */}
            <Script id="structured-data" type="application/ld+json" strategy="beforeInteractive">
              {`
            {
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "name": "Doug Charles for Prosper Town Council",
                  "url": "https://www.dougcharles.com",
                  "description": "Official campaign site for Doug Charles, candidate for Prosper Town Council Place 5. A Common Sense Leader for All of Prosper.",
                  "publisher": {
                    "@id": "https://www.dougcharles.com/#person"
                  }
                },
                {
                  "@type": "Person",
                  "@id": "https://www.dougcharles.com/#person",
                  "name": "Doug Charles",
                  "jobTitle": "Candidate for Prosper Town Council Place 5",
                  "description": "20-year Prosper resident, former Planning & Zoning Commissioner (2021-2023), 2020 Bond Election Committee member, PISD annexation lead petitioner. Candidate for Prosper Town Council Place 5.",
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
                },
                {
                  "@type": "Event",
                  "name": "Prosper Town Council Election - Place 5",
                  "startDate": "2026-05-02",
                  "endDate": "2026-05-02",
                  "eventStatus": "https://schema.org/EventScheduled",
                  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
                  "location": {
                    "@type": "Place",
                    "name": "Town of Prosper",
                    "address": {
                      "@type": "PostalAddress",
                      "addressLocality": "Prosper",
                      "addressRegion": "TX",
                      "addressCountry": "US"
                    }
                  },
                  "description": "Election Day for Prosper Town Council Place 5. Early voting: April 20-28, 2026.",
                  "organizer": {
                    "@type": "Organization",
                    "name": "Town of Prosper"
                  }
                }
              ]
            }
          `}
            </Script>
            <main
              id="main-content"
              className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 sm:pb-8 relative"
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
                  Political advertising paid for by Doug Charles for Prosper Town Council Place 5.
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
                  <Link href="/about" className="text-white hover:text-gray-300 hover:underline">
                    About
                  </Link>
                  <Link
                    href="/priorities"
                    className="text-white hover:text-gray-300 hover:underline"
                  >
                    Priorities
                  </Link>
                  <Link
                    href="/get-involved"
                    className="text-white hover:text-gray-300 hover:underline"
                  >
                    Get Involved
                  </Link>
                  <Link href="/donate" className="text-white hover:text-gray-300 hover:underline">
                    Donate
                  </Link>
                </nav>
                <p>
                  © {new Date().getFullYear()} Doug Charles for Prosper Town Council
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
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 py-3 px-4 pb-safe sm:hidden z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
              <div className="flex gap-3 max-w-md mx-auto">
                <Link
                  href="/get-involved"
                  className="flex-1 bg-navy text-white py-3.5 rounded-full text-base font-bold shadow-lg min-h-[48px] flex items-center justify-center active:scale-[0.98] transition-transform"
                >
                  Get Involved
                </Link>
                <Link
                  href="/donate"
                  className="bg-prosper-red text-white px-5 py-3.5 rounded-full text-base font-bold shadow-lg min-h-[48px] flex items-center justify-center active:scale-[0.98] transition-transform"
                >
                  Donate
                </Link>
              </div>
            </div>
          </AuthProvider>
        </RecaptchaProvider>
        <CookieConsent />
        <GlobalErrorHandler />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
