import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import ConditionalDonateLink from '../../components/ConditionalDonateLink';

export const metadata = {
  title: 'My Vision - Doug Charles — Prosper Town Council, Place 5',
  description:
    'Doug Charles\' vision for Prosper Town Council Place 5: A 20-year resident and former P&Z Commissioner committed to listening, planning, and protecting.',
  alternates: { canonical: '/why' },
  openGraph: {
    title: 'My Vision - Doug Charles for Prosper Town Council',
    description: 'A 20-year Prosper resident committed to listening, planning, and protecting our community. Common Sense leadership for ALL of Prosper.',
    url: 'https://www.dougcharles.com/why',
    siteName: 'Doug Charles — Prosper Town Council, Place 5',
    locale: 'en_US',
    type: 'website',
    images: [{ url: 'https://www.dougcharles.com/campaign-preview.webp', width: 1200, height: 630, alt: 'Doug Charles - My Vision for Prosper Town Council' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My Vision - Doug Charles for Prosper Town Council',
    description: 'A 20-year resident committed to listening, planning, and protecting our community.',
    images: ['https://www.dougcharles.com/campaign-preview.webp'],
  },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.dougcharles.com' },
    { '@type': 'ListItem', position: 2, name: 'My Vision', item: 'https://www.dougcharles.com/why' },
  ],
};

export default function WhyPage() {
  return (
    <div className="space-y-0">
      <Script id="why-breadcrumb" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {/* Hero */}
      <section className="hero-pattern hero-gradient text-center py-16 md:py-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-10 right-20 w-64 h-64 bg-navy/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-20 w-48 h-48 bg-prosper-red/5 rounded-full blur-3xl"></div>
        </div>
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
            My Vision for Prosper
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            <strong className="text-navy">Common Sense</strong> leadership for{' '}
            <strong className="text-prosper-red">ALL</strong> of Prosper
          </p>
        </div>
      </section>

      {/* Key Message - Moved Up */}
      <section className="priorities-gradient -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16 md:py-20 relative">
        <div className="absolute top-0 left-0 right-0 mx-auto w-16 h-1 accent-line-full"></div>
        <div className="max-w-3xl mx-auto">
          <div className="card text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-4">
              This isn't about insiders, power players, or which neighborhood you're from.
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              It's about <strong className="text-navy">potholes, roadways, parks, fiscal policies, and public safety</strong>. It's
              about whether the roads work, growth happens thoughtfully, and{' '}
              <strong className="text-prosper-red">Prosper keeps its character</strong>.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Whether you&apos;ve been here <strong className="text-navy">20 years or 2 months</strong>,
              live on the <strong className="text-navy">east side or the west side</strong>,
              you deserve a voice.
            </p>
          </div>
        </div>
      </section>

      {/* The Vision Prosper Needs - Moved Up */}
      <section className="py-16 md:py-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="section-title text-center mb-8">The Vision Prosper Needs</h2>

          <div className="card">
            <div className="space-y-6 text-base sm:text-lg text-gray-700 leading-relaxed">
              <p>
                The Fields, PGA, and Universal Theme Park are bringing{' '}
                <strong className="text-navy">millions of visitors to our doorstep</strong>. With
                strategic planning and proactive partnerships between Town Council, the{' '}
                <strong className="text-navy">Prosper Chamber of Commerce</strong>, and the{' '}
                <strong className="text-navy">Prosper Economic Development Committee</strong>, we can
                make Prosper their <strong className="text-prosper-red">destination of choice</strong>—not
                just another drive-through suburb.
              </p>
              <p>
                That means creating a <strong className="text-navy">bold vision for destinational downtown</strong>,
                attracting <strong className="text-navy">mixed-use commercial developments</strong> (retail,
                dining, office—<strong className="text-prosper-red">NOT apartments</strong>) that capture
                regional spending, and building an environment where companies{' '}
                <strong className="text-navy">plant headquarters and create careers</strong>—not just retail jobs.
              </p>
              <p className="text-center pt-4">
                <Link href="/priorities" className="btn-outline">
                  See My Full Priorities →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What I'll Do Differently */}
      <section className="py-16 md:py-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="section-title text-center mb-4">What I'll Do Differently</h2>
          <p className="section-subtitle text-center">
            <strong className="text-navy">Common Sense</strong> leadership for{' '}
            <strong className="text-prosper-red">ALL</strong> of Prosper
          </p>

          <div className="grid gap-6 md:grid-cols-2 mt-10">
            <div className="card h-full">
              <h3 className="text-xl font-bold text-navy mb-3">Listen Before Deciding</h3>
              <p className="text-gray-600">
                Too often, residents feel like decisions are made before their input is gathered.
                I'll push for{' '}
                <strong className="text-navy">meaningful public engagement early</strong> in the
                process—not after the plans are already drawn.
              </p>
            </div>

            <div className="card h-full">
              <h3 className="text-xl font-bold text-navy mb-3">Ask the Hard Questions</h3>
              <p className="text-gray-600">
                What will this cost long-term? Does our infrastructure support this? What do
                residents actually want? I'll bring the same{' '}
                <strong className="text-navy">analytical approach</strong> I use professionally to
                every council decision.
              </p>
            </div>

            <div className="card h-full">
              <h3 className="text-xl font-bold text-navy mb-3">Focus on Results</h3>
              <p className="text-gray-600">
                <strong className="text-navy">No grandstanding, no political theater.</strong> Just
                thoughtful governance focused on making Prosper better for everyone who lives here.
              </p>
            </div>

            <div className="card h-full">
              <h3 className="text-xl font-bold text-navy mb-3">Be Accessible</h3>
              <p className="text-gray-600">
                Your council members should be <strong className="text-navy">easy to reach</strong>.
                I'll be available to residents{' '}
                <strong className="text-prosper-red">throughout my term</strong>—your council member should always be easy to reach.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Stakes */}
      <section className="priorities-gradient -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16 md:py-20 relative">
        <div className="absolute top-0 left-0 right-0 mx-auto w-16 h-1 accent-line-full"></div>
        <div className="max-w-3xl mx-auto">
          <h2 className="section-title text-center mb-8">The Stakes Are High</h2>
          <div className="card">
            <div className="space-y-4 text-base sm:text-lg text-gray-700 leading-relaxed">
              <p>
                The decisions we make in the next few years will{' '}
                <strong className="text-navy">shape Prosper for decades</strong>. We're deciding where
                roads go, what gets built, and how we balance growth with quality of life.
              </p>
              <p>
                These decisions are too important to leave to chance. They deserve{' '}
                <strong className="text-prosper-red">experienced, thoughtful leadership</strong> from
                someone who knows Prosper and cares about its future.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Links to Other Pages */}
      <section className="py-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="section-title text-center mb-8">Learn More</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/about" className="card text-center hover:shadow-navy-lg transition-shadow">
              <h3 className="text-xl font-bold text-navy mb-2">About Doug</h3>
              <p className="text-gray-600 text-sm">20 years in Prosper, ready to serve</p>
            </Link>
            <Link
              href="/priorities"
              className="card text-center hover:shadow-navy-lg transition-shadow"
            >
              <h3 className="text-xl font-bold text-navy mb-2">My Priorities</h3>
              <p className="text-gray-600 text-sm">Listen. Plan. Protect.</p>
            </Link>
            <Link
              href="/track-record"
              className="card text-center hover:shadow-navy-lg transition-shadow"
            >
              <h3 className="text-xl font-bold text-navy mb-2">Track Record</h3>
              <p className="text-gray-600 text-sm">Results, not just promises</p>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-gradient text-white -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">Ready to Get Involved?</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/get-involved" className="btn-white">
              Share Your Ideas
            </Link>
            <ConditionalDonateLink className="btn-secondary">
              Donate
            </ConditionalDonateLink>
          </div>
        </div>
      </section>
    </div>
  );
}
