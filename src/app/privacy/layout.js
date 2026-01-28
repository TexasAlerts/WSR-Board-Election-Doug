export const metadata = {
  alternates: { canonical: '/privacy' },
  title: 'Privacy Policy | Doug Charles for Prosper Town Council',
  description: 'Privacy policy for the Doug Charles for Prosper Town Council Place 5 campaign website.',
  openGraph: {
    title: 'Privacy Policy | Doug Charles for Prosper Town Council',
    description: 'Privacy policy for the Doug Charles for Prosper Town Council Place 5 campaign website.',
    url: 'https://www.dougcharles.com/privacy',
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

export default function PrivacyLayout({ children }) {
  return children;
}
