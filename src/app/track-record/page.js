import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import ConditionalDonateLink from '../../components/ConditionalDonateLink';

export const metadata = {
  title: 'Track Record - Doug Charles — Prosper Town Council, Place 5',
  description:
    'Doug Charles proven track record of community service: Planning & Zoning Commission, Windsong Ranch Board Member, and years of civic leadership in Prosper.',
  alternates: { canonical: '/track-record' },
  openGraph: {
    title: 'Track Record - Doug Charles — Prosper Town Council, Place 5',
    description: 'Proven results: Planning & Zoning Commission, Windsong Ranch Board Member, and years of civic leadership in Prosper.',
    url: 'https://www.dougcharles.com/track-record',
    siteName: 'Doug Charles — Prosper Town Council, Place 5',
    locale: 'en_US',
    type: 'website',
    images: [{ url: 'https://www.dougcharles.com/dc-preview.webp', width: 1200, height: 630, alt: 'Track Record - Doug Charles — Prosper Town Council, Place 5' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Track Record - Doug Charles — Prosper Town Council, Place 5',
    description: 'Proven results: Planning & Zoning Commission, Bond Committee, and civic leadership.',
    images: ['https://www.dougcharles.com/dc-preview.webp'],
  },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.dougcharles.com' },
    { '@type': 'ListItem', position: 2, name: 'Track Record', item: 'https://www.dougcharles.com/track-record' },
  ],
};

export default function TrackRecordPage() {
  return (
    <div className="space-y-0">
      <Script id="track-record-breadcrumb" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
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
          sizes="(max-width: 640px) 80px, (max-width: 768px) 112px, (max-width: 1024px) 128px, 144px"
          height={64}
          className="absolute top-4 right-4 w-20 sm:w-28 md:w-32 lg:w-36 h-auto opacity-80 pointer-events-none"
        />
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-navy mb-4">
            Track Record
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            <strong className="text-navy">Results</strong>, not just <strong className="text-prosper-red">promises</strong>
          </p>
        </div>
      </section>

      {/* Framing Section */}
      <section className="py-12 md:py-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 priorities-gradient">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-6">
            When Prosper Needs Results, Not Just Promises
          </h2>
          <div className="card">
            <div className="space-y-4 text-base sm:text-lg text-gray-700 leading-relaxed">
              <p>
                Over six years, I&apos;ve driven change from the ground up—organizing{' '}
                <strong className="text-navy">community-wide petition drives</strong> for 40-foot lot
                protections and leading the{' '}
                <strong className="text-navy">Windsong Ranch PISD annexation effort</strong> that will
                redirect <strong className="text-prosper-red">$6.5M+ in annual property taxes</strong> to
                Prosper ISD. I&apos;ve stood for <strong className="text-prosper-red">fiscal responsibility</strong>{' '}
                (including tax rate relief) and{' '}
                <strong className="text-prosper-red">competitive public safety compensation</strong>. At
                planning commission hearings, bond committees, and council meetings, I&apos;ve{' '}
                <strong className="text-navy">asked the hard questions</strong> and delivered results.
              </p>
              <p className="text-xl font-semibold text-navy">
                This isn&apos;t about talking. It&apos;s about doing—and doing it right.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Proven Track Record */}
      <section className="py-16 md:py-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="section-title text-center mb-4">Proven Track Record</h2>
          <p className="section-subtitle text-center">
            A history of community advocacy and results
          </p>

          <div className="space-y-5 mt-10">
            <div className="card">
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                <time
                  dateTime="2019-11"
                  className="text-sm font-bold text-navy whitespace-nowrap bg-navy/5 px-3 py-1 rounded-full self-start"
                >
                  Nov 2019
                </time>
                <div>
                  <h3 className="text-lg font-bold text-navy mb-2">
                    Organized 585 Residents to Protect Neighborhood Standards
                  </h3>
                  <p className="text-gray-600 mb-2">
                    As Prosper's growth accelerated, I wanted to{' '}
                    <strong className="text-navy">protect the community</strong> I moved to while
                    embracing <strong className="text-navy">positive growth</strong>. When a
                    developer sought to allow 40-foot lots and "4-pack" homes in Windsong Ranch, I
                    organized a petition that gathered{' '}
                    <strong className="text-prosper-red">585 signatures in 48 hours</strong>. The
                    Planning & Zoning Commission voted{' '}
                    <strong className="text-navy">7-0 against</strong> the proposal.
                  </p>
                  <p className="text-gray-600 italic text-sm mb-3">
                    "Thank you for being engaged and active in keeping Prosper the envy of the
                    area." — Prosper Town Council Member
                  </p>
                  <p className="text-navy font-semibold text-sm">
                    Growth can happen thoughtfully when residents have a voice from the beginning.
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                <time
                  dateTime="2020-08"
                  className="text-sm font-bold text-navy whitespace-nowrap bg-navy/5 px-3 py-1 rounded-full self-start"
                >
                  Aug 2020
                </time>
                <div>
                  <h3 className="text-lg font-bold text-navy mb-2">
                    Advocated for Neighborhood Character
                  </h3>
                  <p className="text-gray-600 mb-2">
                    Spoke at Town Council questioning whether new home designs fit existing{' '}
                    <strong className="text-navy">neighborhood character</strong>.
                  </p>
                  <p className="text-gray-600 italic text-sm">
                    "Not questioning the quality of the product or even the look of the product. I'm
                    just questioning does it really fit our subdivision." — Prosper Press News
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                <time
                  dateTime="2020-11"
                  className="text-sm font-bold text-navy whitespace-nowrap bg-navy/5 px-3 py-1 rounded-full self-start"
                >
                  Nov 2020
                </time>
                <div>
                  <h3 className="text-lg font-bold text-navy mb-2">Bond Election Committee</h3>
                  <p className="text-gray-600">
                    Helped pass <strong className="text-navy">$210M</strong> in bonds for roads,
                    parks, and facilities—infrastructure investments that continue to benefit
                    Prosper residents today.
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                <time
                  dateTime="2021-09"
                  className="text-sm font-bold text-navy whitespace-nowrap bg-navy/5 px-3 py-1 rounded-full self-start"
                >
                  Sep 2021
                </time>
                <div>
                  <h3 className="text-lg font-bold text-navy mb-2">
                    Advocated for Tax Relief & Public Safety Investment
                  </h3>
                  <p className="text-gray-600 mb-2">
                    Appeared before Town Council pushing for a{' '}
                    <strong className="text-navy">4-cent tax rate reduction</strong> and{' '}
                    <strong className="text-prosper-red">higher Police and Fire pay</strong>.
                    Challenged the Town's excessive reserves—taxpayer money should be invested to
                    accelerate infrastructure or returned via rate reductions, not hoarded. Working
                    with council leaders, we achieved a{' '}
                    <strong className="text-navy">1-cent rate reduction</strong>—the{' '}
                    <strong className="text-navy">first decrease in 14 years</strong>—and moved the
                    proposed public safety pay increase to{' '}
                    <strong className="text-navy">5%</strong>.
                  </p>
                  <p className="text-gray-600 text-sm">
                    I'm a fiscal hawk—but I'll invest wisely to grow our town smartly.
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                <time
                  dateTime="2021/2023"
                  className="text-sm font-bold text-navy whitespace-nowrap bg-navy/5 px-3 py-1 rounded-full self-start"
                >
                  2021-2023
                </time>
                <div>
                  <h3 className="text-lg font-bold text-navy mb-2">
                    Planning & Zoning Commissioner
                  </h3>
                  <p className="text-gray-600">
                    Reviewed{' '}
                    <strong className="text-navy">over 100 development applications</strong>.
                    Learned firsthand how land use decisions impact neighborhoods—and how to{' '}
                    <strong className="text-navy">ask the right questions</strong>.
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                <time
                  dateTime="2023-11"
                  className="text-sm font-bold text-navy whitespace-nowrap bg-navy/5 px-3 py-1 rounded-full self-start"
                >
                  Nov 2023
                </time>
                <div>
                  <h3 className="text-lg font-bold text-navy mb-2">
                    Advocated for Fiscal Responsibility in PISD Bond
                  </h3>
                  <p className="text-gray-600 mb-2">
                    Consistent advocacy for{' '}
                    <strong className="text-navy">fiscal responsibility</strong> means being willing
                    to take a stand where <strong className="text-prosper-red">Common Sense</strong>{' '}
                    matters. During the <strong className="text-navy">$2.7 billion</strong> PISD
                    bond election, I spoke publicly about smart spending priorities. Voters
                    agreed—passing three propositions while{' '}
                    <strong className="text-navy">rejecting the $102 million stadium bond</strong>.
                  </p>
                  <p className="text-gray-600 italic text-sm">
                    "We need smart spending that maximizes benefits for our students without
                    unnecessary burdens on our finances." —{' '}
                    <a
                      href="https://texasscorecard.com/local/prosper-isd-passes-3-bonds-totaling-2-7-billion-stadium-bond-fails/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-navy hover:underline"
                    >
                      Texas Scorecard
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                <time
                  dateTime="2025-04"
                  className="text-sm font-bold text-navy whitespace-nowrap bg-navy/5 px-3 py-1 rounded-full self-start"
                >
                  Apr 2025
                </time>
                <div>
                  <h3 className="text-lg font-bold text-navy mb-2">
                    Filed Ethics Complaint on Outside PAC Spending
                  </h3>
                  <p className="text-gray-600 mb-2">
                    I pay attention to the details and{' '}
                    <strong className="text-navy">follow the money</strong> to ensure voters know
                    who is supporting candidates making decisions in our town and ISD. When a
                    Washington D.C.-based PAC spent{' '}
                    <strong className="text-prosper-red">$115,000</strong> on Prosper ISD races
                    without transparency, I filed a formal complaint with the{' '}
                    <strong className="text-navy">Texas Ethics Commission</strong>. The Dallas
                    Morning News Editorial Board noted my transparency, contrasting it with
                    secretive outside groups.
                  </p>
                  <p className="text-gray-600 italic text-sm">
                    "$115,000 just didn't randomly show up from Washington, D.C., into Prosper ISD.
                    There's an agenda." —{' '}
                    <a
                      href="https://www.dallasnews.com/news/elections/2025/04/29/state-ethics-panel-to-review-allegations-of-dark-money-in-prosper-isd-trustee-race/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-navy hover:underline"
                    >
                      Dallas Morning News
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                <time
                  dateTime="2025-10"
                  className="text-sm font-bold text-navy whitespace-nowrap bg-navy/5 px-3 py-1 rounded-full self-start"
                >
                  Oct 2025
                </time>
                <div>
                  <h3 className="text-lg font-bold text-navy mb-2">Windsong Ranch HOA Board</h3>
                  <p className="text-gray-600">
                    <strong className="text-navy">Elected by neighbors</strong> to serve on the
                    board of one of Prosper's largest communities.
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                <time
                  dateTime="2025-11"
                  className="text-sm font-bold text-navy whitespace-nowrap bg-navy/5 px-3 py-1 rounded-full self-start"
                >
                  Nov 2025
                </time>
                <div>
                  <h3 className="text-lg font-bold text-navy mb-2">
                    Common Sense on Bond Proposals
                  </h3>
                  <p className="text-gray-600 mb-2">
                    Prosper voters sent a clear message:{' '}
                    <strong className="text-navy">
                      plan smarter, communicate better, and build it right the first time—or with a
                      clear plan that voters understand and can support.
                    </strong>
                  </p>
                  <p className="text-gray-600 mb-2">
                    <strong className="text-prosper-red">
                      NO to poor planning and poor communication that creates pressure now and for years
                      to come.
                    </strong>{' '}
                    We failed to build the right engagement, explain why we needed what was proposed, and show the plan moving forward.
                  </p>
                  <p className="text-gray-600 mb-2">
                    I strongly advocated for{' '}
                    <strong className="text-navy">Props A (Streets) and F (Downtown)</strong>—and
                    voters agreed, passing both.
                  </p>
                  <p className="text-gray-600 mb-2">
                    I strongly opposed the undersized library. The Town's Master Plan called for
                    49,000 sq ft; the bond proposed just 33,000. That's not smart growth—it's bad
                    planning.
                  </p>
                  <p className="text-gray-600 italic text-sm mb-1">
                    "You don't build small when you already know it's too small. That's not
                    progress, that's poor planning and lacks common sense!"
                  </p>
                  <p className="text-gray-600 italic text-sm mb-3">
                    "They failed to communicate. They failed to engage." —{' '}
                    <a
                      href="https://www.dallasnews.com/opinion/commentary/2025/11/12/damm-far-north-suburbs-try-to-balance-growth-taxes/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-navy hover:underline"
                    >
                      Dallas Morning News
                    </a>
                  </p>
                  <p className="text-navy font-semibold text-sm">
                    Voters told us: plan smarter, communicate better, and build it right the first time.
                    I&apos;m listening.
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                <time
                  dateTime="2025-12"
                  className="text-sm font-bold text-navy whitespace-nowrap bg-navy/5 px-3 py-1 rounded-full self-start"
                >
                  Dec 2025
                </time>
                <div>
                  <h3 className="text-lg font-bold text-navy mb-2">PISD Annexation Victory</h3>
                  <p className="text-gray-600 mb-2">
                    Led petition to bring{' '}
                    <strong className="text-prosper-red">$6.5 million+</strong> in annual property
                    taxes home to Prosper ISD. Currently,{' '}
                    <strong className="text-navy">274 Windsong Ranch students</strong> attend
                    Prosper ISD schools, yet their property taxes go to{' '}
                    <strong className="text-navy">
                      Denton ISD—which provides zero educational services
                    </strong>
                    . With <strong className="text-prosper-red">52.6% of registered voters</strong>{' '}
                    signing the petition, Prosper ISD Board approved unanimously on December 15,
                    2025. Now awaiting TEA Commissioner final decision.
                  </p>
                  <p className="text-gray-600 italic text-sm mb-2">
                    "Students already attend and have full access to Prosper ISD, yet property tax
                    revenue flows to Denton ISD, which educates none of these children."
                  </p>
                  <div className="space-y-2">
                    <a
                      href="https://prosperisdpetition.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-navy font-medium hover:underline text-sm inline-block"
                    >
                      Track progress at prosperisdpetition.com →
                    </a>
                    <p className="text-navy font-semibold text-sm">
                      Commercial growth that pays for infrastructure instead of burdening
                      homeowners—that&apos;s how we protect taxpayers while growing responsibly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Links to Other Pages */}
      <section className="priorities-gradient -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16">
        <div className="absolute top-0 left-0 right-0 mx-auto w-16 h-1 accent-line-full"></div>
        <div className="max-w-4xl mx-auto">
          <h2 className="section-title text-center mb-8">Learn More</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/about" className="card text-center hover:shadow-navy-lg transition-shadow">
              <h3 className="text-xl font-bold text-navy mb-2">About Doug</h3>
              <p className="text-gray-600 text-sm">20 years in Prosper, preparing to serve</p>
            </Link>
            <Link href="/why" className="card text-center hover:shadow-navy-lg transition-shadow">
              <h3 className="text-xl font-bold text-navy mb-2">My Vision</h3>
              <p className="text-gray-600 text-sm">My vision and what I'll do differently</p>
            </Link>
            <Link
              href="/priorities"
              className="card text-center hover:shadow-navy-lg transition-shadow"
            >
              <h3 className="text-xl font-bold text-navy mb-2">My Priorities</h3>
              <p className="text-gray-600 text-sm">Listen. Plan. Protect.</p>
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
              Get Involved
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
