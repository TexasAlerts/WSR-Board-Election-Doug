export const metadata = {
  alternates: { canonical: '/about' },
  title: 'About Doug Charles | Prosper Town Council Place 5 Candidate',
  description: 'Meet Doug Charles: 20-year Prosper resident, former P&Z Commissioner, 2020 Bond Committee member. Candidate for Prosper Town Council Place 5.',
  openGraph: {
    title: 'About Doug Charles | Prosper Town Council Place 5 Candidate',
    description: 'Meet Doug Charles: 20-year Prosper resident, former P&Z Commissioner, 2020 Bond Committee member. Common sense leadership for all of Prosper.',
    url: 'https://www.dougcharles.com/about',
    type: 'website',
    siteName: 'Doug Charles for Prosper',
    locale: 'en_US',
    images: [{
      url: 'https://www.dougcharles.com/campaign-preview.png',
      width: 1200,
      height: 630,
      alt: 'Doug Charles for Prosper Town Council Place 5 - A Common Sense Leader for ALL of Prosper',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Doug Charles | Prosper Town Council Candidate',
    description: '20-year Prosper resident, former P&Z Commissioner. Common sense leadership for all of Prosper.',
    images: ['https://www.dougcharles.com/campaign-preview.png'],
  },
};

export default function AboutLayout({ children }) {
  return children;
}
