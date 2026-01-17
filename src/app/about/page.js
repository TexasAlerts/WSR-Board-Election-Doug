"use client";

import Image from 'next/image';
import Link from 'next/link';
import Reveal from '../../components/Reveal';

export default function AboutPage() {
  return (
    <div className="space-y-0">
      {/* Hero */}
      <section className="hero-pattern hero-gradient text-center py-16 md:py-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-10 left-20 w-64 h-64 bg-navy/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-20 w-48 h-48 bg-prosper-red/5 rounded-full blur-3xl"></div>
        </div>
        {/* Logo accent */}
        <img
          src="/wsr-logo.png"
          alt=""
          className="absolute top-4 right-4 w-16 sm:w-20 md:w-24 opacity-80 pointer-events-none"
        />
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-navy mb-4 animate-fade-in-down">
            About Doug
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto animate-fade-in animate-delay-200">
            20 years of service · <strong>Common Sense</strong> leadership
          </p>
        </div>
      </section>

      {/* Bio Section */}
      <section className="py-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid md:grid-cols-5 gap-10 items-center">
          <Reveal direction="left" className="md:col-span-2">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-navy/10 to-prosper-red/10 rounded-2xl blur-xl"></div>
              <Image
                src="/headshot.jpg"
                alt="Doug Charles"
                width={400}
                height={500}
                className="relative rounded-xl shadow-navy-lg mx-auto w-full max-w-[360px]"
              />
            </div>
          </Reveal>

          <Reveal direction="right" className="md:col-span-3 space-y-6">
            <p className="text-lg text-gray-700 leading-relaxed">
              I've called <strong className="text-navy">Prosper</strong> home for <strong>20 years</strong>. I've raised my family here, served on the Planning & Zoning Commission, worked on the 2020 Bond Committee, and was elected to the Windsong Ranch HOA Board in October 2025.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              I'm running for Town Council because <strong className="text-prosper-red">Prosper is at a crossroads</strong>. The decisions we make over the next few years will shape our community for decades. We need leaders who will listen to all residents, plan thoughtfully, and protect what makes this town special.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              <strong>This isn't about political agendas or party labels.</strong> It's about good governance for the place we all call home.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Experience Section */}
      <section className="priorities-gradient -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-20 relative">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-1 accent-line-full"></div>

        <div className="max-w-4xl mx-auto">
          <Reveal>
            <h2 className="section-title text-center mb-4">Experience & Service</h2>
            <p className="section-subtitle text-center">A proven track record of community leadership</p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            <Reveal delay={0}>
              <div className="card h-full">
                <div className="flex items-start gap-4">
                  <div className="w-4 h-4 bg-gradient-to-br from-prosper-red to-red-dark rounded-full mt-1 flex-shrink-0 shadow-sm"></div>
                  <div>
                    <h3 className="text-xl font-bold text-navy mb-2">20-Year Prosper Resident</h3>
                    <p className="text-gray-600">Deep roots in this community. I've watched Prosper grow from a small town to a thriving suburb, and I understand what we need to preserve.</p>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="card h-full">
                <div className="flex items-start gap-4">
                  <div className="w-4 h-4 bg-gradient-to-br from-prosper-red to-red-dark rounded-full mt-1 flex-shrink-0 shadow-sm"></div>
                  <div>
                    <h3 className="text-xl font-bold text-navy mb-2">Planning & Zoning Commissioner</h3>
                    <p className="text-gray-600">2021-2023 · Reviewed hundreds of development applications. I know how land use decisions impact neighborhoods.</p>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="card h-full">
                <div className="flex items-start gap-4">
                  <div className="w-4 h-4 bg-gradient-to-br from-prosper-red to-red-dark rounded-full mt-1 flex-shrink-0 shadow-sm"></div>
                  <div>
                    <h3 className="text-xl font-bold text-navy mb-2">2020 Bond Election Committee</h3>
                    <p className="text-gray-600">Helped pass $210M bond for roads, parks, and facilities. Now 79%+ executed on time and on budget.</p>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={300}>
              <div className="card h-full">
                <div className="flex items-start gap-4">
                  <div className="w-4 h-4 bg-gradient-to-br from-prosper-red to-red-dark rounded-full mt-1 flex-shrink-0 shadow-sm"></div>
                  <div>
                    <h3 className="text-xl font-bold text-navy mb-2">Windsong Ranch Board Member</h3>
                    <p className="text-gray-600">Elected · Serving on the board of one of Prosper's largest communities. I understand the issues residents face every day.</p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Professional Background */}
      <section className="py-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <h2 className="section-title text-center mb-8">Professional Background</h2>
          </Reveal>
          <Reveal delay={100}>
            <div className="card">
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                In my professional career, I'm a Senior Vice President focused on business innovation and transformation. I lead teams that solve complex problems, manage budgets, and deliver results.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                I bring that same <strong className="text-navy">common sense</strong> approach to local government: understand the problem, gather input, develop solutions, and execute. No grandstanding, no politics—just get it done.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-gradient text-white -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <Reveal>
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">Ready to Learn More?</h2>
          </Reveal>
          <Reveal delay={100}>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/priorities" className="btn-white">
                See My Priorities
              </Link>
              <Link href="/why" className="btn-secondary">
                Why I'm Running
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
