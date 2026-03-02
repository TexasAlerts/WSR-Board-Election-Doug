export const metadata = {
  alternates: { canonical: '/why' },
  title: 'My Vision — Doug Charles — Prosper Town Council, Place 5',
  description:
    "Doug Charles' vision for Prosper Town Council, Place 5: A 20-year resident and former P&Z Commissioner committed to listening, planning, and protecting.",
  openGraph: {
    title: 'My Vision — Doug Charles — Prosper Town Council, Place 5',
    description:
      "Doug Charles' vision for Prosper Town Council, Place 5: A 20-year resident and former P&Z Commissioner committed to listening, planning, and protecting.",
    url: 'https://www.dougcharles.com/why',
    type: 'website',
    siteName: 'Doug Charles — Prosper Town Council, Place 5',
    locale: 'en_US',
    images: [
      {
        url: 'https://www.dougcharles.com/dc-preview.webp',
        width: 1200,
        height: 630,
        alt: 'My Vision — Doug Charles — Prosper Town Council, Place 5',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My Vision — Doug Charles — Prosper Town Council, Place 5',
    description:
      'Experienced, accessible leadership focused on results—not politics.',
    images: ['https://www.dougcharles.com/dc-preview.webp'],
  },
};

export default function WhyLayout({ children }) {
  return children;
}
