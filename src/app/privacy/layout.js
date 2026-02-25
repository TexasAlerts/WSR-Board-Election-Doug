export const metadata = {
  alternates: { canonical: '/privacy' },
  title: 'Privacy Policy - Doug Charles — Prosper Town Council, Place 5',
  description:
    'Privacy policy for the Doug Charles personal website. Learn how we collect, use, and protect your personal information.',
  openGraph: {
    title: 'Privacy Policy - Doug Charles — Prosper Town Council, Place 5',
    description:
      'Privacy policy for the Doug Charles personal website. Learn how we collect, use, and protect your personal information.',
    url: 'https://www.dougcharles.com/privacy',
    type: 'website',
    siteName: 'Doug Charles — Prosper Town Council, Place 5',
    locale: 'en_US',
    images: [
      {
        url: 'https://www.dougcharles.com/dc-preview.webp',
        width: 1200,
        height: 630,
        alt: 'Privacy Policy - Doug Charles — Prosper Town Council, Place 5',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy - Doug Charles — Prosper Town Council, Place 5',
    description: 'Privacy policy for the Doug Charles personal website.',
    images: ['https://www.dougcharles.com/dc-preview.webp'],
  },
};

export default function PrivacyLayout({ children }) {
  return children;
}
