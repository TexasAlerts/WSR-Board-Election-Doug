import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Ear, ClipboardList, ShieldCheck } from 'lucide-react';
import HomeServer from '../components/HomeServer';
import { HomeSkeleton } from '../components/shared/Skeleton';

export default function Home() {
  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <section className="hero-gradient text-center py-10 md:py-16 -mx-4 sm:-mx-6 lg:-mx-8 px-2 sm:px-4 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div>
            <h1 className="sr-only">Doug Charles — Prosper, Texas Town Council, Place 5</h1>
            <Image
              src="/dc-logo.webp"
              alt="Doug Charles — Prosper, Texas Town Council, Place 5"
              width={1200}
              height={800}
              priority
              fetchPriority="high"
              quality={90}
              className="mx-auto w-full max-w-[95vw] sm:max-w-[85vw] md:max-w-[960px] lg:max-w-[1100px] xl:max-w-[1200px] h-auto mb-8 drop-shadow-xl"
              sizes="(max-width: 640px) 95vw, (max-width: 768px) 85vw, (max-width: 1024px) 960px, (max-width: 1280px) 1100px, 1200px"
            />
          </div>

          <div className="space-y-6">
            {/* Tagline with gradient accent lines */}
            <div className="flex items-center justify-center gap-4 py-6">
              <span className="h-0.5 w-12 md:w-20 bg-gradient-to-r from-transparent to-navy/50"></span>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold tracking-wide">
                <span className="text-navy">Listen.</span> <span className="text-navy">Plan.</span>{' '}
                <span className="text-prosper-red">Protect.</span>
              </p>
              <span className="h-0.5 w-12 md:w-20 bg-gradient-to-l from-transparent to-prosper-red/50"></span>
            </div>

            <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
              A <strong className="text-navy">Common Sense</strong> leader for{' '}
              <strong className="text-prosper-red">ALL</strong> of Prosper—committed to thoughtful
              growth, fiscal responsibility, and preserving what makes our community special.
            </p>

            {/* Enhanced CTAs */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 pt-8 px-4 sm:px-0">
              <Link
                href="/get-involved"
                className="btn-primary text-base sm:text-lg px-8 sm:px-10 py-4 w-full sm:w-auto text-center"
              >
                Engage
              </Link>
              <Link
                href="/about"
                className="btn-outline text-base sm:text-lg px-8 sm:px-10 py-4 w-full sm:w-auto text-center"
              >
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
                <div className="text-xs text-gray-700 mt-1 leading-snug">
                  20-year resident · <strong className="text-navy">Active advocate</strong> since
                  2019
                </div>
              </div>
            </div>
            <div className="h-full">
              <div className="stat-card h-full flex flex-col justify-center">
                <div className="stat-number">P&Z</div>
                <div className="stat-label">Planning & Zoning</div>
                <div className="text-xs text-gray-700 mt-1 leading-snug">
                  <strong className="text-navy">Commissioner</strong> for 3 years ·{' '}
                  <strong className="text-navy">Reviewed over 100 development applications</strong>—I know what works
                </div>
              </div>
            </div>
            <div className="h-full">
              <div className="stat-card h-full flex flex-col justify-center">
                <div className="stat-number">$210M</div>
                <div className="stat-label">Bond Committee</div>
                <div className="text-xs text-gray-700 mt-1 leading-snug">
                  2020 Election — <strong className="text-navy">all bonds passed</strong>
                </div>
              </div>
            </div>
            <div className="h-full">
              <div className="stat-card h-full flex flex-col justify-center">
                <div className="stat-number">$6.5M+</div>
                <div className="stat-label">PISD Property Taxes</div>
                <div className="text-xs text-gray-700 mt-1 leading-snug">
                  Led <strong className="text-navy">Windsong Ranch PISD annexation</strong> petition ·
                  <strong className="text-navy">Pending TEA approval</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Prosper at a Crossroads Section */}
      <section className="py-16 md:py-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 priorities-gradient">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 text-navy">
            Prosper at a Crossroads
          </h2>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <div className="card">
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p className="text-base sm:text-lg">
                  Prosper is one of the fastest-growing communities in Texas. The Fields, PGA, and
                  Universal Theme Park are bringing <strong className="text-navy">millions of visitors
                  to our doorstep</strong>. In the next few years, decisions about the Tollway corridor,
                  downtown, and commercial development will determine whether we become their{' '}
                  <strong className="text-prosper-red">destination of choice</strong>—or watch them
                  drive past.
                </p>
                <p className="text-base sm:text-lg">
                  We can keep approving whatever developers bring us—or Town Council can partner with
                  the <strong className="text-navy">Chamber of Commerce</strong>,{' '}
                  <strong className="text-navy">Economic Development Committee</strong>, and business
                  leaders to set a bold vision that attracts the investment, jobs, and destinations
                  Prosper deserves.
                </p>
              </div>
            </div>

            <div className="card">
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p className="text-base sm:text-lg">
                  I wholeheartedly believe Prosper has the <strong className="text-navy">tools, the talent, and the{' '}
                  &apos;<span className="text-prosper-red">Small Town, Big Heart</span>&apos; attitude</strong>{' '}
                  to be the premier community where residents{' '}
                  <strong className="text-prosper-red">live, work, play, and shop</strong>—and where
                  our neighbors choose to visit.
                </p>
                <p className="text-base sm:text-lg font-semibold text-navy">
                  Every resident—whether you&apos;ve been here 20 years or 2 months—deserves a voice
                  in making these decisions.
                </p>
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
            <p className="section-subtitle">
              <strong className="text-navy">Common Sense</strong> leadership for{' '}
              <strong className="text-prosper-red">ALL</strong> of Prosper
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="card text-center h-full">
              <div className="icon-container">
                <Ear className="w-8 h-8 text-navy" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-navy">Listen</h3>
              <p className="text-gray-600">
                Good decisions start with{' '}
                <strong className="text-navy">hearing from residents</strong>—not as an
                afterthought, but <strong className="text-prosper-red">from the beginning</strong>.
                Your voice should shape outcomes{' '}
                <strong className="text-navy">before votes are taken</strong>.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-4 text-sm">
                <Link href="/qna" className="text-navy font-medium hover:underline">
                  Ask a question
                </Link>
                <span className="text-gray-500" aria-hidden="true">
                  ·
                </span>
                <Link
                  href="/get-involved#meeting"
                  className="text-navy font-medium hover:underline"
                >
                  Request a meeting
                </Link>
                <span className="text-gray-500" aria-hidden="true">
                  ·
                </span>
                <Link href="/ideas" className="text-navy font-medium hover:underline">
                  Submit an idea
                </Link>
              </div>
            </div>

            <div className="card text-center h-full">
              <div className="icon-container">
                <ClipboardList className="w-8 h-8 text-navy" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-navy">Plan</h3>
              <p className="text-gray-600">
                <strong className="text-navy">Build it right the first time.</strong> Size projects
                correctly <strong className="text-navy">from the start</strong>.{' '}
                <strong className="text-prosper-red">Think long-term</strong> so we&apos;re not
                fixing mistakes or asking for more money later.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-4 text-sm">
                <Link href="/polls" className="text-navy font-medium hover:underline">
                  Participate in a poll
                </Link>
                <span className="text-gray-500" aria-hidden="true">
                  ·
                </span>
                <Link href="/priorities" className="text-navy font-medium hover:underline">
                  See my priorities
                </Link>
              </div>
            </div>

            <div className="card text-center h-full">
              <div className="icon-container">
                <ShieldCheck className="w-8 h-8 text-navy" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-navy">Protect</h3>
              <p className="text-gray-600">
                Prosper isn&apos;t just another suburb—it&apos;s{' '}
                <strong className="text-navy">Friday night football under the lights</strong>,{' '}
                <strong className="text-prosper-red">Small Town, Big Heart</strong>, and downtown
                festivals that bring neighbors together.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-4 text-sm">
                <Link href="/track-record" className="text-navy font-medium hover:underline">
                  See my track record
                </Link>
                <span className="text-gray-500" aria-hidden="true">
                  ·
                </span>
                <Link href="/ideas" className="text-navy font-medium hover:underline">
                  Submit an idea
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/priorities" className="btn-outline">
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
                  loading="lazy"
                  className="relative rounded-xl shadow-navy-lg mx-auto w-full max-w-[320px]"
                  sizes="(max-width: 640px) 280px, (max-width: 1024px) 320px, 400px"
                />
              </div>
            </div>

            <div className="md:col-span-3 space-y-6">
              <h2 className="section-title">About Doug</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                I&apos;ve lived in <strong className="text-navy">Prosper for 20 years</strong> and served
                on the <strong className="text-navy">Planning & Zoning Commission</strong> and the{' '}
                <strong className="text-navy">2020 Bond Committee</strong>. I led the{' '}
                <strong className="text-prosper-red">Windsong Ranch PISD annexation</strong> petition that
                will redirect <strong className="text-navy">$6.5M+ in annual property taxes</strong> from
                Denton ISD to Prosper ISD—pending state approval. I know what works—and what doesn&apos;t—when
                it comes to thoughtful growth.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                <strong className="text-prosper-red">
                  Whether you&apos;ve been here 20 years or 2 months, you deserve a voice.
                </strong>{' '}
                That&apos;s why I ran—and why I&apos;m honored to serve.
              </p>
              <div className="pt-2">
                <Link href="/about" className="btn-outline">
                  Learn More About Doug →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Server-rendered sections (endorsements + Q&A for better LCP) */}
      <Suspense fallback={<HomeSkeleton />}>
        <HomeServer />
      </Suspense>

      {/* CTA Section - Enhanced */}
      <section className="cta-gradient text-white -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">Stay Connected</h2>

          <p className="text-xl text-white/90 mb-10 leading-relaxed">
            I&apos;m honored to serve Prosper on the Town Council. Your voice matters—stay involved,
            share your ideas, and help shape our community&apos;s future.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4 sm:px-0">
            <Link
              href="/auth/register"
              className="btn-white text-base sm:text-lg px-8 sm:px-10 py-4 w-full sm:w-auto text-center"
            >
              Create an Account
            </Link>
            <Link
              href="/get-involved"
              className="btn-secondary text-base sm:text-lg px-8 sm:px-10 py-4 w-full sm:w-auto text-center"
            >
              Engage
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
