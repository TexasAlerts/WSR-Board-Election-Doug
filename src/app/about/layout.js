export const metadata = {
  title: 'Meet Doug Charles | About, Why I\'m Running & Priorities',
  description: 'Meet Doug Charles: 20-year Prosper resident, former P&Z Commissioner, 2020 Bond Committee member. Learn about his priorities for Town Council Place 5: Listen, Plan, Protect.',
  openGraph: {
    title: 'Meet Doug Charles | About, Why I\'m Running & Priorities',
    description: 'Meet Doug Charles: 20-year Prosper resident, former P&Z Commissioner, 2020 Bond Committee member. Learn about his priorities for Town Council Place 5: Listen, Plan, Protect.',
    url: 'https://www.dougcharles.com/about',
    images: [{
      url: 'https://www.dougcharles.com/campaign-preview.png',
      width: 1200,
      height: 630,
      alt: 'Doug Charles for Prosper Town Council Place 5 - A Common Sense Leader for ALL of Prosper',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['https://www.dougcharles.com/campaign-preview.png'],
  },
};

export default function AboutLayout({ children }) {
  return children;
}
