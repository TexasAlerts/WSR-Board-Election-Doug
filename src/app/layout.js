import './globals.css';
import StickyNav from '../components/StickyNav';
import MobileCTABar from '../components/MobileCTABar';

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

// Helper to compute days to next key date for the countdown.
function getCountdown(now) {
  const open = new Date('2025-08-20T00:00:00-05:00');
  const close = new Date('2025-09-02T23:59:59-05:00');
  const nowTs = new Date(now);
  if (nowTs < open) {
    const days = Math.ceil((open - nowTs) / (1000 * 60 * 60 * 24));
    return { phase: 'pre', days };
  }
  if (nowTs >= open && nowTs <= close) {
    const days = Math.ceil((close - nowTs) / (1000 * 60 * 60 * 24));
    return { phase: 'open', days };
  }
  return { phase: 'post', days: 0 };
}

export default function RootLayout({ children }) {
  const now = new Date().toISOString();
  const { phase, days } = getCountdown(now);
  const countdownLabel = phase === 'pre' ? 'Voting opens in' : phase === 'open' ? 'Voting closes in' : '';
  const countdownText = `${countdownLabel} ${days} day${days === 1 ? '' : 's'}`;

  return (
    <html lang="en">
      <body>
        {/* Sticky key dates banner */}
        <header className="bg-lagoon text-white text-sm sm:text-base py-2 px-4 sticky top-0 z-50 shadow-md">
          <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-y-1 text-center sm:text-left">
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
            {phase !== 'post' && (
              <div className="sm:ml-auto sm:text-right">
                {/* Highlight the countdown label and number so it stands out */}
                <span className="font-semibold text-coral whitespace-nowrap uppercase">
                  {countdownText}
                </span>
              </div>
            )}
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
        <MobileCTABar />
        </body>
      </html>
  );
}