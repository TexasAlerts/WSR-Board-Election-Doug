"use client";

import Link from 'next/link';

export default function WhyPage() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="bg-navy text-white -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            Why I'm Running
          </h1>
          <p className="text-xl text-white/90">
            Prosper needs leaders who will listen, plan, and protect our community.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-3xl mx-auto">
        <div className="space-y-8 text-lg text-gray-700 leading-relaxed">
          <p>
            Prosper is growing fast. That's not necessarily bad—but it means we need to be thoughtful about the decisions ahead.
          </p>

          <p>
            I've been in the room where these decisions get made. I've read the development applications, asked the hard questions, and seen what happens when we plan well—and when we don't.
          </p>

          <p>
            I'm running to bring that experience to the Town Council, and to make sure <strong className="text-navy">every resident's voice is heard</strong>.
          </p>
        </div>
      </section>

      {/* Key Message */}
      <section className="bg-gray-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="card text-center">
            <h2 className="text-2xl font-bold text-navy mb-4">
              Town Council isn't about party labels.
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              It's about potholes, parks, and planning. It's about whether the roads work, growth happens thoughtfully, and Prosper keeps its character.
            </p>
          </div>
        </div>
      </section>

      {/* What I'll Do Differently */}
      <section className="max-w-4xl mx-auto">
        <h2 className="section-title text-center mb-12">What I'll Do Differently</h2>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="card">
            <h3 className="text-xl font-bold text-navy mb-3">Listen Before Deciding</h3>
            <p className="text-gray-600">
              Too often, residents feel like decisions are made before their input is gathered. I'll push for meaningful public engagement early in the process—not after the plans are already drawn.
            </p>
          </div>

          <div className="card">
            <h3 className="text-xl font-bold text-navy mb-3">Ask the Hard Questions</h3>
            <p className="text-gray-600">
              What will this cost long-term? Does our infrastructure support this? What do residents actually want? I'll bring the same analytical approach I use professionally to every council decision.
            </p>
          </div>

          <div className="card">
            <h3 className="text-xl font-bold text-navy mb-3">Focus on Results</h3>
            <p className="text-gray-600">
              No grandstanding, no political theater. Just thoughtful governance focused on making Prosper better for everyone who lives here.
            </p>
          </div>

          <div className="card">
            <h3 className="text-xl font-bold text-navy mb-3">Be Accessible</h3>
            <p className="text-gray-600">
              Your council members should be easy to reach. I'll be available to residents—not just during campaign season, but throughout my term.
            </p>
          </div>
        </div>
      </section>

      {/* The Stakes */}
      <section className="max-w-3xl mx-auto">
        <div className="card border-l-4 border-prosper-red">
          <h2 className="text-xl font-bold text-navy mb-4">The Stakes Are High</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The decisions we make in the next few years will shape Prosper for decades. We're deciding where roads go, what gets built, and how we balance growth with quality of life.
          </p>
          <p className="text-gray-700 leading-relaxed">
            These decisions are too important to leave to chance. They deserve experienced, thoughtful leadership from someone who knows Prosper and cares about its future.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-8">
        <h2 className="text-2xl font-bold text-navy mb-4">Join the Campaign</h2>
        <p className="text-gray-600 mb-6 max-w-xl mx-auto">
          Together, we can ensure Prosper's growth is managed wisely and every resident's voice is heard.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/get-involved" className="btn-primary">
            Get Involved
          </Link>
          <Link href="/donate" className="btn-secondary">
            Donate
          </Link>
        </div>
      </section>
    </div>
  );
}
