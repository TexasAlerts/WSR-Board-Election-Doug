export const metadata = {
  alternates: { canonical: '/track-record' },
  title: 'Track Record - Doug Charles — Prosper Town Council, Place 5',
  description:
    "Doug Charles's proven track record: organized 585 residents, P&Z Commissioner, $210M bond committee, PISD annexation victory. Results, not just promises.",
  openGraph: {
    title: 'Track Record - Doug Charles — Prosper Town Council, Place 5',
    description:
      "Doug Charles's proven track record: organized 585 residents, P&Z Commissioner, $210M bond committee, PISD annexation victory. Results, not just promises.",
    url: 'https://www.dougcharles.com/track-record',
    type: 'website',
    siteName: 'Doug Charles — Prosper Town Council, Place 5',
    locale: 'en_US',
    images: [
      {
        url: 'https://www.dougcharles.com/campaign-preview.webp',
        width: 1200,
        height: 630,
        alt: 'Track Record - Doug Charles — Prosper Town Council, Place 5',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Track Record - Doug Charles — Prosper Town Council, Place 5',
    description:
      'Proven results: P&Z Commissioner, $210M bond committee, PISD annexation victory. Results, not just promises.',
    images: ['https://www.dougcharles.com/campaign-preview.webp'],
  },
};

export default function TrackRecordLayout({ children }) {
  return children;
}
