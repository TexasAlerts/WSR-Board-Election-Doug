export const metadata = {
  alternates: { canonical: '/endorsements' },
  title: 'Endorsements — Doug Charles — Prosper Town Council, Place 5',
  description:
    'See who supports Doug Charles, Prosper Town Council, Place 5. Read testimonials from neighbors and show your support.',
  openGraph: {
    title: 'Endorsements — Doug Charles — Prosper Town Council, Place 5',
    description:
      'See who supports Doug Charles, Prosper Town Council, Place 5. Read testimonials from neighbors and show your support.',
    url: 'https://www.dougcharles.com/endorsements',
    type: 'website',
    siteName: 'Doug Charles — Prosper Town Council, Place 5',
    locale: 'en_US',
    images: [
      {
        url: 'https://www.dougcharles.com/dc-preview.webp',
        width: 1200,
        height: 630,
        alt: 'Endorsements — Doug Charles — Prosper Town Council, Place 5',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Endorsements — Doug Charles — Prosper Town Council, Place 5',
    description: 'See who supports Doug Charles. Read testimonials from Prosper neighbors.',
    images: ['https://www.dougcharles.com/dc-preview.webp'],
  },
};

export default function EndorsementsLayout({ children }) {
  return children;
}
