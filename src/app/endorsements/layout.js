export const metadata = {
  alternates: { canonical: '/endorsements' },
  title: 'Endorsements | Doug Charles for Prosper Town Council',
  description: "See who's endorsing Doug Charles for Prosper Town Council Place 5. Read testimonials from Prosper neighbors and add your voice to support Common Sense leadership for ALL of Prosper.",
  openGraph: {
    title: 'Endorsements | Doug Charles for Prosper Town Council',
    description: "See who's endorsing Doug Charles for Prosper Town Council Place 5. Read testimonials from Prosper neighbors and add your voice to support Common Sense leadership for ALL of Prosper.",
    url: 'https://www.dougcharles.com/endorsements',
    type: 'website',
    siteName: 'Doug Charles for Prosper',
    locale: 'en_US',
    images: [{
      url: 'https://www.dougcharles.com/campaign-preview.png',
      width: 1200,
      height: 630,
      alt: 'Doug Charles for Prosper Town Council Place 5',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Endorsements | Doug Charles for Prosper Town Council',
    description: "See who's endorsing Doug Charles. Read testimonials from Prosper neighbors.",
    images: ['https://www.dougcharles.com/campaign-preview.png'],
  },
};

export default function EndorsementsLayout({ children }) {
  return children;
}
