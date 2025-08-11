import './globals.css';
import StickyNav from '../components/StickyNav';
import MobileCTA from '../components/MobileCTA';

export const metadata = {
  title: 'Doug Charles for Windsong Ranch HOA',
  description: 'Campaign site for Windsong Ranch HOA board election',
  viewport: { width: 'device-width', initialScale: 1 },
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
        <header className="bg-lagoon text-white text-xs sm:text-sm py-2 px-4 sticky top-0 z-50 shadow-md space-y-2">
          <div className="flex flex-wrap justify-center gap-2">
            {KEY_DATES.map((item, idx) => (
              <div
                key={idx}
                className="bg-lagoon-light text-lagoon px-3 py-1 rounded-full font-semibold uppercase"
              >
                {item.date} – {item.label}
              </div>
            ))}
            <div className="bg-lagoon-light text-lagoon px-3 py-1 rounded-full font-semibold uppercase">
              1 VOTE PER ADDRESS (TITLE OWNER)
            </div>
          </div>
          {phase !== 'post' && (
            <div className="text-center">
              <span className="font-semibold text-coral uppercase whitespace-nowrap">
                {countdownText}
              </span>
            </div>
          )}
        </header>
        {/* Navigation */}
        <StickyNav />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
          {children}
        </main>
        <MobileCTA />
        <footer className="bg-white py-6 mt-16 border-t">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-sm text-center">
            Self‑funded by Doug Charles. | © {new Date().getFullYear()} Windsong Ranch HOA Election
          </div>
        </footer>
      </body>
    </html>
  );
}