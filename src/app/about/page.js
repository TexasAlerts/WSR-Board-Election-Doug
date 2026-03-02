import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import ConditionalDonateLink from '../../components/ConditionalDonateLink';

// Breadcrumb JSON-LD structured data
const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://www.dougcharles.com',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'About Doug',
      item: 'https://www.dougcharles.com/about',
    },
  ],
};


export default function AboutPage() {
  return (
    <div className="space-y-0">
      {/* Breadcrumb JSON-LD */}
      <Script
        id="about-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

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
            Meet Doug Charles
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            <strong className="text-navy">Common Sense</strong> leadership for{' '}
            <strong className="text-prosper-red">ALL</strong> of Prosper
          </p>
        </div>
      </section>

      {/* Bio Section */}
      <section className="py-12 md:py-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center">
            <div className="w-full md:w-2/5 flex-shrink-0">
              <div className="relative max-w-[280px] md:max-w-[320px] mx-auto">
                <Image
                  src="/headshot.webp"
                  alt="Doug Charles"
                  width={320}
                  height={400}
                  sizes="(max-width: 640px) 280px, (max-width: 1024px) 320px, 400px"
                  className="relative rounded-xl shadow-navy-lg w-full"
                />
              </div>
            </div>
            <div className="w-full md:w-3/5">
              <div className="space-y-4 text-base md:text-lg text-gray-700 leading-relaxed">
                <p>
                  I moved to <strong className="text-navy">Prosper 20 years ago</strong> for the
                  same reasons you probably did—<strong className="text-navy">great schools</strong>
                  , <strong className="text-navy">safe neighborhoods</strong>, and room to raise a
                  family. <strong className="text-navy">My wife, Wanda, and I have been married
                  for 30 years</strong>, and we've raised our three children here—all{' '}
                  <strong className="text-prosper-red">Prosper ISD graduates</strong>. This isn't
                  theoretical for me; I've lived the decisions we're making about{' '}
                  <strong className="text-navy">our roads, our tax dollars, and preserving what makes Prosper home</strong>.
                </p>
                <p>
                  Back then, everyone knew your name,{' '}
                  <strong className="text-navy">Friday night football</strong> was the center of
                  town, and <strong className="text-prosper-red">&apos;Small Town, Big Heart&apos;</strong>{' '}
                  wasn&apos;t just a slogan—it was how we lived. We&apos;ve grown fast, and with
                  that growth comes important choices about our future. I&apos;m committed to ensuring
                  Prosper remains a place where families thrive, local businesses flourish, and the
                  values that brought us all here—<strong className="text-navy">great schools</strong>
                  , <strong className="text-navy">safe neighborhoods</strong>, and{' '}
                  <strong className="text-navy">genuine community</strong>—continue to define who we
                  are.
                </p>
                <p>
                  I&apos;ve served on the{' '}
                  <strong className="text-navy">Planning & Zoning Commission</strong>, the{' '}
                  <strong className="text-navy">2020 Bond Committee</strong>, and led the{' '}
                  <strong className="text-navy">Windsong Ranch PISD annexation</strong> petition that
                  will redirect <strong className="text-navy">$6.5M+ in annual property taxes</strong> from
                  Denton ISD to Prosper ISD—pending TEA approval.
                </p>
                <p className="text-prosper-red font-semibold">
                  Whether you've been here 20 years or 2 months, you deserve a voice at the table.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="py-16 md:py-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="section-title text-center mb-4">Experience & Service</h2>
          <p className="section-subtitle text-center">
            A proven track record of community leadership
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
            <div className="card h-full">
              <div className="flex items-start gap-4">
                <div className="w-4 h-4 bg-gradient-to-br from-prosper-red to-red-dark rounded-full mt-1 flex-shrink-0 shadow-sm"></div>
                <div>
                  <h3 className="text-xl font-bold text-navy mb-2">US Army Reserves</h3>
                  <p className="text-gray-600">
                    1992–1996 · Served with <strong className="text-navy">dedication to duty and country</strong>, developing leadership skills and a{' '}
                    <strong className="text-navy">commitment to service</strong> that continues today.
                  </p>
                </div>
              </div>
            </div>

            <div className="card h-full">
              <div className="flex items-start gap-4">
                <div className="w-4 h-4 bg-gradient-to-br from-prosper-red to-red-dark rounded-full mt-1 flex-shrink-0 shadow-sm"></div>
                <div>
                  <h3 className="text-xl font-bold text-navy mb-2">20-Year Prosper Resident</h3>
                  <p className="text-gray-600">
                    <strong className="text-navy">Deep roots</strong> in this community. I've
                    watched Prosper grow from a{' '}
                    <strong className="text-navy">small town to a thriving suburb</strong>, and I
                    understand{' '}
                    <strong className="text-prosper-red">what we need to preserve</strong>.
                  </p>
                </div>
              </div>
            </div>

            <div className="card h-full">
              <div className="flex items-start gap-4">
                <div className="w-4 h-4 bg-gradient-to-br from-prosper-red to-red-dark rounded-full mt-1 flex-shrink-0 shadow-sm"></div>
                <div>
                  <h3 className="text-xl font-bold text-navy mb-2">
                    Planning & Zoning Commissioner
                  </h3>
                  <p className="text-gray-600">
                    2021-2023 · Reviewed{' '}
                    <strong className="text-navy">over 100 development applications</strong>. I
                    know how land use decisions{' '}
                    <strong className="text-prosper-red">impact neighborhoods</strong>.
                  </p>
                </div>
              </div>
            </div>

            <div className="card h-full">
              <div className="flex items-start gap-4">
                <div className="w-4 h-4 bg-gradient-to-br from-prosper-red to-red-dark rounded-full mt-1 flex-shrink-0 shadow-sm"></div>
                <div>
                  <h3 className="text-xl font-bold text-navy mb-2">2020 Bond Election Committee</h3>
                  <p className="text-gray-600">
                    Helped pass <strong className="text-navy">$210M</strong> bond for roads, parks,
                    and facilities that continue to benefit Prosper.
                  </p>
                </div>
              </div>
            </div>

            <div className="card h-full">
              <div className="flex items-start gap-4">
                <div className="w-4 h-4 bg-gradient-to-br from-prosper-red to-red-dark rounded-full mt-1 flex-shrink-0 shadow-sm"></div>
                <div>
                  <h3 className="text-xl font-bold text-navy mb-2">
                    Elected Windsong Ranch Board Member
                  </h3>
                  <p className="text-gray-600">
                    Oct 2025 · Elected to the board of{' '}
                    <strong className="text-navy">one of Prosper&apos;s largest communities</strong>
                    . I understand the{' '}
                    <strong className="text-prosper-red">issues residents face every day</strong>.
                  </p>
                </div>
              </div>
            </div>

            <div className="card h-full">
              <div className="flex items-start gap-4">
                <div className="w-4 h-4 bg-gradient-to-br from-prosper-red to-red-dark rounded-full mt-1 flex-shrink-0 shadow-sm"></div>
                <div>
                  <h3 className="text-xl font-bold text-navy mb-2">
                    PISD Annexation Lead Petitioner
                  </h3>
                  <p className="text-gray-600">
                    Organized <strong className="text-navy">585 residents</strong>, retained legal
                    counsel, and led the petition to annex Windsong Ranch into Prosper ISD—seeking to redirect{' '}
                    <strong className="text-navy">$6.5M+ in annual property taxes</strong> to PISD—pending state approval.
                  </p>
                </div>
              </div>
            </div>

            <div className="card h-full">
              <div className="flex items-start gap-4">
                <div className="w-4 h-4 bg-gradient-to-br from-prosper-red to-red-dark rounded-full mt-1 flex-shrink-0 shadow-sm"></div>
                <div>
                  <h3 className="text-xl font-bold text-navy mb-2">Education</h3>
                  <p className="text-gray-600 mb-3">
                    <strong className="text-navy">MBA</strong> (Master of Business Administration)
                  </p>
                  <p className="text-gray-600">
                    Strategic planning and financial management expertise applied to{' '}
                    <strong className="text-navy">community development and responsible governance</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Background */}
      <section className="priorities-gradient -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16 md:py-20 relative">
        <div className="absolute top-0 left-0 right-0 mx-auto w-16 h-1 accent-line-full"></div>
        <div className="max-w-4xl mx-auto">
          <h2 className="section-title text-center mb-8">Professional Background</h2>
          <div className="card">
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              In my professional career, I'm a{' '}
              <strong className="text-navy">Senior Vice President</strong> focused on business
              innovation and transformation. I lead teams that solve complex problems, manage
              budgets, and <strong className="text-navy">deliver results</strong>.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              I bring that same <strong className="text-navy">Common Sense</strong> approach to
              local government—for <strong className="text-prosper-red">ALL</strong> of Prosper:
              understand the problem, gather input, develop solutions, and execute. No
              grandstanding, no games—just get it done, and done right.
            </p>
          </div>
        </div>
      </section>

      {/* Why This Moment Matters */}
      <section className="priorities-gradient -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16 md:py-20 relative">
        <div className="absolute top-0 left-0 right-0 mx-auto w-16 h-1 accent-line-full"></div>
        <div className="max-w-4xl mx-auto">
          <h2 className="section-title text-center mb-8">Why This Moment Matters</h2>

          <div className="card">
            <div className="space-y-6 text-base sm:text-lg text-gray-700 leading-relaxed">
              <p>
                Prosper is making decisions <strong className="text-navy">RIGHT NOW</strong> that will
                define our community for decades:
              </p>

              <ul className="custom-list space-y-3 pl-4 sm:pl-6">
                <li>
                  <span className="custom-bullet text-prosper-red font-bold text-xl leading-none" aria-hidden="true">•</span>
                  <span>The Tollway corridor development strategy</span>
                </li>
                <li>
                  <span className="custom-bullet text-prosper-red font-bold text-xl leading-none" aria-hidden="true">•</span>
                  <span>Downtown revitalization implementation</span>
                </li>
                <li>
                  <span className="custom-bullet text-prosper-red font-bold text-xl leading-none" aria-hidden="true">•</span>
                  <span>
                    Commercial development that either enhances quality of life or degrades it
                  </span>
                </li>
                <li>
                  <span className="custom-bullet text-prosper-red font-bold text-xl leading-none" aria-hidden="true">•</span>
                  <span>Infrastructure investments that either solve problems or create new ones</span>
                </li>
              </ul>

              <p className="font-semibold text-navy">These decisions need someone who:</p>

              <ul className="custom-list space-y-3 pl-4 sm:pl-6">
                <li>
                  <span className="custom-bullet text-navy font-bold text-lg leading-none" aria-hidden="true">✓</span>
                  <span>
                    Knows how to <strong className="text-navy">read development applications</strong> and
                    ask the right questions
                  </span>
                </li>
                <li>
                  <span className="custom-bullet text-navy font-bold text-lg leading-none" aria-hidden="true">✓</span>
                  <span>
                    Understands <strong className="text-navy">fiscal responsibility</strong> from bond
                    committees and budget fights
                  </span>
                </li>
                <li>
                  <span className="custom-bullet text-navy font-bold text-lg leading-none" aria-hidden="true">✓</span>
                  <span>
                    Has <strong className="text-navy">organized residents and delivered results</strong>
                  </span>
                </li>
                <li>
                  <span className="custom-bullet text-navy font-bold text-lg leading-none" aria-hidden="true">✓</span>
                  <span>
                    Brings professional experience{' '}
                    <strong className="text-navy">solving complex problems</strong> and managing large
                    budgets
                  </span>
                </li>
                <li>
                  <span className="custom-bullet text-navy font-bold text-lg leading-none" aria-hidden="true">✓</span>
                  <span>
                    Will <strong className="text-navy">make Prosper easier to do business in</strong>{' '}
                    while protecting what makes us special
                  </span>
                </li>
              </ul>

              <p className="text-xl font-semibold text-navy text-center mt-8">
                That&apos;s the leadership I&apos;m bringing to Town Council.
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
