import './globals.css';
import StickyNav from '../components/StickyNav';
import ErrorBoundary from '../components/ErrorBoundary';
import Link from 'next/link';
import Script from 'next/script';
import { AuthProvider } from '../context/AuthContext';

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
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&family=Oswald:wght@500;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AuthProvider>
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
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 sm:pb-8">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
        <footer className="bg-navy text-white py-6 mt-16 pb-24 sm:pb-6">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-sm text-center space-y-2">
            <p>Political advertising paid for by Doug Charles for Prosper Town Council Place 5.</p>
            <p>Questions? Email <a href="mailto:doug@dougcharles.com" className="text-white underline hover:text-gray-300">doug@dougcharles.com</a></p>
            <div className="flex justify-center gap-4 pt-2">
              <a href="#" aria-label="Facebook" className="text-white hover:text-gray-300">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" aria-label="X (Twitter)" className="text-white hover:text-gray-300">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
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
        {/* Mobile call to action */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t py-2 px-4 pb-safe flex justify-around sm:hidden z-50">
          <Link href="/#get-involved" className="bg-navy text-white px-4 py-2 rounded-full text-sm">
            Get Involved
          </Link>
          <Link
            href="/?form=endorsement#get-involved"
            className="bg-prosper-red text-white px-4 py-2 rounded-full text-sm"
          >
            Endorse Doug
          </Link>
        </div>
        </AuthProvider>
      </body>
    </html>
  );
}
