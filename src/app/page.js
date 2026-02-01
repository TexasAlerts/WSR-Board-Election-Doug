import Image from 'next/image';
import Link from 'next/link';
import {
  Ear,
  ClipboardList,
  ShieldCheck,
} from 'lucide-react';
import HomeDynamic from '../components/HomeDynamic';

export default function Home() {
  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <section className="hero-gradient text-center py-10 md:py-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div>
            <h1 className="sr-only">Doug Charles for Prosper Town Council Place 5</h1>
            <Image
              src="/campaign-logo.webp"
              alt="Doug Charles for Prosper Town Council Place 5 - A Common Sense Leader for All of Prosper"
              width={800}
              height={533}
              priority
              className="mx-auto w-full max-w-[320px] sm:max-w-[520px] md:max-w-[680px] lg:max-w-[800px] h-auto mb-8 drop-shadow-xl"
              sizes="(max-width: 640px) 320px, (max-width: 768px) 520px, (max-width: 1024px) 680px, 800px"
            />
          </div>

          <div className="space-y-6">

            {/* Tagline with gradient accent lines */}
            <div className="flex items-center justify-center gap-4 py-6">
              <span className="h-0.5 w-12 md:w-20 bg-gradient-to-r from-transparent to-navy/50"></span>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold tracking-wide">
                <span className="text-navy">Listen.</span>{' '}
                <span className="text-navy">Plan.</span>{' '}
                <span className="text-prosper-red">Protect.</span>
              </p>
              <span className="h-0.5 w-12 md:w-20 bg-gradient-to-l from-transparent to-prosper-red/50"></span>
            </div>

            <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
              A <strong className="text-navy">Common Sense</strong> leader for <strong className="text-prosper-red">ALL</strong> of Prosper—committed to thoughtful growth, fiscal responsibility,
              and preserving what makes our community special.
            </p>

            {/* Enhanced CTAs */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 pt-8 px-4 sm:px-0">
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
                <div className="text-xs text-gray-500 mt-1 leading-snug">20-year resident · <strong className="text-navy">Active advocate</strong> since 2019</div>
              </div>
            </div>
            <div className="h-full">
              <div className="stat-card h-full flex flex-col justify-center">
                <div className="stat-number">P&Z</div>
                <div className="stat-label">Planning & Zoning</div>
                <div className="text-xs text-gray-500 mt-1 leading-snug"><strong className="text-navy">Commissioner</strong> for 3 years</div>
              </div>
            </div>
            <div className="h-full">
              <div className="stat-card h-full flex flex-col justify-center">
                <div className="stat-number">$210M</div>
                <div className="stat-label">Bond Committee</div>
                <div className="text-xs text-gray-500 mt-1 leading-snug">2020 Election — <strong className="text-navy">all bonds passed</strong></div>
              </div>
            </div>
            <div className="h-full">
              <div className="stat-card h-full flex flex-col justify-center">
                <div className="stat-number">$6.5M</div>
                <div className="stat-label">New Annual Tax Revenue</div>
                <div className="text-xs text-gray-500 mt-1 leading-snug">Lead <strong className="text-navy">Windsong Annexation</strong> Petitioner · Passed PISD, now with <strong className="text-navy">TEA</strong></div>
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
            <p className="section-subtitle"><strong className="text-navy">Common Sense</strong> leadership for <strong className="text-prosper-red">ALL</strong> of Prosper</p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="card text-center h-full">
              <div className="icon-container">
                <Ear className="w-8 h-8 text-navy" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-navy">Listen</h3>
              <p className="text-gray-600">Good decisions start with <strong className="text-navy">hearing from residents</strong>—not as an afterthought, but <strong className="text-prosper-red">from the beginning</strong>. Your voice should shape outcomes <strong className="text-navy">before votes are taken</strong>.</p>
              <div className="flex flex-wrap justify-center gap-2 mt-4 text-sm">
                <Link href="/qna" className="text-navy font-medium hover:underline">Ask a question</Link>
                <span className="text-gray-500" aria-hidden="true">·</span>
                <Link href="/get-involved#meeting" className="text-navy font-medium hover:underline">Request a meeting</Link>
                <span className="text-gray-500" aria-hidden="true">·</span>
                <Link href="/qna" className="text-navy font-medium hover:underline">Submit an idea</Link>
              </div>
            </div>

            <div className="card text-center h-full">
              <div className="icon-container">
                <ClipboardList className="w-8 h-8 text-navy" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-navy">Plan</h3>
              <p className="text-gray-600"><strong className="text-navy">Build it right the first time.</strong> Size projects correctly <strong className="text-navy">from the start</strong>. <strong className="text-prosper-red">Think long-term</strong> so we&apos;re not fixing mistakes or asking for more money later.</p>
              <div className="flex flex-wrap justify-center gap-2 mt-4 text-sm">
                <Link href="/polls" className="text-navy font-medium hover:underline">Participate in a poll</Link>
                <span className="text-gray-500" aria-hidden="true">·</span>
                <Link href="/priorities" className="text-navy font-medium hover:underline">See my priorities</Link>
              </div>
            </div>

            <div className="card text-center h-full">
              <div className="icon-container">
                <ShieldCheck className="w-8 h-8 text-navy" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-navy">Protect</h3>
              <p className="text-gray-600">Prosper isn&apos;t just another suburb—it&apos;s <strong className="text-navy">Friday night football under the lights</strong>, <strong className="text-prosper-red">Small Town, Big Heart</strong>, and downtown festivals that bring neighbors together.</p>
              <div className="flex flex-wrap justify-center gap-2 mt-4 text-sm">
                <Link href="/track-record" className="text-navy font-medium hover:underline">See my track record</Link>
                <span className="text-gray-500" aria-hidden="true">·</span>
                <Link href="/qna" className="text-navy font-medium hover:underline">Submit an idea</Link>
              </div>
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
                  src="/headshot.webp"
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
                I moved to <strong className="text-navy">Prosper</strong> <strong>20 years ago</strong> for the same reasons you probably did—great schools, safe neighborhoods, and room to raise a family. I&apos;ve served on the Planning & Zoning Commission, worked on the 2020 Bond Committee, and led the Windsong Ranch PISD annexation effort.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Prosper has grown from a small town to one of the fastest-growing communities in Texas. Thousands of new families have settled here—but too many decisions are still being made by a small group without meaningful input from the residents they affect. <strong className="text-prosper-red">Whether you&apos;ve been here 20 years or 2 months, you deserve a voice.</strong> That&apos;s why I&apos;m running.
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

      {/* Dynamic sections (client-side: endorsements + Q&A) */}
      <HomeDynamic />

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
