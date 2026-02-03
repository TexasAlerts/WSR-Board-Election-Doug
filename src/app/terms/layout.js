export const metadata = {
  alternates: { canonical: '/terms' },
  title: 'Terms of Use | Doug Charles for Prosper Town Council',
  description:
    'Terms of use for the Doug Charles for Prosper Town Council Place 5 campaign website. Review the rules governing your use of dougcharles.com.',
  openGraph: {
    title: 'Terms of Use | Doug Charles for Prosper Town Council',
    description:
      'Terms of use for the Doug Charles for Prosper Town Council Place 5 campaign website. Review the rules governing your use of dougcharles.com.',
    url: 'https://www.dougcharles.com/terms',
    type: 'website',
    siteName: 'Doug Charles for Prosper',
    locale: 'en_US',
    images: [
      {
        url: 'https://www.dougcharles.com/campaign-preview.png',
        width: 1200,
        height: 630,
        alt: 'Doug Charles for Prosper Town Council Place 5',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Use | Doug Charles for Prosper Town Council',
    description: 'Terms of use for the Doug Charles for Prosper Town Council campaign website.',
    images: ['https://www.dougcharles.com/campaign-preview.png'],
  },
};

export default function TermsLayout({ children }) {
  return children;
}
