import './globals.css';
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
  { label: 'Meet the Candidates', date: 'Aug 14 @ 6 PM', description: 'Ask your questions, hear real answers, hold us accountable.' },
  { label: 'Voting Opens', date: 'Aug 20', description: 'Your chance to shape our future.', },
  { label: 'Voting Closes', date: 'Sept 2', description: 'Make sure your voice is counted.', },
  { label: 'Results Announced', date: 'Sept 3', description: 'Special meeting with results.' },
];

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* Sticky key dates banner */}
        <header className="bg-lagoon text-white text-sm sm:text-base py-2 px-4 sticky top-0 z-50 shadow-md">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-y-1">
            <div className="flex flex-col sm:flex-row flex-wrap gap-x-4 gap-y-1">
              {KEY_DATES.map((item, idx) => (
                <div key={idx} className="whitespace-nowrap">
                  <strong>{item.label}</strong> – {item.date}
                </div>
              ))}
              <div className="whitespace-nowrap">
                <strong>One vote per home address by a Title Owner</strong>
              </div>
            </div>
              <Countdown
                open="2025-08-20T00:00:00-05:00"
                close="2025-09-02T23:59:59-05:00"
              />
            </div>
          </header>
        {/* Navigation */}
        <StickyNav />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="bg-white py-6 mt-16 border-t">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-sm text-center">
            Self‑funded by Doug Charles. | © {new Date().getFullYear()} Windsong Ranch HOA Election
          </div>
        </footer>
      </body>
    </html>
  );
}