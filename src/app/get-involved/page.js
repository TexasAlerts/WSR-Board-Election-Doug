import Image from 'next/image';
import Script from 'next/script';
import GetInvolvedDynamic from '../../components/GetInvolvedDynamic';

export const metadata = {
  title: 'Get Involved - Doug Charles, Prosper Town Council Place 5',
  description:
    'Get involved: Volunteer, attend an event, or connect with Doug Charles, your incoming Prosper Town Council Place 5 member. Every action makes a real difference.',
  alternates: { canonical: '/get-involved' },
  openGraph: {
    title: 'Get Involved - Doug Charles, Prosper Town Council Place 5',
    description: 'Connect with Doug Charles, your incoming Town Council member. Every action makes a difference in bringing Common Sense leadership to Prosper.',
    url: 'https://www.dougcharles.com/get-involved',
    siteName: 'Doug Charles — Prosper Town Council, Place 5',
    locale: 'en_US',
    type: 'website',
    images: [{
      url: 'https://www.dougcharles.com/dc-preview.webp',
      width: 1200,
      height: 630,
      alt: 'Get Involved with Doug Charles — Prosper Town Council'
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Get Involved - Doug Charles, Prosper Town Council Place 5',
    description: 'Connect with Doug Charles, your incoming Prosper Town Council Place 5 member.',
    images: ['https://www.dougcharles.com/dc-preview.webp'],
  },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.dougcharles.com' },
    { '@type': 'ListItem', position: 2, name: 'Get Involved', item: 'https://www.dougcharles.com/get-involved' },
  ],
};

export default function GetInvolvedPage() {
  return (
    <div className="space-y-0">
      <Script id="get-involved-breadcrumb" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {/* Hero */}
      <section className="hero-pattern hero-gradient text-center py-16 md:py-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-10 right-20 w-64 h-64 bg-navy/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-20 w-48 h-48 bg-prosper-red/5 rounded-full blur-3xl"></div>
        </div>
        <Image
          src="/dc-logo.webp"
          alt=""
          aria-hidden="true"
          width={96}
          height={64}
          sizes="(max-width: 640px) 80px, (max-width: 768px) 112px, (max-width: 1024px) 128px, 144px"
          className="absolute top-4 right-4 w-20 sm:w-28 md:w-32 lg:w-36 h-auto opacity-80 pointer-events-none"
        />
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-navy mb-4">
            Get Involved
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Building <strong className="text-navy">Common Sense</strong> leadership for{' '}
            <strong className="text-prosper-red">ALL</strong> of Prosper
          </p>
        </div>
      </section>

      <GetInvolvedDynamic />
    </div>
  );
}
