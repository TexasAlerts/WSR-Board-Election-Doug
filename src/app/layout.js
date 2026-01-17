import './globals.css';
import StickyNav from '../components/StickyNav';
import Link from 'next/link';
import Script from 'next/script';
import { AuthProvider } from '../context/AuthContext';

export const metadata = {
  title: 'Doug Charles for Prosper Town Council - Place 5',
  description: 'A Common Sense Leader for All of Prosper. Doug Charles is running for Town Council Place 5 in the May 2026 election.',
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'Doug Charles for Prosper Town Council - Place 5',
    description: 'A Common Sense Leader for All of Prosper. Doug Charles is running for Town Council Place 5 in the May 2026 election.',
    url: 'https://www.dougcharles.com',
    siteName: 'Doug Charles for Prosper',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Doug Charles for Prosper Town Council - Place 5',
    description: 'A Common Sense Leader for All of Prosper',
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
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
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
              "@type": "WebSite",
              "name": "Doug Charles for Prosper Town Council",
              "url": "https://www.dougcharles.com",
              "description": "Official campaign site for Doug Charles, candidate for Prosper Town Council Place 5. A Common Sense Leader for All of Prosper.",
              "publisher": {
                "@type": "Person",
                "name": "Doug Charles"
              },
              "mainEntity": [
                {
                  "@type": "WebPage",
                  "name": "About Doug",
                  "url": "https://www.dougcharles.com/#about"
                },
                {
                  "@type": "WebPage",
                  "name": "Endorsements",
                  "url": "https://www.dougcharles.com/endorsements"
                },
                {
                  "@type": "WebPage",
                  "name": "Q&A",
                  "url": "https://www.dougcharles.com/qna"
                },
                {
                  "@type": "WebPage",
                  "name": "Issues",
                  "url": "https://www.dougcharles.com/#issues"
                }
              ]
            }
          `}
        </Script>
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 sm:pb-8">
          {children}
        </main>
        <footer className="bg-navy text-white py-6 mt-16 pb-24 sm:pb-6">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-sm text-center space-y-2">
            <p>Political advertising paid for by Doug Charles for Prosper Town Council.</p>
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
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t py-2 px-4 flex justify-around sm:hidden z-50">
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
