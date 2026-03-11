export const metadata = {
  alternates: { canonical: '/get-involved' },
  title: 'Engage — Doug Charles — Prosper, Texas Town Council, Place 5',
  description:
    'Engage with Doug Charles, Prosper Town Council Place 5. Stay connected, share ideas, and help shape our community.',
  openGraph: {
    title: 'Engage — Doug Charles — Prosper, Texas Town Council, Place 5',
    description:
      'Engage with Doug Charles, Prosper Town Council Place 5. Stay connected, share ideas, and help shape our community.',
    url: 'https://www.dougcharles.com/get-involved',
    type: 'website',
    siteName: 'Doug Charles — Prosper, Texas Town Council, Place 5',
    locale: 'en_US',
    images: [
      {
        url: 'https://www.dougcharles.com/dc-preview.webp',
        width: 1200,
        height: 630,
        alt: 'Engage — Doug Charles — Prosper, Texas Town Council, Place 5',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Engage — Doug Charles — Prosper, Texas Town Council, Place 5',
    description:
      'Stay connected and engage with Doug Charles, your Prosper Town Council Place 5 councilmember-elect.',
    images: ['https://www.dougcharles.com/dc-preview.webp'],
  },
};

export default function GetInvolvedLayout({ children }) {
  return children;
}
