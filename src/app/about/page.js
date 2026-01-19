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
          src="/wsr-logo.webp"
          alt=""
          className="absolute top-4 right-4 w-16 sm:w-20 md:w-24 opacity-80 pointer-events-none"
        />
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-navy mb-4 animate-fade-in-down">
            About Doug
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto animate-fade-in animate-delay-200">
            20 years of service · <strong>Common Sense</strong> leadership for <strong>ALL</strong> of Prosper
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
              I moved to <strong className="text-navy">Prosper</strong> <strong>20 years ago</strong> for the same reasons you probably did—great schools, safe neighborhoods, and room to raise a family. I've watched this town grow from a few thousand people to over 35,000, and I've welcomed every new neighbor along the way.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              In the last 5-7 years, as Prosper started changing from that "Small Town, Big Heart" feeling, I became more active in local government. I've raised my family here, served on the Planning & Zoning Commission, worked on the 2020 Bond Committee, and currently serve on the Windsong Ranch HOA Board.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              <strong className="text-prosper-red">Whether you've been here 20 years or 2 months, you deserve a voice at the table.</strong>
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

      {/* Proven Track Record */}
      <section className="py-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <h2 className="section-title text-center mb-4">Proven Track Record</h2>
            <p className="section-subtitle text-center">Results, not just promises</p>
          </Reveal>

          <div className="space-y-6 mt-12">
            <Reveal delay={0}>
              <div className="card">
                <div className="flex items-start gap-4">
                  <div className="text-sm font-bold text-navy whitespace-nowrap">Nov 2019</div>
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
                <div className="flex items-start gap-4">
                  <div className="text-sm font-bold text-navy whitespace-nowrap">Aug 2020</div>
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
                <div className="flex items-start gap-4">
                  <div className="text-sm font-bold text-navy whitespace-nowrap">Nov 2020</div>
                  <div>
                    <h3 className="text-lg font-bold text-navy mb-2">Bond Election Committee</h3>
                    <p className="text-gray-600">Helped pass <strong className="text-navy">$210M</strong> in bonds for roads, parks, and facilities—infrastructure investments that continue to benefit Prosper residents today.</p>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={150}>
              <div className="card">
                <div className="flex items-start gap-4">
                  <div className="text-sm font-bold text-navy whitespace-nowrap">Sept 2021</div>
                  <div>
                    <h3 className="text-lg font-bold text-navy mb-2">Advocated for Tax Relief & Public Safety Investment</h3>
                    <p className="text-gray-600 mb-2">Appeared before Town Council to advocate for a <strong className="text-navy">4-cent property tax rate reduction</strong> while simultaneously calling for a <strong className="text-prosper-red">7% pay increase for Police and Fire</strong> personnel. Challenged the Town's excessive reserves, arguing taxpayer money should be returned or invested in infrastructure—not hoarded. This <strong className="text-navy">consistent support for public safety</strong> continued in 2025, when I advocated for the public safety bond propositions.</p>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="card">
                <div className="flex items-start gap-4">
                  <div className="text-sm font-bold text-navy whitespace-nowrap">2021-2023</div>
                  <div>
                    <h3 className="text-lg font-bold text-navy mb-2">Planning & Zoning Commissioner</h3>
                    <p className="text-gray-600">Reviewed <strong className="text-navy">hundreds of development applications</strong>. Learned firsthand how land use decisions impact neighborhoods—and how to <strong className="text-navy">ask the right questions</strong>.</p>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={250}>
              <div className="card">
                <div className="flex items-start gap-4">
                  <div className="text-sm font-bold text-navy whitespace-nowrap">Nov 2023</div>
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
                <div className="flex items-start gap-4">
                  <div className="text-sm font-bold text-navy whitespace-nowrap">Apr 2025</div>
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
                <div className="flex items-start gap-4">
                  <div className="text-sm font-bold text-navy whitespace-nowrap">Oct 2025</div>
                  <div>
                    <h3 className="text-lg font-bold text-navy mb-2">Windsong Ranch HOA Board</h3>
                    <p className="text-gray-600"><strong className="text-navy">Elected by neighbors</strong> to serve on the board of one of Prosper's largest communities.</p>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={400}>
              <div className="card">
                <div className="flex items-start gap-4">
                  <div className="text-sm font-bold text-navy whitespace-nowrap">Nov 2025</div>
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
                <div className="flex items-start gap-4">
                  <div className="text-sm font-bold text-navy whitespace-nowrap">Dec 2025</div>
                  <div>
                    <h3 className="text-lg font-bold text-navy mb-2">PISD Annexation Victory</h3>
                    <p className="text-gray-600 mb-2">Led petition to bring <strong className="text-prosper-red">$6.5 million+</strong> in annual property taxes and <strong className="text-navy">274 Windsong Ranch students</strong> home to Prosper ISD. The Prosper ISD Board approved unanimously on December 15, 2025. Now awaiting TEA Commissioner final decision.</p>
                    <p className="text-gray-500 italic text-sm mb-2">"The residents of Windsong Ranch...pay property taxes to Prosper ISD but their children attend Celina schools." — KERA News</p>
                    <a href="https://prosperisdpetition.com" target="_blank" rel="noopener noreferrer" className="text-navy font-medium hover:underline text-sm">Track progress at prosperisdpetition.com →</a>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Professional Background */}
      <section className="priorities-gradient -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-20 relative">
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
