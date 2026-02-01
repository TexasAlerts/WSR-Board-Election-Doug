import Image from 'next/image';
import Link from 'next/link';

export default function TrackRecordPage() {
  return (
    <div className="space-y-0">
      {/* Hero */}
      <section className="hero-pattern hero-gradient text-center py-16 md:py-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-10 right-20 w-64 h-64 bg-navy/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-20 w-48 h-48 bg-prosper-red/5 rounded-full blur-3xl"></div>
        </div>
        <Image
          src="/campaign-logo.webp"
          alt="Doug Charles for Prosper Town Council Place 5"
          width={96}
          height={64}
          className="absolute top-4 right-4 w-16 sm:w-20 md:w-24 h-auto opacity-80 pointer-events-none"
        />
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-navy mb-4">
            Track Record
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            <strong className="text-navy">Results</strong>, not just promises
          </p>
        </div>
      </section>

      {/* Proven Track Record */}
      <section className="py-16 md:py-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="section-title text-center mb-4">Proven Track Record</h2>
          <p className="section-subtitle text-center">A history of community advocacy and results</p>

          <div className="space-y-5 mt-10">
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

            <div className="card">
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                <div className="text-sm font-bold text-navy whitespace-nowrap bg-navy/5 px-3 py-1 rounded-full self-start">Nov 2020</div>
                <div>
                  <h3 className="text-lg font-bold text-navy mb-2">Bond Election Committee</h3>
                  <p className="text-gray-600">Helped pass <strong className="text-navy">$210M</strong> in bonds for roads, parks, and facilities—infrastructure investments that continue to benefit Prosper residents today.</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                <div className="text-sm font-bold text-navy whitespace-nowrap bg-navy/5 px-3 py-1 rounded-full self-start">Sept 2021</div>
                <div>
                  <h3 className="text-lg font-bold text-navy mb-2">Advocated for Tax Relief & Public Safety Investment</h3>
                  <p className="text-gray-600 mb-2">Appeared before Town Council to advocate for a <strong className="text-navy">4-cent property tax rate reduction</strong> while simultaneously calling for a <strong className="text-prosper-red">7% pay increase for Police and Fire</strong> personnel. Challenged the Town's excessive reserves, arguing taxpayer money should be returned or invested in infrastructure—not hoarded. This <strong className="text-navy">consistent support for public safety</strong> continued in 2025, when I advocated for the public safety bond propositions.</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                <div className="text-sm font-bold text-navy whitespace-nowrap bg-navy/5 px-3 py-1 rounded-full self-start">2021-2023</div>
                <div>
                  <h3 className="text-lg font-bold text-navy mb-2">Planning & Zoning Commissioner</h3>
                  <p className="text-gray-600">Reviewed <strong className="text-navy">hundreds of development applications</strong>. Learned firsthand how land use decisions impact neighborhoods—and how to <strong className="text-navy">ask the right questions</strong>.</p>
                </div>
              </div>
            </div>

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

            <div className="card">
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                <div className="text-sm font-bold text-navy whitespace-nowrap bg-navy/5 px-3 py-1 rounded-full self-start">Apr 2025</div>
                <div>
                  <h3 className="text-lg font-bold text-navy mb-2">Filed Ethics Complaint on Outside PAC Spending</h3>
                  <p className="text-gray-600 mb-2">I pay attention to the details and <strong className="text-navy">follow the money</strong> to ensure voters know who is supporting candidates making decisions in our town and ISD. When a Washington D.C.-based PAC spent <strong className="text-prosper-red">$115,000</strong> on Prosper ISD races without transparency, I filed a formal complaint with the <strong className="text-navy">Texas Ethics Commission</strong>. The Dallas Morning News Editorial Board noted my transparency, contrasting it with secretive outside groups.</p>
                  <p className="text-gray-500 italic text-sm">"$115,000 just didn't randomly show up from Washington, D.C., into Prosper ISD. There's an agenda." — Dallas Morning News</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                <div className="text-sm font-bold text-navy whitespace-nowrap bg-navy/5 px-3 py-1 rounded-full self-start">Oct 2025</div>
                <div>
                  <h3 className="text-lg font-bold text-navy mb-2">Windsong Ranch HOA Board</h3>
                  <p className="text-gray-600"><strong className="text-navy">Elected by neighbors</strong> to serve on the board of one of Prosper's largest communities.</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                <div className="text-sm font-bold text-navy whitespace-nowrap bg-navy/5 px-3 py-1 rounded-full self-start">Nov 2025</div>
                <div>
                  <h3 className="text-lg font-bold text-navy mb-2">Common Sense on Bond Proposals</h3>
                  <p className="text-gray-600 mb-2">When some 2025 bond proposals seemed undersized, I said publicly: voters agreed, passing <strong className="text-navy">infrastructure and public safety bonds</strong> while rejecting undersized facilities.</p>
                  <p className="text-gray-500 italic text-sm">"Let's build it once, not twice—unless we're going to build it once and expand it with a thoughtful plan that's communicated." — Community Impact</p>
                </div>
              </div>
            </div>

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
          </div>
        </div>
      </section>

      {/* Links to Other Pages */}
      <section className="priorities-gradient -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16">
        <div className="absolute top-0 left-0 right-0 mx-auto w-16 h-1 accent-line-full"></div>
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
            <Link href="/priorities" className="card text-center hover:shadow-navy-lg transition-shadow">
              <h3 className="text-xl font-bold text-navy mb-2">My Priorities</h3>
              <p className="text-gray-600 text-sm">Listen. Plan. Protect.</p>
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
