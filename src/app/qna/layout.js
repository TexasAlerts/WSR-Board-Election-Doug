export const metadata = {
  title: 'Q&A | Doug Charles for Prosper Town Council',
  description: 'Questions for Doug Charles? Ask here and get answers about his positions and priorities for Prosper Town Council Place 5.',
  openGraph: {
    title: 'Q&A | Doug Charles for Prosper Town Council',
    description: 'Questions for Doug Charles? Ask here and get answers about his positions and priorities for Prosper Town Council Place 5.',
    url: 'https://www.dougcharles.com/qna',
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

export default function QnALayout({ children }) {
  return children;
}
