export const metadata = {
  title: "Why I'm Running | Doug Charles for Prosper Town Council",
  description: 'Why Doug Charles is running for Prosper Town Council. Experienced, accessible leadership focused on results—not politics. May 2026 election.',
  openGraph: {
    title: "Why I'm Running | Doug Charles for Prosper Town Council",
    description: 'Why Doug Charles is running for Prosper Town Council. Experienced, accessible leadership focused on results—not politics. May 2026 election.',
    url: 'https://www.dougcharles.com/why',
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

export default function WhyLayout({ children }) {
  return children;
}
