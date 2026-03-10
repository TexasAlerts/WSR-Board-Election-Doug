export const metadata = {
  alternates: { canonical: '/donate' },
  title: 'Support Doug Charles — Prosper, Texas Town Council, Place 5',
  description:
    'Support Doug Charles, Prosper Town Council Place 5. Your contribution helps connect with more Prosper residents and strengthen community engagement.',
  openGraph: {
    title: 'Support Doug Charles — Prosper, Texas Town Council, Place 5',
    description:
      'Support Doug Charles, Prosper Town Council Place 5. Your contribution helps connect with more Prosper residents and strengthen community engagement.',
    url: 'https://www.dougcharles.com/donate',
    type: 'website',
    siteName: 'Doug Charles — Prosper, Texas Town Council, Place 5',
    locale: 'en_US',
    images: [
      {
        url: 'https://www.dougcharles.com/dc-preview.webp',
        width: 1200,
        height: 630,
        alt: 'Support Doug Charles — Prosper, Texas Town Council, Place 5',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Support Doug Charles — Prosper, Texas Town Council, Place 5',
    description:
      'Support Doug Charles, Prosper Town Council Place 5. Your contribution helps strengthen community engagement.',
    images: ['https://www.dougcharles.com/dc-preview.webp'],
  },
};

export default function DonateLayout({ children }) {
  return children;
}
