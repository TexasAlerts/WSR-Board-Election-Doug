export const metadata = {
  alternates: { canonical: '/get-involved' },
  title: 'Get Involved | Doug Charles for Prosper Town Council',
  description: "Get involved with Doug Charles's campaign for Prosper Town Council Place 5. Request a yard sign, volunteer, or sign up for updates.",
  openGraph: {
    title: 'Get Involved | Doug Charles for Prosper Town Council',
    description: "Get involved with Doug Charles's campaign for Prosper Town Council Place 5. Request a yard sign, volunteer, or sign up for updates.",
    url: 'https://www.dougcharles.com/get-involved',
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

export default function GetInvolvedLayout({ children }) {
  return children;
}
