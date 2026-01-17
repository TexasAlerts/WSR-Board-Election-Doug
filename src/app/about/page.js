"use client";

import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="text-center py-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy mb-4">
          About Doug
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
          20 years of service to Prosper
        </p>
      </section>

      {/* Bio Section */}
      <section className="grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-1">
          <Image
            src="/headshot.jpg"
            alt="Doug Charles"
            width={400}
            height={500}
            className="rounded-lg shadow-lg mx-auto w-full max-w-[320px]"
          />
        </div>
        <div className="md:col-span-2 space-y-6">
          <p className="text-lg text-gray-700 leading-relaxed">
            I've called <strong className="text-navy">Prosper</strong> home for <strong>20 years</strong>. I've raised my family here, served on the Planning & Zoning Commission, worked on the 2020 Bond Committee, and volunteered in my neighborhood.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            I'm running for Town Council because <strong className="text-prosper-red">Prosper is at a crossroads</strong>. The decisions we make over the next few years will shape our community for decades. We need leaders who will listen to all residents, plan thoughtfully, and protect what makes this town special.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            <strong>This isn't about political agendas or party labels.</strong> It's about good governance for the place we all call home.
          </p>
        </div>
      </section>

      {/* Experience Section */}
      <section className="bg-gray-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="section-title text-center mb-12">Experience & Service</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <div className="flex items-start gap-4">
                <div className="w-3 h-3 bg-prosper-red rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="text-xl font-bold text-navy mb-2">20-Year Prosper Resident</h3>
                  <p className="text-gray-600">Deep roots in this community. I've watched Prosper grow from a small town to a thriving suburb, and I understand what we need to preserve.</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-start gap-4">
                <div className="w-3 h-3 bg-prosper-red rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="text-xl font-bold text-navy mb-2">Planning & Zoning Commissioner</h3>
                  <p className="text-gray-600">2021-2023 · Reviewed hundreds of development applications. I know how land use decisions impact neighborhoods.</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-start gap-4">
                <div className="w-3 h-3 bg-prosper-red rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="text-xl font-bold text-navy mb-2">2020 Bond Election Committee</h3>
                  <p className="text-gray-600">Helped pass $210M bond for roads, parks, and facilities. Now 79%+ executed on time and on budget.</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-start gap-4">
                <div className="w-3 h-3 bg-prosper-red rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="text-xl font-bold text-navy mb-2">HOA Board Member</h3>
                  <p className="text-gray-600">Current · Hands-on neighborhood leadership. I understand the issues residents face every day.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Background */}
      <section className="max-w-4xl mx-auto">
        <h2 className="section-title text-center mb-8">Professional Background</h2>
        <div className="card">
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            In my professional career, I'm a Senior Vice President focused on business innovation and transformation. I lead teams that solve complex problems, manage budgets, and deliver results.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            I bring that same analytical approach to local government: understand the problem, gather input, develop solutions, and execute. No grandstanding, no politics—just get it done.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-8">
        <h2 className="text-2xl font-bold text-navy mb-4">Ready to Learn More?</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/priorities" className="btn-primary">
            See My Priorities
          </Link>
          <Link href="/why" className="btn-outline">
            Why I'm Running
          </Link>
        </div>
      </section>
    </div>
  );
}
