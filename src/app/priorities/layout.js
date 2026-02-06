export const metadata = {
  alternates: { canonical: '/priorities' },
  title: 'Priorities | Doug Charles for Town of Prosper Town Council Place 5',
  description:
    "Doug Charles's priorities: Listen to residents, Plan for long-term success, Protect Prosper's character. Common Sense leadership for ALL of Prosper.",
  openGraph: {
    title: 'Priorities | Doug Charles for Town of Prosper Town Council Place 5',
    description:
      "Doug Charles's priorities: Listen to residents, Plan for long-term success, Protect Prosper's character. Common Sense leadership for ALL of Prosper.",
    url: 'https://www.dougcharles.com/priorities',
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
    title: 'Priorities | Doug Charles for Town of Prosper Town Council Place 5',
    description: "Listen to residents, Plan for long-term success, Protect Prosper's character.",
    images: ['https://www.dougcharles.com/campaign-preview.png'],
  },
};

export default function PrioritiesLayout({ children }) {
  return children;
}
