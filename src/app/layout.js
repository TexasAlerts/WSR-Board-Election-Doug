import './globals.css';
import StickyNav from '../components/StickyNav';
import ErrorBoundary from '../components/ErrorBoundary';
import Link from 'next/link';
import Script from 'next/script';
import { AuthProvider } from '../context/AuthContext';
import { Open_Sans, Oswald } from 'next/font/google';

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
  title: 'Doug Charles for Prosper Town Council - Place 5',
  description: 'Doug Charles for Prosper Town Council Place 5. 20-year resident, former Planning & Zoning Commissioner. Listen. Plan. Protect. Election May 2, 2026.',
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Doug Charles for Prosper Town Council - Place 5',
    description: 'Doug Charles for Prosper Town Council Place 5. 20-year resident, former Planning & Zoning Commissioner. Listen. Plan. Protect. Election May 2, 2026.',
    url: 'https://www.dougcharles.com',
    siteName: 'Doug Charles for Prosper',
    locale: 'en_US',
    type: 'website',
    images: [{
      url: 'https://www.dougcharles.com/campaign-preview.png',
      width: 1200,
      height: 630,
      alt: 'Doug Charles for Prosper Town Council Place 5 - A Common Sense Leader for ALL of Prosper',
    }],
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
        {/* Preload hero image to improve LCP */}
        <link rel="preload" href="/wsr-logo.webp" as="image" type="image/webp" />
      </head>
      <body>
        <AuthProvider>
        {/* Skip to main content - Accessibility */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-[100] focus:bg-navy focus:text-white focus:px-4 focus:py-2 focus:underline">
          Skip to main content
        </a>
        {/* Key dates banner */}
        <header className="bg-navy text-white text-sm sm:text-base py-2 px-4 sticky top-0 z-50 shadow-md">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-y-1 lg:gap-y-0 max-w-6xl mx-auto">
            <div className="flex flex-wrap justify-center lg:justify-start gap-x-4 gap-y-1 w-full min-w-0 text-center lg:text-left">
              {KEY_DATES.map((item, idx) => (
                <div key={idx} className="whitespace-nowrap min-w-0 truncate">
                  <strong>{item.label}</strong> – {item.date}
                </div>
              ))}
            </div>
            <div className="whitespace-nowrap text-center lg:text-right font-semibold text-prosper-red bg-white px-3 py-1 rounded-full text-sm">
              Town Council Place 5
            </div>
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
                  "description": "20-year Prosper resident, former Planning & Zoning Commissioner (2021-2023), 2020 Bond Election Committee member, Windsong Ranch HOA Board member.",
                  "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Prosper",
                    "addressRegion": "TX",
                    "addressCountry": "US"
                  },
                  "email": "doug@dougcharles.com",
                  "url": "https://www.dougcharles.com",
                  "image": "https://www.dougcharles.com/headshot.jpg"
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
        <main id="main-content" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 sm:pb-8 relative" style={{ zIndex: 1 }}>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
        <footer className="bg-navy text-white py-6 mt-16 pb-24 sm:pb-6">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-sm text-center space-y-2">
            <p>Political advertising paid for by Doug Charles for Prosper Town Council Place 5.</p>
            <p>Questions? Email <a href="mailto:doug@dougcharles.com" className="text-white underline hover:text-gray-300">doug@dougcharles.com</a></p>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 pt-2">
              <Link href="/about" className="text-white hover:text-gray-300 hover:underline">About</Link>
              <Link href="/priorities" className="text-white hover:text-gray-300 hover:underline">Priorities</Link>
              <Link href="/get-involved" className="text-white hover:text-gray-300 hover:underline">Get Involved</Link>
              <Link href="/donate" className="text-white hover:text-gray-300 hover:underline">Donate</Link>
            </div>
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
        {/* Mobile call to action - Single CTA for better conversion */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t py-3 px-4 pb-safe flex justify-center sm:hidden z-50">
          <Link href="/get-involved" className="bg-navy text-white px-8 py-3 rounded-full text-base font-semibold shadow-md min-w-[44px] min-h-[44px]">
            Get Involved
          </Link>
        </div>
        </AuthProvider>
      </body>
    </html>
  );
}
