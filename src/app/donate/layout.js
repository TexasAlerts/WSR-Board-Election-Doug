export const metadata = {
  alternates: { canonical: '/donate' },
  title: 'Donate | Doug Charles for Prosper Town Council',
  description: 'Support Doug Charles for Prosper Town Council Place 5. Local elections are decided by a few hundred votes. Your contribution helps reach every voter with our Common Sense message.',
  openGraph: {
    title: 'Donate | Doug Charles for Prosper Town Council',
    description: 'Support Doug Charles for Prosper Town Council Place 5. Local elections are decided by a few hundred votes. Your contribution helps reach every voter with our Common Sense message.',
    url: 'https://www.dougcharles.com/donate',
    images: [{
      url: 'https://www.dougcharles.com/campaign-preview.png',
      width: 1200,
      height: 630,
      alt: 'Doug Charles for Prosper Town Council Place 5',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['https://www.dougcharles.com/campaign-preview.png'],
  },
};

export default function DonateLayout({ children }) {
  return children;
}
