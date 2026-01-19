"use client";

import Link from 'next/link';
import Reveal from '../../components/Reveal';

export default function WhyPage() {
  return (
    <div className="space-y-0">
      {/* Hero */}
      <section className="cta-gradient text-white -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-20 relative overflow-hidden">
        {/* Logo accent */}
        <img
          src="/wsr-logo.webp"
          alt=""
          className="absolute top-4 right-4 w-16 sm:w-20 md:w-24 opacity-40 pointer-events-none brightness-200"
        />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 animate-fade-in-down">
            Why I'm Running
          </h1>
          <p className="text-xl text-white/90 animate-fade-in animate-delay-200">
            Prosper needs <strong>Common Sense</strong> leaders for <strong>ALL</strong> of Prosper—who will listen, plan, and protect our community.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-8 text-lg text-gray-700 leading-relaxed">
            <Reveal>
              <p>
                Prosper is growing fast. That's not necessarily bad—but it means we need to be thoughtful about the decisions ahead.
              </p>
            </Reveal>

            <Reveal delay={100}>
              <p>
                I've been in the room where these decisions get made. I've read the development applications, asked the hard questions, and seen what happens when we plan well—and when we don't.
              </p>
            </Reveal>

            <Reveal delay={200}>
              <p>
                I'm running to bring that experience to the Town Council, and to make sure <strong className="text-navy">every resident's voice is heard</strong>.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Key Message */}
      <section className="priorities-gradient -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-20 relative">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-1 accent-line-full"></div>

        <div className="max-w-3xl mx-auto">
          <Reveal>
            <div className="card text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-4">
                Town Council isn't about party labels.
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                It's about potholes, parks, and planning. It's about whether the roads work, growth happens thoughtfully, and Prosper keeps its character.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* What I'll Do Differently */}
      <section className="py-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <h2 className="section-title text-center mb-4">What I'll Do Differently</h2>
            <p className="section-subtitle text-center"><strong>Common Sense</strong> leadership for <strong>ALL</strong> of Prosper</p>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-2 mt-12">
            <Reveal delay={0}>
              <div className="card h-full">
                <h3 className="text-xl font-bold text-navy mb-3">Listen Before Deciding</h3>
                <p className="text-gray-600">
                  Too often, residents feel like decisions are made before their input is gathered. I'll push for meaningful public engagement early in the process—not after the plans are already drawn.
                </p>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="card h-full">
                <h3 className="text-xl font-bold text-navy mb-3">Ask the Hard Questions</h3>
                <p className="text-gray-600">
                  What will this cost long-term? Does our infrastructure support this? What do residents actually want? I'll bring the same analytical approach I use professionally to every council decision.
                </p>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="card h-full">
                <h3 className="text-xl font-bold text-navy mb-3">Focus on Results</h3>
                <p className="text-gray-600">
                  No grandstanding, no political theater. Just thoughtful governance focused on making Prosper better for everyone who lives here.
                </p>
              </div>
            </Reveal>

            <Reveal delay={300}>
              <div className="card h-full">
                <h3 className="text-xl font-bold text-navy mb-3">Be Accessible</h3>
                <p className="text-gray-600">
                  Your council members should be easy to reach. I'll be available to residents—not just during campaign season, but throughout my term.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* The Stakes */}
      <section className="py-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <div className="quote-enhanced">
              <h2 className="text-xl font-bold text-navy mb-4 not-italic">The Stakes Are High</h2>
              <p className="text-gray-700 leading-relaxed mb-4 not-italic">
                The decisions we make in the next few years will shape Prosper for decades. We're deciding where roads go, what gets built, and how we balance growth with quality of life.
              </p>
              <p className="text-gray-700 leading-relaxed not-italic">
                These decisions are too important to leave to chance. They deserve experienced, thoughtful leadership from someone who knows Prosper and cares about its future.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-gradient text-white -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <Reveal>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Join the Campaign</h2>
            <p className="text-white/90 mb-8 max-w-xl mx-auto">
              Local races are decided by a few hundred votes. Your support—and your voice—can make the difference.
            </p>
          </Reveal>
          <Reveal delay={100}>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/get-involved" className="btn-white">
                Get Involved
              </Link>
              <Link href="/donate" className="btn-secondary">
                Donate
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
