import './globals.css';
import Link from 'next/link';
import StickyNav from '../components/StickyNav';
import Countdown from '../components/Countdown';

export const metadata = {
  title: 'Doug Charles for Windsong Ranch HOA',
  description: 'Campaign site for Windsong Ranch HOA board election',
  viewport: { width: 'device-width', initialScale: 1 },
  icons: {
    icon: '/favicon.svg',
  },
};

const KEY_DATES = [
  { label: 'Meet the Candidates', date: 'Aug 14 @ 6 PM' },
  { label: 'Voting Opens', date: 'Aug 20' },
  { label: 'Voting Closes', date: 'Sept 2' },
  { label: 'Results Announced', date: 'Sept 3' },
];

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* Sticky key dates banner */}
        <header className="bg-lagoon text-white text-sm sm:text-base py-2 px-4 sticky top-0 z-50 shadow-md">
          <div className="flex flex-col sm:flex-row flex-wrap items-center gap-x-4 gap-y-1">
            {KEY_DATES.map(({ label, date }, idx) => (
              <div key={idx} className="whitespace-nowrap">
                <strong>{label}</strong> – {date}
              </div>
            ))}
            <div className="whitespace-nowrap">
              <strong>One vote per home address by a Title Owner</strong>
            </div>
            <div className="sm:ml-auto sm:mt-0 mt-2">
              <Countdown
                open="2025-08-20T00:00:00-05:00"
                close="2025-09-02T23:59:59-05:00"
              />
            </div>
          </div>
        </header>

        {/* Navigation */}
        <StickyNav />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 sm:pb-8">
          {children}
        </main>

        <footer className="bg-white py-6 mt-16 border-t pb-24 sm:pb-6">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-sm text-center">
            Self‑funded by Doug Charles. | © {new Date().getFullYear()} Windsong Ranch HOA Election
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

