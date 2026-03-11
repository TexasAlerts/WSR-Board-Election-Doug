export const metadata = {
  alternates: { canonical: '/about' },
  title: 'About Doug Charles — Prosper, Texas Town Council, Place 5',
  description:
    'Meet Doug Charles: 20-year Prosper resident, former P&Z Commissioner, 2020 Bond Committee member. Prosper Town Council Member-Elect, Place 5.',
  openGraph: {
    title: 'About Doug Charles — Prosper, Texas Town Council, Place 5',
    description:
      'Meet Doug Charles: 20-year Prosper resident, former P&Z Commissioner, 2020 Bond Committee member. Common Sense leadership for ALL of Prosper.',
    url: 'https://www.dougcharles.com/about',
    type: 'website',
    siteName: 'Doug Charles — Prosper, Texas Town Council, Place 5',
    locale: 'en_US',
    images: [
      {
        url: 'https://www.dougcharles.com/dc-preview.webp',
        width: 1200,
        height: 630,
        alt: 'About Doug Charles — Prosper, Texas Town Council, Place 5',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Doug Charles — Prosper, Texas Town Council, Place 5',
    description:
      '20-year Prosper resident, former P&Z Commissioner. Common Sense leadership for ALL of Prosper.',
    images: ['https://www.dougcharles.com/dc-preview.webp'],
  },
};

export default function AboutLayout({ children }) {
  return children;
}
