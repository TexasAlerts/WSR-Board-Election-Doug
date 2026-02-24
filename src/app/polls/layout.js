export const metadata = {
  alternates: { canonical: '/polls' },
  title: 'Community Polls - Doug Charles, Prosper Town Council Place 5',
  description:
    "Share your voice on issues that matter to Prosper. Vote on community polls about growth, traffic, parks, and local priorities. Your input helps shape our town's future.",
  openGraph: {
    title: 'Community Polls - Doug Charles, Prosper Town Council Place 5',
    description:
      "Share your voice on issues that matter to Prosper. Vote on community polls about growth, traffic, parks, and local priorities. Your input helps shape our town's future.",
    url: 'https://www.dougcharles.com/polls',
    type: 'website',
    siteName: 'Doug Charles — Prosper Town Council, Place 5',
    locale: 'en_US',
    images: [
      {
        url: 'https://www.dougcharles.com/campaign-preview.webp',
        width: 1200,
        height: 630,
        alt: 'Community Polls - Doug Charles, Prosper Town Council Place 5',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Community Polls - Doug Charles, Prosper Town Council Place 5',
    description:
      'Vote on community polls about growth, traffic, parks, and local priorities in Prosper.',
    images: ['https://www.dougcharles.com/campaign-preview.webp'],
  },
};

export default function PollsLayout({ children }) {
  return children;
}
