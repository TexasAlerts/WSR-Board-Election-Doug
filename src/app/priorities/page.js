import Image from 'next/image';
import Link from 'next/link';
import { Ear, ClipboardList, ShieldCheck } from 'lucide-react';

export default function PrioritiesPage() {
  return (
    <div className="space-y-0">
      {/* Hero */}
      <section className="hero-pattern hero-gradient text-center py-16 md:py-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-10 right-20 w-64 h-64 bg-navy/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-20 w-48 h-48 bg-prosper-red/5 rounded-full blur-3xl"></div>
        </div>
        <Image
          src="/wsr-logo.webp"
          alt="Windsong Ranch - Doug Charles for Prosper"
          width={96}
          height={64}
          className="absolute top-4 right-4 w-16 sm:w-20 md:w-24 h-auto opacity-80 pointer-events-none"
        />
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-navy mb-4 animate-fade-in-down">
            My Priorities
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto animate-fade-in animate-delay-200">
            <strong className="text-navy">Listen.</strong> <strong className="text-navy">Plan.</strong> <strong className="text-prosper-red">Protect.</strong>
          </p>
        </div>
      </section>

      {/* Three Pillars */}
      <section className="py-16 md:py-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          <div className="card text-center h-full">
            <div className="icon-container-lg">
              <Ear className="w-10 h-10 text-navy" aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-navy">Listen</h2>
            <p className="text-gray-600 leading-relaxed">
              Good decisions start with <strong className="text-navy">hearing from residents</strong>—not as an afterthought, but <strong className="text-prosper-red">from the beginning</strong>. Your voice should shape outcomes <strong className="text-navy">before votes are taken</strong>. That's why I'll hold periodic <strong className="text-navy">"Coffee with Doug"</strong> sessions at local spots where any Prosper resident can meet with me directly—no appointment needed.
            </p>
          </div>

          <div className="card text-center h-full">
            <div className="icon-container-lg">
              <ClipboardList className="w-10 h-10 text-navy" aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-navy">Plan</h2>
            <p className="text-gray-600 leading-relaxed">
              <strong className="text-navy">Build it right the first time.</strong> Size projects correctly from the start so we don't run out of money halfway through. <strong className="text-prosper-red">Think long-term</strong> so we're not fixing mistakes or asking for more money later.
            </p>
          </div>

          <div className="card text-center h-full">
            <div className="icon-container-lg">
              <ShieldCheck className="w-10 h-10 text-navy" aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-navy">Protect</h2>
            <p className="text-gray-600 leading-relaxed">
              Prosper isn't just another suburb—it's <strong className="text-navy">Friday night football under the lights</strong>, <strong className="text-prosper-red">Small Town Big Heart</strong>, and downtown festivals that bring neighbors together. Growth should <strong className="text-navy">add to that story</strong>, not erase it.
            </p>
          </div>
        </div>
      </section>

      {/* Detailed Priorities */}
      <section className="priorities-gradient -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16 md:py-20 relative">
        <div className="absolute top-0 left-0 right-0 mx-auto w-16 h-1 accent-line-full"></div>
        <div className="max-w-4xl mx-auto">
          <h2 className="section-title text-center mb-4">What This Means for Prosper</h2>
          <p className="section-subtitle text-center">Practical solutions for our community</p>

          <div className="space-y-6 mt-10">
            <div className="card">
              <h3 className="text-xl font-bold text-navy mb-4">Transparent Government</h3>
              <p className="text-gray-700 leading-relaxed">
                Every resident deserves to know what their local government is doing and why. I'll push for <strong className="text-navy">earlier public input</strong> on major decisions, <strong className="text-navy">clearer communication</strong> about town projects, and more accessible council meetings. The best decisions happen when residents are <strong className="text-prosper-red">informed and engaged from the start</strong>.
              </p>
            </div>

            <div className="card">
              <h3 className="text-xl font-bold text-navy mb-4">Responsible Growth</h3>
              <p className="text-gray-700 leading-relaxed">
                Prosper is growing whether we like it or not. The question is whether we <strong className="text-navy">manage that growth wisely</strong>. That means <strong className="text-navy">holding developers accountable</strong> for the infrastructure their projects require, attracting businesses so <strong className="text-navy">homeowners don't carry the full tax burden</strong>, and protecting the quality of life that brought us all here. Growth should benefit <strong className="text-prosper-red">existing residents, not just developers</strong>—and that includes ensuring our fire and police have the capacity to keep pace with new rooftops.
              </p>
            </div>

            <div className="card">
              <h3 className="text-xl font-bold text-navy mb-4">Fiscal Responsibility</h3>
              <p className="text-gray-700 leading-relaxed">
                Your tax dollars should be spent wisely. That means <strong className="text-navy">right-sizing projects from the start</strong>, planning for long-term maintenance costs, and being honest about what things really cost. I've worked on the <strong className="text-navy">bond committee</strong> and <strong className="text-navy">Planning & Zoning Commission</strong>—I know how to read a budget and <strong className="text-prosper-red">ask the tough questions</strong>.
              </p>
            </div>

            <div className="card">
              <h3 className="text-xl font-bold text-navy mb-4">Community Character</h3>
              <p className="text-gray-700 leading-relaxed">
                Prosper isn't just another suburb. We have a character worth preserving—<strong className="text-navy">Friday night football</strong> at Children's Health Stadium, the <strong className="text-prosper-red">"Small Town, Big Heart"</strong> spirit, downtown festivals, and neighbors who still wave from their driveways. Every zoning decision, every development approval, should <strong className="text-navy">strengthen what makes Prosper special</strong>—not dilute it.
              </p>
            </div>

            <div className="card">
              <h3 className="text-xl font-bold text-navy mb-4">Strategic Commercial Development</h3>
              <p className="text-gray-700 leading-relaxed">
                Prosper ranks <strong className="text-prosper-red">#8 among the wealthiest zip codes in Texas</strong> (Source: US Census). Our tollway corridor and remaining commercial development should reflect that—not strip malls and fast food chains. With <strong className="text-navy">The Fields, PGA, and Universal Theme Park</strong> right next door, let's build a commercial base that draws people to <strong className="text-navy">our downtown, our retail, our restaurants</strong>. By creating the right environment for high-end commercial development, we can attract jobs and destinations Prosper residents will enjoy.
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
            <Link href="/why" className="card text-center hover:shadow-navy-lg transition-shadow">
              <h3 className="text-xl font-bold text-navy mb-2">Why I'm Running</h3>
              <p className="text-gray-600 text-sm">My motivation and what I'll do differently</p>
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
