export const metadata = {
  alternates: { canonical: '/terms' },
  title: 'Terms of Use - Doug Charles — Prosper Town Council, Place 5',
  description:
    'Terms of use for the Doug Charles personal website. Review the rules governing your use of dougcharles.com.',
  openGraph: {
    title: 'Terms of Use - Doug Charles — Prosper Town Council, Place 5',
    description:
      'Terms of use for the Doug Charles personal website. Review the rules governing your use of dougcharles.com.',
    url: 'https://www.dougcharles.com/terms',
    type: 'website',
    siteName: 'Doug Charles — Prosper Town Council, Place 5',
    locale: 'en_US',
    images: [
      {
        url: 'https://www.dougcharles.com/dc-preview.webp',
        width: 1200,
        height: 630,
        alt: 'Terms of Use - Doug Charles — Prosper Town Council, Place 5',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Use - Doug Charles — Prosper Town Council, Place 5',
    description: 'Terms of use for the Doug Charles personal website.',
    images: ['https://www.dougcharles.com/dc-preview.webp'],
  },
};

export default function TermsLayout({ children }) {
  return children;
}
