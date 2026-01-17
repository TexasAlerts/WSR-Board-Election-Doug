"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Ear,
  ClipboardList,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';
import Reveal from '../components/Reveal';

export default function Home() {
  const [endorsements, setEndorsements] = useState([]);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [endorseRes, qnaRes] = await Promise.all([
          fetch('/api/endorsements', { cache: 'no-store' }),
          fetch('/api/questions', { cache: 'no-store' }),
        ]);
        const endorseData = await endorseRes.json();
        const qnaData = await qnaRes.json();
        setEndorsements(Array.isArray(endorseData.data) ? endorseData.data : []);
        setQuestions(Array.isArray(qnaData.data) ? qnaData.data : []);
      } catch (err) {
        console.error('Error loading data', err);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <section className="hero-gradient text-center py-10 md:py-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Logo with entrance animation */}
          <div className="animate-fade-in-down">
            <img
              src="/wsr-logo.png"
              alt="Doug Charles for Town Council Place 5 - A Common Sense Leader for All of Prosper"
              className="mx-auto w-[380px] sm:w-[520px] md:w-[680px] lg:w-[800px] mb-8 drop-shadow-xl"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>

          <div className="space-y-6">

            {/* Tagline with gradient accent lines */}
            <div className="flex items-center justify-center gap-4 py-6 animate-fade-in animate-on-load animate-delay-400">
              <span className="h-0.5 w-12 md:w-20 bg-gradient-to-r from-transparent to-navy/50"></span>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold tracking-wide">
                <span className="text-navy">Listen.</span>{' '}
                <span className="text-navy">Plan.</span>{' '}
                <span className="text-prosper-red">Protect.</span>
              </p>
              <span className="h-0.5 w-12 md:w-20 bg-gradient-to-l from-transparent to-prosper-red/50"></span>
            </div>

            <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto animate-fade-in animate-on-load animate-delay-500">
              A common sense leader committed to thoughtful growth, fiscal responsibility,
              and preserving what makes Prosper special.
            </p>

            {/* Enhanced CTAs */}
            <div className="flex flex-wrap justify-center gap-4 pt-8 animate-fade-in-up animate-on-load animate-delay-600">
              <Link href="/get-involved" className="btn-primary text-lg px-10 py-4">
                Get Involved
              </Link>
              <Link href="/about" className="btn-outline text-lg px-10 py-4">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <Reveal delay={0}>
              <div className="stat-card">
                <div className="stat-number">20</div>
                <div className="stat-label">Years in Prosper</div>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div className="stat-card">
                <div className="stat-number">3</div>
                <div className="stat-label">Years P&Z Service</div>
              </div>
            </Reveal>
            <Reveal delay={200}>
              <div className="stat-card">
                <div className="stat-number">$210M</div>
                <div className="stat-label">2020 Bond Committee</div>
              </div>
            </Reveal>
            <Reveal delay={300}>
              <div className="stat-card">
                <div className="stat-number">$6.5M+</div>
                <div className="stat-label">Annual PISD WSR Annexation</div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Three Pillars Section - Enhanced */}
      <section className="priorities-gradient -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-20 relative">
        {/* Top accent line */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-1 accent-line-full"></div>

        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="section-title">My Priorities</h2>
              <p className="section-subtitle">Common sense leadership for Prosper</p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <Reveal delay={0}>
              <div className="card text-center h-full">
                <div className="icon-container">
                  <Ear className="w-8 h-8 text-navy" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-navy">Listen</h3>
                <p className="text-gray-600">Good decisions start with hearing from residents—not as an afterthought, but from the beginning.</p>
              </div>
            </Reveal>

            <Reveal delay={150}>
              <div className="card text-center h-full">
                <div className="icon-container">
                  <ClipboardList className="w-8 h-8 text-navy" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-navy">Plan</h3>
                <p className="text-gray-600">Build it right the first time. Right-size projects before we break ground.</p>
              </div>
            </Reveal>

            <Reveal delay={300}>
              <div className="card text-center h-full">
                <div className="icon-container">
                  <ShieldCheck className="w-8 h-8 text-navy" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-navy">Protect</h3>
                <p className="text-gray-600">Growth isn't the enemy—losing our community character is.</p>
              </div>
            </Reveal>
          </div>

          <Reveal delay={400}>
            <div className="text-center mt-12">
              <Link href="/priorities" className="btn-outline">
                Learn More About My Priorities
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* About Preview - Enhanced */}
      <section className="py-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-5 gap-10 items-center">
            <Reveal direction="left" className="md:col-span-2">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-navy/10 to-prosper-red/10 rounded-2xl blur-xl"></div>
                <Image
                  src="/headshot.jpg"
                  alt="Doug Charles"
                  width={400}
                  height={500}
                  className="relative rounded-xl shadow-navy-lg mx-auto w-full max-w-[320px]"
                />
              </div>
            </Reveal>

            <Reveal direction="right" className="md:col-span-3 space-y-6">
              <h2 className="section-title">About Doug</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                I've called <strong className="text-navy">Prosper</strong> home for <strong>20 years</strong>. I've served on the Planning & Zoning Commission, worked on the 2020 Bond Committee, and was elected to the WSR HOA Board in Oct 2025.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                I'm running because <strong className="text-prosper-red">Prosper is at a crossroads</strong>. The decisions we make now will shape our community for decades.
              </p>
              <div className="pt-2">
                <Link href="/about" className="btn-outline">
                  Read More About Doug
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Q&A Preview Section */}
      {questions.length > 0 && (
        <section className="priorities-gradient -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-20 relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-1 accent-line-full"></div>

          <div className="max-w-4xl mx-auto">
            <Reveal>
              <div className="text-center mb-12">
                <div className="flex justify-center mb-4">
                  <div className="icon-container">
                    <HelpCircle className="w-8 h-8 text-navy" aria-hidden="true" />
                  </div>
                </div>
                <h2 className="section-title">Questions & Answers</h2>
                <p className="section-subtitle">Direct answers from Doug on the issues that matter</p>
              </div>
            </Reveal>

            <div className="space-y-6">
              {questions.slice(0, 3).map((q, idx) => (
                <Reveal key={q.id} delay={idx * 100}>
                  <div className="card">
                    <h3 className="font-semibold text-navy text-lg mb-3">{q.question}</h3>
                    <p className="text-gray-700 leading-relaxed">{q.answer}</p>
                    <p className="text-sm text-gray-500 mt-3">— Asked by {q.name}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={300}>
              <div className="text-center mt-12 space-y-4">
                <Link href="/qna" className="btn-outline">
                  View All Q&A
                </Link>
                <p className="text-gray-600 text-sm">
                  Have a question? <Link href="/qna" className="text-navy font-medium hover:underline">Submit yours</Link>
                </p>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* Endorsements Preview - Enhanced */}
      {endorsements.length > 0 && (
        <section className="priorities-gradient -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-20 relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-1 accent-line-full"></div>

          <div className="max-w-4xl mx-auto">
            <Reveal>
              <h2 className="section-title text-center mb-4">Community Support</h2>
              <p className="section-subtitle text-center">Hear from your neighbors</p>
            </Reveal>

            <div className="grid gap-6 md:grid-cols-2 mt-8">
              {endorsements.slice(0, 4).map((e, idx) => (
                <Reveal key={e.id} delay={idx * 100}>
                  <div className="card h-full">
                    <div className="quote-enhanced mb-4">
                      <p className="text-gray-700 not-italic">"{e.message}"</p>
                    </div>
                    <p className="font-semibold text-navy flex items-center gap-3">
                      <span className="w-10 h-10 bg-gradient-to-br from-navy to-navy-light rounded-full flex items-center justify-center text-sm text-white font-bold shadow-sm">
                        {e.name.charAt(0)}
                      </span>
                      {e.name}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={400}>
              <div className="text-center mt-12">
                <Link href="/endorsements" className="btn-outline">
                  View All Endorsements
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* CTA Section - Enhanced */}
      <section className="cta-gradient text-white -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <Reveal>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              Join the Campaign
            </h2>
          </Reveal>

          <Reveal delay={100}>
            <p className="text-xl text-white/90 mb-10 leading-relaxed">
              Together, we can ensure Prosper's growth is managed wisely and every resident's voice is heard.
            </p>
          </Reveal>

          <Reveal delay={200}>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/get-involved" className="btn-white text-lg px-10 py-4">
                Get Involved
              </Link>
              <Link href="/donate" className="btn-secondary text-lg px-10 py-4">
                Donate
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
