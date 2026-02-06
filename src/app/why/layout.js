export const metadata = {
  alternates: { canonical: '/why' },
  title: "Why I'm Running | Doug Charles for Town of Prosper Town Council Place 5",
  description:
    'Why Doug Charles is running for Prosper Town Council. Experienced, accessible leadership focused on results—not politics. May 2026 election.',
  openGraph: {
    title: "Why I'm Running | Doug Charles for Town of Prosper Town Council Place 5",
    description:
      'Why Doug Charles is running for Prosper Town Council. Experienced, accessible leadership focused on results—not politics. May 2026 election.',
    url: 'https://www.dougcharles.com/why',
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
    title: "Why I'm Running | Doug Charles for Town of Prosper Town Council Place 5",
    description:
      'Experienced, accessible leadership focused on results—not politics. May 2026 election.',
    images: ['https://www.dougcharles.com/campaign-preview.png'],
  },
};

export default function WhyLayout({ children }) {
  return children;
}
