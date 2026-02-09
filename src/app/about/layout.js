export const metadata = {
  alternates: { canonical: '/about' },
  title: 'About Doug Charles | Prosper Town Council Place 5 Candidate',
  description:
    'Meet Doug Charles: 20-year Prosper resident, former P&Z Commissioner, 2020 Bond Committee member. Candidate for Prosper Town Council Place 5.',
  openGraph: {
    title: 'About Doug Charles | Prosper Town Council Place 5 Candidate',
    description:
      'Meet Doug Charles: 20-year Prosper resident, former P&Z Commissioner, 2020 Bond Committee member. Common Sense leadership for ALL of Prosper.',
    url: 'https://www.dougcharles.com/about',
    type: 'website',
    siteName: 'Doug Charles for Town of Prosper Town Council Place 5',
    locale: 'en_US',
    images: [
      {
        url: 'https://www.dougcharles.com/headshot.webp',
        width: 400,
        height: 500,
        alt: 'Doug Charles - Candidate for Prosper Town Council Place 5',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Doug Charles | Prosper Town Council Candidate',
    description:
      '20-year Prosper resident, former P&Z Commissioner. Common Sense leadership for ALL of Prosper.',
    images: ['https://www.dougcharles.com/headshot.webp'],
  },
};

export default function AboutLayout({ children }) {
  return children;
}
