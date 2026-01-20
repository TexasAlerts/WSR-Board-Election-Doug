export const metadata = {
  title: 'Priorities | Doug Charles for Prosper Town Council',
  description: "Doug Charles's priorities: Listen to residents, Plan for long-term success, Protect Prosper's character. Common sense leadership for all of Prosper.",
  openGraph: {
    title: 'Priorities | Doug Charles for Prosper Town Council',
    description: "Doug Charles's priorities: Listen to residents, Plan for long-term success, Protect Prosper's character. Common sense leadership for all of Prosper.",
    url: 'https://www.dougcharles.com/priorities',
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

export default function PrioritiesLayout({ children }) {
  return children;
}
