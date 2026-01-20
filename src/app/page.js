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
            <h1 className="sr-only">Doug Charles for Prosper Town Council Place 5</h1>
            <Image
              src="/wsr-logo.webp"
              alt="Doug Charles for Town Council Place 5 - A Common Sense Leader for All of Prosper"
              width={800}
              height={533}
              priority
              className="mx-auto w-full max-w-[320px] sm:max-w-[520px] md:max-w-[680px] lg:max-w-[800px] h-auto mb-8 drop-shadow-xl"
              sizes="(max-width: 640px) 320px, (max-width: 768px) 520px, (max-width: 1024px) 680px, 800px"
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
              A <strong className="text-navy">Common Sense</strong> leader for <strong className="text-prosper-red">ALL</strong> of Prosper—committed to thoughtful growth, fiscal responsibility,
              and preserving what makes our community special.
            </p>

            {/* Enhanced CTAs */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 pt-8 animate-fade-in-up animate-on-load animate-delay-600 px-4 sm:px-0">
              <Link href="/get-involved" className="btn-primary text-base sm:text-lg px-8 sm:px-10 py-4 w-full sm:w-auto text-center">
                Get Involved
              </Link>
              <Link href="/about" className="btn-outline text-base sm:text-lg px-8 sm:px-10 py-4 w-full sm:w-auto text-center">
                About Doug Charles
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 items-stretch">
            <div className="h-full">
              <div className="stat-card h-full flex flex-col justify-center">
                <div className="stat-number">20</div>
                <div className="stat-label">Years in Prosper</div>
              </div>
            </div>
            <div className="h-full">
              <div className="stat-card h-full flex flex-col justify-center">
                <div className="stat-number">3</div>
                <div className="stat-label">Years Planning & Zoning</div>
              </div>
            </div>
            <div className="h-full">
              <div className="stat-card h-full flex flex-col justify-center">
                <div className="stat-number">$210M</div>
                <div className="stat-label">2020 Bond Committee</div>
              </div>
            </div>
            <div className="h-full">
              <div className="stat-card h-full flex flex-col justify-center">
                <div className="stat-number">$6.5M</div>
                <div className="stat-label">Annual Tax Revenue</div>
                <div className="text-xs text-gray-500 mt-1">PISD Annexation · Approved by Prosper ISD</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Three Pillars Section - Enhanced */}
      <section className="priorities-gradient -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-20 relative">
        {/* Top accent line */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-1 accent-line-full"></div>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-title">My Priorities</h2>
            <p className="section-subtitle"><strong>Common Sense</strong> leadership for <strong>ALL</strong> of Prosper</p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="card text-center h-full">
              <div className="icon-container">
                <Ear className="w-8 h-8 text-navy" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-navy">Listen</h3>
              <p className="text-gray-600">Good decisions start with hearing from residents—not as an afterthought, but from the beginning. Your voice should shape outcomes before votes are taken.</p>
            </div>

            <div className="card text-center h-full">
              <div className="icon-container">
                <ClipboardList className="w-8 h-8 text-navy" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-navy">Plan</h3>
              <p className="text-gray-600">Build it right the first time. Size projects correctly from the start. Think long-term so we're not fixing mistakes or asking for more money later.</p>
            </div>

            <div className="card text-center h-full">
              <div className="icon-container">
                <ShieldCheck className="w-8 h-8 text-navy" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-navy">Protect</h3>
              <p className="text-gray-600">Prosper isn't just another suburb—it's Friday night football under the lights, Small Town, Big Heart, and downtown festivals that bring neighbors together.</p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/about#priorities" className="btn-outline">
              See Full Priority Details →
            </Link>
          </div>
        </div>
      </section>

      {/* About Preview - Enhanced */}
      <section className="py-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-5 gap-10 items-center">
            <div className="md:col-span-2">
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
            </div>

            <div className="md:col-span-3 space-y-6">
              <h2 className="section-title">About Doug</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                I moved to <strong className="text-navy">Prosper</strong> <strong>20 years ago</strong> for the same reasons you probably did—great schools, safe neighborhoods, and room to raise a family. I've served on the Planning & Zoning Commission, worked on the 2020 Bond Committee, and was elected to the Windsong Ranch HOA Board.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                I'm running because <strong className="text-prosper-red">Prosper is at a crossroads</strong>. The decisions we make now will shape our community for decades.
              </p>
              <div className="pt-2">
                <Link href="/about" className="btn-outline">
                  See Full Bio, Experience & Track Record →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Q&A Preview Section */}
      {questions.length > 0 && (
        <section className="priorities-gradient -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-20 relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-1 accent-line-full"></div>

          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex justify-center mb-4">
                <div className="icon-container">
                  <HelpCircle className="w-8 h-8 text-navy" aria-hidden="true" />
                </div>
              </div>
              <h2 className="section-title">Questions & Answers</h2>
              <p className="section-subtitle">Direct answers from Doug on the issues that matter</p>
            </div>

            <div className="space-y-6">
              {questions.slice(0, 3).map((q) => (
                <div key={q.id} className="card">
                  <h3 className="font-semibold text-navy text-lg mb-3">{q.question}</h3>
                  <p className="text-gray-700 leading-relaxed">{q.answer}</p>
                  <p className="text-sm text-gray-500 mt-3">— Asked by {q.name}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-12 space-y-4">
              <Link href="/qna" className="btn-outline">
                View All Q&A
              </Link>
              <p className="text-gray-600 text-sm">
                Have a question? <Link href="/qna" className="text-navy font-medium hover:underline">Submit yours</Link>
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Endorsements Preview - Enhanced */}
      {endorsements.length > 0 && (
        <section className="priorities-gradient -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-20 relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-1 accent-line-full"></div>

          <div className="max-w-4xl mx-auto">
            <h2 className="section-title text-center mb-4">Community Support</h2>
            <p className="section-subtitle text-center">Hear from your neighbors</p>

            <div className="grid gap-6 md:grid-cols-2 mt-8">
              {endorsements.slice(0, 4).map((e) => (
                <div key={e.id} className="card h-full">
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
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/endorsements" className="btn-outline">
                View All Endorsements
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - Enhanced */}
      <section className="cta-gradient text-white -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            Join the Campaign
          </h2>

          <p className="text-xl text-white/90 mb-10 leading-relaxed">
            Local races are decided by a few hundred votes. Your support—and your voice—can make the difference.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4 sm:px-0">
            <Link href="/get-involved" className="btn-white text-base sm:text-lg px-8 sm:px-10 py-4 w-full sm:w-auto text-center">
              Get Involved
            </Link>
            <Link href="/donate" className="btn-secondary text-base sm:text-lg px-8 sm:px-10 py-4 w-full sm:w-auto text-center">
              Donate
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
