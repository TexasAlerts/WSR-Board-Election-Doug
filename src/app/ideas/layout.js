export const metadata = {
  title: 'Community Ideas | Doug Charles for Prosper Town Council',
  description: 'Submit your ideas for making Prosper better. Doug Charles believes great ideas come from neighbors. Share your vision for roads, parks, development, and more.',
  openGraph: {
    title: 'Community Ideas | Doug Charles for Prosper Town Council',
    description: 'Submit your ideas for making Prosper better. Doug Charles believes great ideas come from neighbors. Share your vision for roads, parks, development, and more.',
    url: 'https://www.dougcharles.com/ideas',
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

export default function IdeasLayout({ children }) {
  return children;
}
