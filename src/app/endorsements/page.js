import Image from 'next/image';
import Script from 'next/script';
import EndorsementsDynamic from '../../components/EndorsementsDynamic';

export const metadata = {
  title: 'Endorsements - Doug Charles for Prosper Town Council',
  description:
    'See who supports Doug Charles for Prosper Town Council Place 5. Add your endorsement, show your support, and join the movement for Common Sense leadership.',
  alternates: { canonical: '/endorsements' },
  openGraph: {
    title: 'Endorsements - Doug Charles for Prosper Town Council',
    description: 'See who supports Doug Charles for Prosper Town Council Place 5. Add your endorsement, show your support, and join the movement for Common Sense leadership.',
    url: 'https://www.dougcharles.com/endorsements',
    siteName: 'Doug Charles for Town of Prosper Town Council Place 5',
    locale: 'en_US',
    type: 'website',
    images: [{
      url: 'https://www.dougcharles.com/campaign-preview.webp',
      width: 1200,
      height: 630,
      alt: 'Endorsements - Doug Charles Campaign'
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Endorsements - Doug Charles for Prosper Town Council',
    description: 'See who supports Doug Charles. Add your endorsement for Common Sense leadership.',
    images: ['https://www.dougcharles.com/campaign-preview.webp'],
  },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.dougcharles.com' },
    { '@type': 'ListItem', position: 2, name: 'Endorsements', item: 'https://www.dougcharles.com/endorsements' },
  ],
};

export default function EndorsementsPage() {
  return (
    <div className="space-y-0">
      <Script id="endorsements-breadcrumb" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {/* Hero */}
      <section className="hero-pattern hero-gradient text-center py-16 md:py-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Logo accent */}
        <Image
          src="/campaign-logo.webp"
          alt=""
          aria-hidden="true"
          width={96}
          sizes="(max-width: 640px) 80px, (max-width: 768px) 112px, (max-width: 1024px) 128px, 144px"
          height={64}
          className="absolute top-4 right-4 w-20 sm:w-28 md:w-32 lg:w-36 h-auto opacity-80 pointer-events-none"
        />
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-navy mb-4">
            Endorsements
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Neighbors supporting <strong className="text-navy">Common Sense</strong> leadership for{' '}
            <strong className="text-prosper-red">ALL</strong> of Prosper
          </p>
        </div>
      </section>

      <EndorsementsDynamic />
    </div>
  );
}
