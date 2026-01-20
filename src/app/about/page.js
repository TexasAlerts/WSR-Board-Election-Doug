"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Ear,
  ClipboardList,
  ShieldCheck,
  User,
  Target,
  Heart,
  Award,
} from 'lucide-react';
import Reveal from '../../components/Reveal';

const TABS = [
  { id: 'about', label: 'About Doug', shortLabel: 'About', icon: User },
  { id: 'why', label: "Why I'm Running", shortLabel: 'Why', icon: Heart },
  { id: 'priorities', label: 'Priorities', shortLabel: 'Goals', icon: Target },
  { id: 'track-record', label: 'Track Record', shortLabel: 'Record', icon: Award },
];

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState('about');
  const tabNavRef = useRef(null);
  const contentRef = useRef(null);

  // Handle hash-based navigation on mount
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash && TABS.some(t => t.id === hash)) {
      setActiveTab(hash);
    }
  }, []);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    window.history.replaceState(null, '', `#${tabId}`);

    // Scroll to position content just below the sticky tabs
    if (contentRef.current && tabNavRef.current) {
      const tabNavHeight = tabNavRef.current.offsetHeight;
      const mainNavHeight = 64;
      const bannerHeight = 40; // Approximate banner height
      const contentTop = contentRef.current.getBoundingClientRect().top + window.scrollY;
      const scrollTarget = contentTop - mainNavHeight - bannerHeight - tabNavHeight - 8;

      window.scrollTo({
        top: Math.max(0, scrollTarget),
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="space-y-0 relative">
      {/* Hero - Compact */}
      <section className="hero-pattern hero-gradient text-center py-12 md:py-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-10 left-20 w-64 h-64 bg-navy/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-20 w-48 h-48 bg-prosper-red/5 rounded-full blur-3xl"></div>
        </div>
        <img
          src="/wsr-logo.webp"
          alt=""
          className="absolute top-4 right-4 w-16 sm:w-20 md:w-24 opacity-80 pointer-events-none"
        />
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy mb-3 animate-fade-in-down">
            Meet Doug Charles
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto animate-fade-in animate-delay-200">
            <strong>Common Sense</strong> leadership for <strong className="text-prosper-red">ALL</strong> of Prosper
          </p>
        </div>
      </section>

      {/* Bio Section - Always visible, outside tabs */}
      <section className="py-12 md:py-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center">
            <div className="w-full md:w-2/5 flex-shrink-0">
              <Reveal direction="left">
                <div className="relative max-w-[280px] md:max-w-[320px] mx-auto">
                  <div className="absolute -inset-3 bg-gradient-to-br from-navy/10 to-prosper-red/10 rounded-2xl blur-xl"></div>
                  <Image
                    src="/headshot.jpg"
                    alt="Doug Charles"
                    width={320}
                    height={400}
                    className="relative rounded-xl shadow-navy-lg w-full"
                  />
                </div>
              </Reveal>
            </div>
            <div className="w-full md:w-3/5">
              <Reveal direction="right">
                <div className="space-y-4 text-base md:text-lg text-gray-700 leading-relaxed">
                  <p>
                    I moved to <strong className="text-navy">Prosper 20 years ago</strong> for the same reasons you probably did—great schools, safe neighborhoods, and room to raise a family.
                  </p>
                  <p>
                    I've served on the <strong className="text-navy">Planning & Zoning Commission</strong>, the <strong className="text-navy">2020 Bond Committee</strong>, and currently serve on the <strong className="text-navy">Windsong Ranch HOA Board</strong>.
                  </p>
                  <p className="text-prosper-red font-semibold">
                    Whether you've been here 20 years or 2 months, you deserve a voice at the table.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Tab Navigation */}
      <div
        ref={tabNavRef}
        className="sticky top-[calc(var(--banner-offset,40px)+64px)] z-50 -mx-4 sm:-mx-6 lg:-mx-8"
      >
        <div className="bg-white border-b border-gray-200 shadow-lg">
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="max-w-4xl mx-auto">
            {/* Desktop tabs */}
            <div className="hidden sm:flex justify-center gap-2 md:gap-3">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-lg font-semibold text-sm md:text-base transition-all duration-200 min-h-[44px] ${
                      activeTab === tab.id
                        ? 'bg-navy text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-navy'
                    }`}
                  >
                    <Icon className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Mobile tabs - horizontal scroll */}
            <div className="sm:hidden overflow-x-auto scrollbar-hide -mx-4 px-4">
              <div className="flex gap-2 min-w-max pb-1">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg font-semibold text-sm whitespace-nowrap transition-all duration-200 min-h-[44px] ${
                        activeTab === tab.id
                          ? 'bg-navy text-white shadow-md'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" aria-hidden="true" />
                      <span>{tab.shortLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Tab Content - contain: paint creates stacking context that stays below sticky */}
      <div ref={contentRef} className="min-h-[60vh]" style={{ contain: 'paint' }}>
        {activeTab === 'about' && <AboutContent />}
        {activeTab === 'why' && <WhyContent />}
        {activeTab === 'priorities' && <PrioritiesContent />}
        {activeTab === 'track-record' && <TrackRecordContent />}
      </div>

      {/* CTA */}
      <section className="cta-gradient text-white -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <Reveal>
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">Ready to Get Involved?</h2>
          </Reveal>
          <Reveal delay={100}>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/get-involved" className="btn-white">
                Join the Campaign
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

function AboutContent() {
  return (
    <>
      {/* Experience Section */}
      <section className="py-16 md:py-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <h2 className="section-title text-center mb-4">Experience & Service</h2>
            <p className="section-subtitle text-center">A proven track record of community leadership</p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
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
                    <p className="text-gray-600">Helped pass <strong className="text-navy">$210M</strong> bond for roads, parks, and facilities that continue to benefit Prosper.</p>
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
      <section className="priorities-gradient -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16 md:py-20 relative">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-1 accent-line-full"></div>
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
                I bring that same <strong className="text-navy">common sense</strong> approach to local government—for <strong className="text-prosper-red">ALL</strong> of Prosper: understand the problem, gather input, develop solutions, and execute. No grandstanding, no games—just get it done, and done right.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function WhyContent() {
  return (
    <>
      {/* Main Content */}
      <section className="py-16 md:py-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
            <Reveal>
              <p>
                Prosper is <strong className="text-navy">growing fast</strong>. That's not necessarily bad—but it means we need to be <strong className="text-navy">thoughtful about the decisions ahead</strong>.
              </p>
            </Reveal>

            <Reveal delay={100}>
              <p>
                I've been <strong className="text-navy">in the room where these decisions get made</strong>. I've read the development applications, asked the hard questions, and seen what happens when we plan well—and when we don't.
              </p>
            </Reveal>

            <Reveal delay={200}>
              <p>
                I'm running to bring that <strong className="text-prosper-red">experience to the Town Council</strong>, and to make sure <strong className="text-navy">every resident's voice is heard</strong>.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Key Message */}
      <section className="priorities-gradient -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16 md:py-20 relative">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-1 accent-line-full"></div>

        <div className="max-w-3xl mx-auto">
          <Reveal>
            <div className="card text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-4">
                Town Council isn't about party labels.
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                It's about <strong className="text-navy">potholes, parks, and planning</strong>. It's about whether the roads work, growth happens thoughtfully, and <strong className="text-prosper-red">Prosper keeps its character</strong>.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* What I'll Do Differently */}
      <section className="py-16 md:py-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <h2 className="section-title text-center mb-4">What I'll Do Differently</h2>
            <p className="section-subtitle text-center"><strong>Common Sense</strong> leadership for <strong className="text-prosper-red">ALL</strong> of Prosper</p>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-2 mt-10">
            <Reveal delay={0}>
              <div className="card h-full">
                <h3 className="text-xl font-bold text-navy mb-3">Listen Before Deciding</h3>
                <p className="text-gray-600">
                  Too often, residents feel like decisions are made before their input is gathered. I'll push for <strong className="text-navy">meaningful public engagement early</strong> in the process—not after the plans are already drawn.
                </p>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="card h-full">
                <h3 className="text-xl font-bold text-navy mb-3">Ask the Hard Questions</h3>
                <p className="text-gray-600">
                  What will this cost long-term? Does our infrastructure support this? What do residents actually want? I'll bring the same <strong className="text-navy">analytical approach</strong> I use professionally to every council decision.
                </p>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="card h-full">
                <h3 className="text-xl font-bold text-navy mb-3">Focus on Results</h3>
                <p className="text-gray-600">
                  <strong className="text-navy">No grandstanding, no political theater.</strong> Just thoughtful governance focused on making Prosper better for everyone who lives here.
                </p>
              </div>
            </Reveal>

            <Reveal delay={300}>
              <div className="card h-full">
                <h3 className="text-xl font-bold text-navy mb-3">Be Accessible</h3>
                <p className="text-gray-600">
                  Your council members should be <strong className="text-navy">easy to reach</strong>. I'll be available to residents—not just during campaign season, but <strong className="text-prosper-red">throughout my term</strong>.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* The Stakes */}
      <section className="py-12 md:py-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <div className="quote-enhanced">
              <h2 className="text-xl font-bold text-navy mb-4 not-italic">The Stakes Are High</h2>
              <p className="text-gray-700 leading-relaxed mb-4 not-italic">
                The decisions we make in the next few years will <strong className="text-navy">shape Prosper for decades</strong>. We're deciding where roads go, what gets built, and how we balance growth with quality of life.
              </p>
              <p className="text-gray-700 leading-relaxed not-italic">
                These decisions are too important to leave to chance. They deserve <strong className="text-prosper-red">experienced, thoughtful leadership</strong> from someone who knows Prosper and cares about its future.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function PrioritiesContent() {
  return (
    <>
      {/* Three Pillars */}
      <section className="py-16 md:py-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          <Reveal delay={0}>
            <div className="card text-center h-full">
              <div className="icon-container-lg">
                <Ear className="w-10 h-10 text-navy" aria-hidden="true" />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-navy">Listen</h2>
              <p className="text-gray-600 leading-relaxed">
                Good decisions start with <strong className="text-navy">hearing from residents</strong>—not as an afterthought, but <strong className="text-prosper-red">from the beginning</strong>. Your voice should shape outcomes <strong className="text-navy">before votes are taken</strong>. That's why I'll hold periodic <strong className="text-navy">"Coffee with Doug"</strong> sessions at local spots where any Prosper resident can meet with me directly—no appointment needed.
              </p>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div className="card text-center h-full">
              <div className="icon-container-lg">
                <ClipboardList className="w-10 h-10 text-navy" aria-hidden="true" />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-navy">Plan</h2>
              <p className="text-gray-600 leading-relaxed">
                <strong className="text-navy">Build it right the first time.</strong> Size projects correctly from the start so we don't run out of money halfway through. <strong className="text-prosper-red">Think long-term</strong> so we're not fixing mistakes or asking for more money later.
              </p>
            </div>
          </Reveal>

          <Reveal delay={300}>
            <div className="card text-center h-full">
              <div className="icon-container-lg">
                <ShieldCheck className="w-10 h-10 text-navy" aria-hidden="true" />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-navy">Protect</h2>
              <p className="text-gray-600 leading-relaxed">
                Prosper isn't just another suburb—it's <strong className="text-navy">Friday night football under the lights</strong>, <strong className="text-prosper-red">Small Town Big Heart</strong>, and downtown festivals that bring neighbors together. Growth should <strong className="text-navy">add to that story</strong>, not erase it.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Detailed Priorities */}
      <section className="priorities-gradient -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16 md:py-20 relative">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-1 accent-line-full"></div>

        <div className="max-w-4xl mx-auto">
          <Reveal>
            <h2 className="section-title text-center mb-4">What This Means for Prosper</h2>
            <p className="section-subtitle text-center">Practical solutions for our community</p>
          </Reveal>

          <div className="space-y-6 mt-10">
            <Reveal delay={0}>
              <div className="card">
                <h3 className="text-xl font-bold text-navy mb-4">Transparent Government</h3>
                <p className="text-gray-700 leading-relaxed">
                  Every resident deserves to know what their local government is doing and why. I'll push for <strong className="text-navy">earlier public input</strong> on major decisions, <strong className="text-navy">clearer communication</strong> about town projects, and more accessible council meetings. The best decisions happen when residents are <strong className="text-prosper-red">informed and engaged from the start</strong>.
                </p>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="card">
                <h3 className="text-xl font-bold text-navy mb-4">Responsible Growth</h3>
                <p className="text-gray-700 leading-relaxed">
                  Prosper is growing whether we like it or not. The question is whether we <strong className="text-navy">manage that growth wisely</strong>. That means <strong className="text-navy">holding developers accountable</strong> for the infrastructure their projects require, attracting businesses so <strong className="text-navy">homeowners don't carry the full tax burden</strong>, and protecting the quality of life that brought us all here. Growth should benefit <strong className="text-prosper-red">existing residents, not just developers</strong>—and that includes ensuring our fire and police have the capacity to keep pace with new rooftops.
                </p>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="card">
                <h3 className="text-xl font-bold text-navy mb-4">Fiscal Responsibility</h3>
                <p className="text-gray-700 leading-relaxed">
                  Your tax dollars should be spent wisely. That means <strong className="text-navy">right-sizing projects from the start</strong>, planning for long-term maintenance costs, and being honest about what things really cost. I've worked on the <strong className="text-navy">bond committee</strong> and <strong className="text-navy">Planning & Zoning Commission</strong>—I know how to read a budget and <strong className="text-prosper-red">ask the tough questions</strong>.
                </p>
              </div>
            </Reveal>

            <Reveal delay={300}>
              <div className="card">
                <h3 className="text-xl font-bold text-navy mb-4">Community Character</h3>
                <p className="text-gray-700 leading-relaxed">
                  Prosper isn't just another suburb. We have a character worth preserving—<strong className="text-navy">Friday night football</strong> at Children's Health Stadium, the <strong className="text-prosper-red">"Small Town, Big Heart"</strong> spirit, downtown festivals, and neighbors who still wave from their driveways. Every zoning decision, every development approval, should <strong className="text-navy">strengthen what makes Prosper special</strong>—not dilute it.
                </p>
              </div>
            </Reveal>

            <Reveal delay={400}>
              <div className="card">
                <h3 className="text-xl font-bold text-navy mb-4">Strategic Commercial Development</h3>
                <p className="text-gray-700 leading-relaxed">
                  Prosper ranks <strong className="text-prosper-red">#8 among the wealthiest zip codes in Texas</strong> (Source: US Census). Our tollway corridor and remaining commercial development should reflect that—not strip malls and fast food chains. With <strong className="text-navy">The Fields, PGA, and Universal Theme Park</strong> right next door, let's build a commercial base that draws people to <strong className="text-navy">our downtown, our retail, our restaurants</strong>. By creating the right environment for high-end commercial development, we can attract jobs and destinations Prosper residents will enjoy.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}

function TrackRecordContent() {
  return (
    <>
      {/* Proven Track Record */}
      <section className="py-16 md:py-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <h2 className="section-title text-center mb-4">Proven Track Record</h2>
            <p className="section-subtitle text-center">Results, not just promises</p>
          </Reveal>

          <div className="space-y-5 mt-10">
            <Reveal delay={0}>
              <div className="card">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                  <div className="text-sm font-bold text-navy whitespace-nowrap bg-navy/5 px-3 py-1 rounded-full self-start">Nov 2019</div>
                  <div>
                    <h3 className="text-lg font-bold text-navy mb-2">Organized 585 Residents to Protect Neighborhood Standards</h3>
                    <p className="text-gray-600 mb-2">As Prosper's growth accelerated, I wanted to <strong className="text-navy">protect the community</strong> I moved to while embracing <strong className="text-navy">positive growth</strong>. When a developer sought to allow 40-foot lots and "4-pack" homes in Windsong Ranch, I organized a petition that gathered <strong className="text-prosper-red">585 signatures in 48 hours</strong>. The Planning & Zoning Commission voted <strong className="text-navy">7-0 against</strong> the proposal.</p>
                    <p className="text-gray-500 italic text-sm">"Thank you for being engaged and active in keeping Prosper the envy of the area." — Prosper Town Council Member</p>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={50}>
              <div className="card">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                  <div className="text-sm font-bold text-navy whitespace-nowrap bg-navy/5 px-3 py-1 rounded-full self-start">Aug 2020</div>
                  <div>
                    <h3 className="text-lg font-bold text-navy mb-2">Advocated for Neighborhood Character</h3>
                    <p className="text-gray-600 mb-2">Spoke at Town Council questioning whether new home designs fit existing <strong className="text-navy">neighborhood character</strong>.</p>
                    <p className="text-gray-500 italic text-sm">"Not questioning the quality of the product or even the look of the product. I'm just questioning does it really fit our subdivision." — Prosper Press News</p>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="card">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                  <div className="text-sm font-bold text-navy whitespace-nowrap bg-navy/5 px-3 py-1 rounded-full self-start">Nov 2020</div>
                  <div>
                    <h3 className="text-lg font-bold text-navy mb-2">Bond Election Committee</h3>
                    <p className="text-gray-600">Helped pass <strong className="text-navy">$210M</strong> in bonds for roads, parks, and facilities—infrastructure investments that continue to benefit Prosper residents today.</p>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={150}>
              <div className="card">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                  <div className="text-sm font-bold text-navy whitespace-nowrap bg-navy/5 px-3 py-1 rounded-full self-start">Sept 2021</div>
                  <div>
                    <h3 className="text-lg font-bold text-navy mb-2">Advocated for Tax Relief & Public Safety Investment</h3>
                    <p className="text-gray-600 mb-2">Appeared before Town Council to advocate for a <strong className="text-navy">4-cent property tax rate reduction</strong> while simultaneously calling for a <strong className="text-prosper-red">7% pay increase for Police and Fire</strong> personnel. Challenged the Town's excessive reserves, arguing taxpayer money should be returned or invested in infrastructure—not hoarded. This <strong className="text-navy">consistent support for public safety</strong> continued in 2025, when I advocated for the public safety bond propositions.</p>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="card">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                  <div className="text-sm font-bold text-navy whitespace-nowrap bg-navy/5 px-3 py-1 rounded-full self-start">2021-2023</div>
                  <div>
                    <h3 className="text-lg font-bold text-navy mb-2">Planning & Zoning Commissioner</h3>
                    <p className="text-gray-600">Reviewed <strong className="text-navy">hundreds of development applications</strong>. Learned firsthand how land use decisions impact neighborhoods—and how to <strong className="text-navy">ask the right questions</strong>.</p>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={250}>
              <div className="card">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                  <div className="text-sm font-bold text-navy whitespace-nowrap bg-navy/5 px-3 py-1 rounded-full self-start">Nov 2023</div>
                  <div>
                    <h3 className="text-lg font-bold text-navy mb-2">Advocated for Fiscal Responsibility in PISD Bond</h3>
                    <p className="text-gray-600 mb-2">Consistent advocacy for <strong className="text-navy">fiscal responsibility</strong> means being willing to take a stand where <strong className="text-prosper-red">common sense</strong> matters. During the <strong className="text-navy">$2.7 billion</strong> PISD bond election, I spoke publicly about smart spending priorities. Voters agreed—passing three propositions while <strong className="text-navy">rejecting the $102 million stadium bond</strong>.</p>
                    <p className="text-gray-500 italic text-sm">"We need smart spending that maximizes benefits for our students without unnecessary burdens on our finances." — Texas Scorecard</p>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={300}>
              <div className="card">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                  <div className="text-sm font-bold text-navy whitespace-nowrap bg-navy/5 px-3 py-1 rounded-full self-start">Apr 2025</div>
                  <div>
                    <h3 className="text-lg font-bold text-navy mb-2">Filed Ethics Complaint on Outside PAC Spending</h3>
                    <p className="text-gray-600 mb-2">I pay attention to the details and <strong className="text-navy">follow the money</strong> to ensure voters know who is supporting candidates making decisions in our town and ISD. When a Washington D.C.-based PAC spent <strong className="text-prosper-red">$50,000</strong> on Prosper ISD races without transparency, I filed a formal complaint with the <strong className="text-navy">Texas Ethics Commission</strong>. The Dallas Morning News Editorial Board noted my transparency, contrasting it with secretive outside groups.</p>
                    <p className="text-gray-500 italic text-sm">"$50,000 just didn't randomly show up from Washington, D.C., into Prosper ISD. There's an agenda." — Dallas Morning News</p>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={350}>
              <div className="card">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                  <div className="text-sm font-bold text-navy whitespace-nowrap bg-navy/5 px-3 py-1 rounded-full self-start">Oct 2025</div>
                  <div>
                    <h3 className="text-lg font-bold text-navy mb-2">Windsong Ranch HOA Board</h3>
                    <p className="text-gray-600"><strong className="text-navy">Elected by neighbors</strong> to serve on the board of one of Prosper's largest communities.</p>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={400}>
              <div className="card">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                  <div className="text-sm font-bold text-navy whitespace-nowrap bg-navy/5 px-3 py-1 rounded-full self-start">Nov 2025</div>
                  <div>
                    <h3 className="text-lg font-bold text-navy mb-2">Common Sense on Bond Proposals</h3>
                    <p className="text-gray-600 mb-2">When some 2025 bond proposals seemed undersized, said publicly: voters agreed, passing <strong className="text-navy">infrastructure and public safety bonds</strong> while rejecting undersized facilities.</p>
                    <p className="text-gray-500 italic text-sm">"Let's build it once, not twice—unless we're going to build it once and expand it with a thoughtful plan that's communicated." — Community Impact</p>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={450}>
              <div className="card">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                  <div className="text-sm font-bold text-navy whitespace-nowrap bg-navy/5 px-3 py-1 rounded-full self-start">Dec 2025</div>
                  <div>
                    <h3 className="text-lg font-bold text-navy mb-2">PISD Annexation Victory</h3>
                    <p className="text-gray-600 mb-2">Led petition to bring <strong className="text-prosper-red">$6.5 million+</strong> in annual property taxes home to Prosper ISD. Currently, <strong className="text-navy">274 Windsong Ranch students</strong> attend Prosper ISD schools, yet their property taxes go to <strong className="text-navy">Denton ISD—which provides zero educational services</strong>. With <strong className="text-prosper-red">52.6% of registered voters</strong> signing the petition, Prosper ISD Board approved unanimously on December 15, 2025. Now awaiting TEA Commissioner final decision.</p>
                    <p className="text-gray-500 italic text-sm mb-2">"Students already attend and have full access to Prosper ISD, yet property tax revenue flows to Denton ISD, which educates none of these children."</p>
                    <a href="https://prosperisdpetition.com" target="_blank" rel="noopener noreferrer" className="text-navy font-medium hover:underline text-sm">Track progress at prosperisdpetition.com →</a>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
