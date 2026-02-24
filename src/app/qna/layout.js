export const metadata = {
  alternates: { canonical: '/qna' },
  title: 'Q&A with Doug - Doug Charles, Prosper Town Council Place 5',
  description:
    'Questions for Doug Charles? Ask here and get answers about his positions and priorities for Prosper Town Council Place 5.',
  openGraph: {
    title: 'Q&A with Doug - Doug Charles, Prosper Town Council Place 5',
    description:
      'Questions for Doug Charles? Ask here and get answers about his positions and priorities for Prosper Town Council Place 5.',
    url: 'https://www.dougcharles.com/qna',
    type: 'website',
    siteName: 'Doug Charles — Prosper Town Council, Place 5',
    locale: 'en_US',
    images: [
      {
        url: 'https://www.dougcharles.com/campaign-preview.webp',
        width: 1200,
        height: 630,
        alt: 'Q&A with Doug - Doug Charles, Prosper Town Council Place 5',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Q&A with Doug - Doug Charles, Prosper Town Council Place 5',
    description:
      'Ask Doug Charles questions about his positions and priorities for Prosper Town Council Place 5.',
    images: ['https://www.dougcharles.com/campaign-preview.webp'],
  },
};

export default function QnALayout({ children }) {
  return children;
}
