import './globals.css';
import StickyNav from '../components/StickyNav';
import Countdown from '../components/Countdown';
import Link from 'next/link';
import Script from 'next/script';

export const metadata = {
  title: 'Doug Charles for Windsong Ranch HOA',
  description: 'Campaign site for Windsong Ranch HOA board election',
  icons: {
    icon: '/favicon.svg',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

const KEY_DATES = [
  { label: 'Meet the Candidates', date: 'Aug 14 @ 6 PM', description: 'Ask your questions. Hear real answers. Hold us accountable.' },
  { label: 'Voting Opens', date: 'Aug 20', description: 'Your chance to shape our future.' },
  { label: 'Voting Closes', date: 'Sept 2', description: 'Make sure your voice is counted.' },
  { label: 'Results Announced', date: 'Sept 3', description: 'Special meeting with results.' },
];

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta property="og:image" content="/wsr-logo.png" />
        <meta property="og:image:alt" content="Windsong Ranch HOA Logo" />
        <meta name="twitter:image" content="/wsr-logo.png" />
        <meta name="twitter:image:alt" content="Windsong Ranch HOA Logo" />
      </head>
      <body>
        {/* Sticky key dates banner */}
        <header className="bg-lagoon text-white text-sm sm:text-base py-2 px-4 sticky top-0 z-50 shadow-md">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-y-1 lg:gap-y-0">
            <div className="flex flex-wrap justify-center lg:justify-start gap-x-4 gap-y-1 w-full min-w-0 text-center lg:text-left">
              {KEY_DATES.map((item, idx) => (
                <div key={idx} className="whitespace-nowrap min-w-0 truncate">
                  <strong>{item.label}</strong> – {item.date}
                </div>
              ))}
              <div className="whitespace-nowrap min-w-0 truncate">
                <strong>One vote per home address, by a title owner.</strong>
              </div>
            </div>
            <div className="w-full lg:w-auto mt-1 lg:mt-0">
              <Countdown open="2025-08-20T00:00:00-05:00" close="2025-09-02T23:59:59-05:00" />
            </div>
          </div>
        </header>
        {/* Navigation */}
        <StickyNav />
        {/* SEO: JSON-LD structured data for homepage and key subpages */}
        <Script id="structured-data" type="application/ld+json" strategy="afterInteractive">
          {`
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Doug Charles for Windsong Ranch HOA",
              "url": "https://www.dougcharles.com",
              "description": "Official campaign site for Doug Charles, candidate for Windsong Ranch HOA Board. Learn about Doug, voting info, endorsements, Q&A, and the role of a board member.",
              "publisher": {
                "@type": "Person",
                "name": "Doug Charles"
              },
              "mainEntity": [
                {
                  "@type": "WebPage",
                  "name": "Voting Info",
                  "url": "https://www.dougcharles.com/voting"
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
                  "name": "Role of a Board Member",
                  "url": "https://www.dougcharles.com/board-role"
                }
              ]
            }
          `}
        </Script>
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 sm:pb-8">
          {children}
        </main>
        <footer className="bg-white py-6 mt-16 border-t pb-24 sm:pb-6">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-sm text-center">
            Programmed and owned by Doug Charles. | © {new Date().getFullYear()} Windsong Ranch HOA Election
          </div>
        </footer>
        {/* Mobile call to action */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t py-2 px-4 flex justify-around sm:hidden z-50">
          <Link href="/#get-involved" className="bg-lagoon text-white px-4 py-2 rounded-full text-sm">
            Get Involved
          </Link>
          <Link
            href="/?form=endorsement#get-involved"
            className="bg-coral text-white px-4 py-2 rounded-full text-sm"
          >
            Endorse Doug
          </Link>
        </div>
      </body>
    </html>
  );
}