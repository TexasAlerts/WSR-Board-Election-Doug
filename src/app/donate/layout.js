export const metadata = {
  alternates: { canonical: '/donate' },
  title: 'Donate | Doug Charles for Town of Prosper Town Council Place 5',
  description:
    'Support Doug Charles for Town of Prosper Town Council Place 5. Local elections are decided by a few hundred votes. Your contribution helps reach every voter.',
  openGraph: {
    title: 'Donate | Doug Charles for Town of Prosper Town Council Place 5',
    description:
      'Support Doug Charles for Town of Prosper Town Council Place 5. Local elections are decided by a few hundred votes. Your contribution helps reach every voter.',
    url: 'https://www.dougcharles.com/donate',
    type: 'website',
    siteName: 'Doug Charles for Town of Prosper Town Council Place 5',
    locale: 'en_US',
    images: [
      {
        url: 'https://www.dougcharles.com/campaign-preview.png',
        width: 1200,
        height: 630,
        alt: 'Doug Charles for Town of Prosper Town Council Place 5',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Donate | Doug Charles for Town of Prosper Town Council Place 5',
    description:
      'Support Doug Charles for Town of Prosper Town Council Place 5. Your contribution helps reach every voter.',
    images: ['https://www.dougcharles.com/campaign-preview.png'],
  },
};

export default function DonateLayout({ children }) {
  return children;
}
