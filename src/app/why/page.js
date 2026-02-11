import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';

export const metadata = {
  title: 'Why I\'m Running - Doug Charles for Town of Prosper Town Council Place 5',
  description:
    'Why Doug Charles is running for Prosper Town Council Place 5. A 20-year resident committed to listening, planning, and protecting our community.',
  alternates: { canonical: '/why' },
  openGraph: {
    title: 'Why I\'m Running - Doug Charles for Prosper Town Council',
    description: 'A 20-year Prosper resident committed to listening, planning, and protecting our community. Common Sense leadership for ALL of Prosper.',
    url: 'https://www.dougcharles.com/why',
    siteName: 'Doug Charles for Town of Prosper Town Council Place 5',
    locale: 'en_US',
    type: 'website',
    images: [{ url: 'https://www.dougcharles.com/campaign-preview.png', width: 1200, height: 630, alt: 'Doug Charles - Why I\'m Running for Prosper Town Council' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Why I\'m Running - Doug Charles for Prosper Town Council',
    description: 'A 20-year resident committed to listening, planning, and protecting our community.',
    images: ['https://www.dougcharles.com/campaign-preview.png'],
  },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.dougcharles.com' },
    { '@type': 'ListItem', position: 2, name: 'Why I\'m Running', item: 'https://www.dougcharles.com/why' },
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
          height={64}
          className="absolute top-4 right-4 w-20 sm:w-28 md:w-32 lg:w-36 h-auto opacity-80 pointer-events-none"
        />
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-navy mb-4">
            Why I'm Running
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            <strong className="text-navy">Common Sense</strong> leadership for{' '}
            <strong className="text-prosper-red">ALL</strong> of Prosper
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
            <p>
              Prosper&apos;s explosive growth has brought{' '}
              <strong className="text-navy">thousands of new families</strong> who chose this
              community for the same reasons <strong className="text-navy">longtime residents</strong>{' '}
              love it. But as these families—and many longtime residents—settle in and look around,
              they're realizing that critical decisions about their neighborhoods, their roads, and
              their quality of life are being made{' '}
              <strong className="text-prosper-red">without their input</strong>.
            </p>
            <p>
              That&apos;s why I&apos;m committed to being a{' '}
              <strong className="text-navy">Common Sense Leader who listens BEFORE deciding</strong>.
              Through regular <strong className="text-prosper-red">Coffee with Doug meetups</strong>,{' '}
              <strong className="text-prosper-red">community polls</strong>, and open communication,
              I&apos;ll ensure every resident—new families and longtime neighbors alike—has a real
              voice in shaping Prosper&apos;s future.
            </p>
            <p>
              I've been{' '}
              <strong className="text-navy">in the room where these decisions get made</strong>. As
              a <strong className="text-navy">Planning & Zoning Commissioner</strong>, I've reviewed{' '}
              <strong className="text-navy">over 100 development applications</strong> and asked the
              hard questions about long-term impacts. Professionally, I've led strategic planning for
              initiatives involving <strong className="text-prosper-red">hundreds of millions of dollars</strong>—and
              I know what happens when you plan well, and when you don't. That experience matters for
              a growing community making <strong className="text-navy">billion-dollar infrastructure decisions</strong>.
            </p>
            <p>
              I&apos;m running to bring that{' '}
              <strong className="text-prosper-red">experience to the Town Council</strong>, and to
              make sure <strong className="text-navy">every resident&apos;s voice is heard</strong>—whether
              you&apos;ve been here for <strong className="text-navy">decades</strong> or just moved in
              last year.
            </p>
          </div>
        </div>
      </section>

      {/* Key Message */}
      <section className="priorities-gradient -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16 md:py-20 relative">
        <div className="absolute top-0 left-0 right-0 mx-auto w-16 h-1 accent-line-full"></div>
        <div className="max-w-3xl mx-auto">
          <div className="card text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-4">
              Town Council isn't about party labels.
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              It's about <strong className="text-navy">potholes, parks, and planning</strong>. It's
              about whether the roads work, growth happens thoughtfully, and{' '}
              <strong className="text-prosper-red">Prosper keeps its character</strong>.
            </p>
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
                I'll be available to residents—not just during campaign season, but{' '}
                <strong className="text-prosper-red">throughout my term</strong>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Vision Prosper Needs */}
      <section className="priorities-gradient -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16 md:py-20 relative">
        <div className="absolute top-0 left-0 right-0 mx-auto w-16 h-1 accent-line-full"></div>
        <div className="max-w-4xl mx-auto">
          <h2 className="section-title text-center mb-8">The Vision Prosper Needs</h2>

          <div className="space-y-6 text-base sm:text-lg text-gray-700 leading-relaxed">
            <p>
              Prosper needs more than good management—we need{' '}
              <strong className="text-prosper-red">visionary, collaborative leadership</strong>.
            </p>
            <p>
              The Fields, PGA, and Universal Theme Park are bringing{' '}
              <strong className="text-navy">millions of visitors to our doorstep</strong>. That&apos;s
              not a threat to <strong className="text-prosper-red">&apos;Small Town, Big Heart&apos;</strong>—it&apos;s an{' '}
              <strong className="text-prosper-red">opportunity to build something special</strong> if we
              act with <strong className="text-navy">vision and urgency</strong>.
            </p>
            <p>
              That means Town Council working{' '}
              <strong className="text-navy">WITH the Prosper Chamber of Commerce</strong>,{' '}
              <strong className="text-navy">Prosper Economic Development Committee</strong>, and
              business leaders to:
            </p>

            <ul className="space-y-3 pl-2 sm:pl-4 list-none" role="list">
              <li className="flex items-start gap-3">
                <span className="text-prosper-red font-bold text-xl leading-none mt-1">•</span>
                <span>
                  Create a <strong className="text-navy">bold vision for destinational downtown</strong>{' '}
                  that draws residents and visitors alike
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-prosper-red font-bold text-xl leading-none mt-1">•</span>
                <span>
                  Attract <strong className="text-navy">mixed-use commercial developments</strong>—retail,
                  dining, office, and gathering places{' '}
                  <strong className="text-prosper-red">(NOT apartments)</strong>—that capture regional
                  spending and create the destinations Prosper deserves
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-prosper-red font-bold text-xl leading-none mt-1">•</span>
                <span>
                  Build an environment where companies{' '}
                  <strong className="text-navy">plant headquarters and create careers</strong>—not just
                  retail jobs, but the <strong className="text-prosper-red">jobs of tomorrow</strong> that
                  keep our talent here
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-prosper-red font-bold text-xl leading-none mt-1">•</span>
                <span>
                  Make Prosper the place where residents{' '}
                  <strong className="text-prosper-red">live, work, play, and shop</strong>—without leaving town
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-prosper-red font-bold text-xl leading-none mt-1">•</span>
                <span>
                  Execute the <strong className="text-navy">Downtown Master Plan with urgency</strong>
                  —voters approved $2.3M, now deliver results
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-prosper-red font-bold text-xl leading-none mt-1">•</span>
                <span>
                  Streamline approvals so businesses{' '}
                  <strong className="text-navy">choose Prosper over our neighbors</strong>
                </span>
              </li>
            </ul>

            <p>
              We have everything needed to become the{' '}
              <strong className="text-prosper-red">premier community of choice</strong>—<strong className="text-navy">great schools</strong>,
              <strong className="text-navy">strong property values</strong>, <strong className="text-navy">prime location</strong>, and{' '}
              <strong className="text-prosper-red">&apos;Small Town, Big Heart&apos;</strong> character.
              We just need leadership willing to <strong className="text-navy">partner, plan proactively</strong>, and{' '}
              <strong className="text-navy">think bigger than the next subdivision approval</strong>.
            </p>

            <p className="text-xl font-semibold text-prosper-red">
              Our neighbors are landing billion-dollar destinations. Prosper can compete—and win.
            </p>
          </div>
        </div>
      </section>

      {/* The Stakes */}
      <section className="py-12 md:py-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="quote-enhanced">
            <h2 className="text-xl font-bold text-navy mb-4 not-italic">The Stakes Are High</h2>
            <p className="text-gray-700 leading-relaxed mb-4 not-italic">
              The decisions we make in the next few years will{' '}
              <strong className="text-navy">shape Prosper for decades</strong>. We're deciding where
              roads go, what gets built, and how we balance growth with quality of life.
            </p>
            <p className="text-gray-700 leading-relaxed not-italic">
              These decisions are too important to leave to chance. They deserve{' '}
              <strong className="text-prosper-red">experienced, thoughtful leadership</strong> from
              someone who knows Prosper and cares about its future.
            </p>
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
              Join the Campaign
            </Link>
            <Link href="/donate" className="btn-secondary">
              Donate
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
