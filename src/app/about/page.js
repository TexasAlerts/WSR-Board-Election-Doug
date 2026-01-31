import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="space-y-0">
      {/* Hero */}
      <section className="hero-pattern hero-gradient text-center py-16 md:py-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-10 right-20 w-64 h-64 bg-navy/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-20 w-48 h-48 bg-prosper-red/5 rounded-full blur-3xl"></div>
        </div>
        <Image
          src="/campaign-logo.webp"
          alt="Doug Charles for Prosper Town Council Place 5"
          width={96}
          height={64}
          className="absolute top-4 right-4 w-16 sm:w-20 md:w-24 h-auto opacity-80 pointer-events-none"
        />
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-navy mb-4 animate-fade-in-down">
            Meet Doug Charles
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto animate-fade-in animate-delay-200">
            <strong>Common Sense</strong> leadership for <strong className="text-prosper-red">ALL</strong> of Prosper
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
                  src="/headshot.jpg"
                  alt="Doug Charles"
                  width={320}
                  height={400}
                  className="relative rounded-xl shadow-navy-lg w-full"
                />
              </div>
            </div>
            <div className="w-full md:w-3/5">
              <div className="space-y-4 text-base md:text-lg text-gray-700 leading-relaxed">
                <p>
                  I moved to <strong className="text-navy">Prosper 20 years ago</strong> for the same reasons you probably did—<strong className="text-navy">great schools</strong>, <strong className="text-navy">safe neighborhoods</strong>, and room to raise a family. Back then, everybody knew your name, <strong className="text-navy">Friday night football</strong> was the center of town, and <strong className="text-prosper-red">Small Town, Big Heart</strong> wasn&apos;t just a slogan—it was how we lived. We&apos;ve grown fast, and somewhere along the way, we started losing that feel. I&apos;m running to make sure we <strong className="text-navy">get it back</strong>.
                </p>
                <p>
                  I&apos;ve served on the <strong className="text-navy">Planning & Zoning Commission</strong>, the <strong className="text-navy">2020 Bond Committee</strong>, and led the <strong className="text-navy">Windsong Ranch PISD annexation effort</strong> that will bring $6.5M in annual tax revenue to Prosper ISD.
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
          <p className="section-subtitle text-center">A proven track record of community leadership</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
            <div className="card h-full">
              <div className="flex items-start gap-4">
                <div className="w-4 h-4 bg-gradient-to-br from-prosper-red to-red-dark rounded-full mt-1 flex-shrink-0 shadow-sm"></div>
                <div>
                  <h3 className="text-xl font-bold text-navy mb-2">20-Year Prosper Resident</h3>
                  <p className="text-gray-600">Deep roots in this community. I've watched Prosper grow from a small town to a thriving suburb, and I understand what we need to preserve.</p>
                </div>
              </div>
            </div>

            <div className="card h-full">
              <div className="flex items-start gap-4">
                <div className="w-4 h-4 bg-gradient-to-br from-prosper-red to-red-dark rounded-full mt-1 flex-shrink-0 shadow-sm"></div>
                <div>
                  <h3 className="text-xl font-bold text-navy mb-2">Planning & Zoning Commissioner</h3>
                  <p className="text-gray-600">2021-2023 · Reviewed hundreds of development applications. I know how land use decisions impact neighborhoods.</p>
                </div>
              </div>
            </div>

            <div className="card h-full">
              <div className="flex items-start gap-4">
                <div className="w-4 h-4 bg-gradient-to-br from-prosper-red to-red-dark rounded-full mt-1 flex-shrink-0 shadow-sm"></div>
                <div>
                  <h3 className="text-xl font-bold text-navy mb-2">2020 Bond Election Committee</h3>
                  <p className="text-gray-600">Helped pass <strong className="text-navy">$210M</strong> bond for roads, parks, and facilities that continue to benefit Prosper.</p>
                </div>
              </div>
            </div>

            <div className="card h-full">
              <div className="flex items-start gap-4">
                <div className="w-4 h-4 bg-gradient-to-br from-prosper-red to-red-dark rounded-full mt-1 flex-shrink-0 shadow-sm"></div>
                <div>
                  <h3 className="text-xl font-bold text-navy mb-2">Elected Windsong Ranch Board Member</h3>
                  <p className="text-gray-600">Oct 2025 · Elected to the board of one of Prosper&apos;s largest communities. I understand the issues residents face every day.</p>
                </div>
              </div>
            </div>

            <div className="card h-full">
              <div className="flex items-start gap-4">
                <div className="w-4 h-4 bg-gradient-to-br from-prosper-red to-red-dark rounded-full mt-1 flex-shrink-0 shadow-sm"></div>
                <div>
                  <h3 className="text-xl font-bold text-navy mb-2">PISD Annexation Lead Petitioner</h3>
                  <p className="text-gray-600">Organized 585 residents, retained legal counsel, and led the effort to annex Windsong Ranch into Prosper ISD—bringing <strong className="text-navy">$6.5M</strong> in annual tax revenue.</p>
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
              In my professional career, I'm a Senior Vice President focused on business innovation and transformation. I lead teams that solve complex problems, manage budgets, and deliver results.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              I bring that same <strong className="text-navy">common sense</strong> approach to local government—for <strong className="text-prosper-red">ALL</strong> of Prosper: understand the problem, gather input, develop solutions, and execute. No grandstanding, no games—just get it done, and done right.
            </p>
          </div>
        </div>
      </section>

      {/* Links to Other Pages */}
      <section className="py-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="section-title text-center mb-8">Learn More</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/why" className="card text-center hover:shadow-navy-lg transition-shadow">
              <h3 className="text-xl font-bold text-navy mb-2">Why I'm Running</h3>
              <p className="text-gray-600 text-sm">My motivation and what I'll do differently</p>
            </Link>
            <Link href="/priorities" className="card text-center hover:shadow-navy-lg transition-shadow">
              <h3 className="text-xl font-bold text-navy mb-2">My Priorities</h3>
              <p className="text-gray-600 text-sm">Listen. Plan. Protect.</p>
            </Link>
            <Link href="/track-record" className="card text-center hover:shadow-navy-lg transition-shadow">
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
