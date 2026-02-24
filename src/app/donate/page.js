import Image from 'next/image';
import Script from 'next/script';
import { Mail, MessageCircle } from 'lucide-react';
import DonateDynamic from '../../components/DonateDynamic';

export const metadata = {
  title: 'Support Doug Charles — Prosper Town Council, Place 5',
  description:
    'Support Doug Charles for Prosper Town Council Place 5. Your contribution helps bring Common Sense leadership and community engagement to ALL of Prosper.',
  alternates: { canonical: '/donate' },
  openGraph: {
    title: 'Support Doug Charles — Prosper Town Council, Place 5',
    description: 'Your contribution supports community engagement and Common Sense leadership for ALL of Prosper.',
    url: 'https://www.dougcharles.com/donate',
    siteName: 'Doug Charles — Prosper Town Council, Place 5',
    locale: 'en_US',
    type: 'website',
    images: [{
      url: 'https://www.dougcharles.com/campaign-preview.webp',
      width: 1200,
      height: 630,
      alt: 'Support Doug Charles for Prosper Town Council'
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Support Doug Charles — Prosper Town Council, Place 5',
    description: 'Your contribution supports community engagement and Common Sense leadership for ALL of Prosper.',
    images: ['https://www.dougcharles.com/campaign-preview.webp'],
  },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.dougcharles.com' },
    { '@type': 'ListItem', position: 2, name: 'Donate', item: 'https://www.dougcharles.com/donate' },
  ],
};

const SHARE_MESSAGE =
  "Doug Charles — Prosper Town Council, Place 5! Common Sense leadership for ALL of Prosper at www.dougcharles.com";
const SHARE_SUBJECT = 'Doug Charles — Prosper Town Council, Place 5';

export default function DonatePage() {
  return (
    <div className="space-y-0">
      <Script id="donate-breadcrumb" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {/* Hero */}
      <section className="hero-pattern hero-gradient text-center py-16 md:py-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-10 right-20 w-64 h-64 bg-navy/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-20 w-48 h-48 bg-prosper-red/5 rounded-full blur-3xl"></div>
        </div>
        <Image
          src="/campaign-logo.webp"
          alt=""
          aria-hidden="true"
          width={96}
          height={64}
          sizes="(max-width: 640px) 80px, (max-width: 768px) 112px, (max-width: 1024px) 128px, 144px"
          className="absolute top-4 right-4 w-20 sm:w-28 md:w-32 lg:w-36 h-auto opacity-80 pointer-events-none"
        />
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-navy mb-6">Support Doug Charles</h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Your contribution supports community engagement and{' '}
            <strong className="text-navy">Common Sense</strong> leadership for <strong className="text-prosper-red">ALL</strong> of Prosper.
          </p>
        </div>
      </section>

      {/* Donation Form (Client Component) */}
      <DonateDynamic />

      {/* Why Donate */}
      <section className="priorities-gradient -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-20 relative">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-1 accent-line-full"></div>

        <div className="max-w-4xl mx-auto">
          <h2 className="section-title text-center mb-4">Your Support Makes a Difference</h2>
          <p className="section-subtitle text-center">
            Every dollar helps strengthen community engagement
          </p>

          <div className="grid gap-6 md:grid-cols-3 mt-12">
            <div className="card text-center h-full">
              <div className="icon-container">
                <span className="text-2xl">🏠</span>
              </div>
              <h3 className="text-xl font-bold text-navy mb-3">Community Visibility</h3>
              <p className="text-gray-600">
                Help <strong className="text-navy">spread the message</strong> of Common Sense leadership across{' '}
                <strong className="text-prosper-red">Prosper neighborhoods</strong>.
              </p>
            </div>

            <div className="card text-center h-full">
              <div className="icon-container">
                <span className="text-2xl">📬</span>
              </div>
              <h3 className="text-xl font-bold text-navy mb-3">Community Outreach</h3>
              <p className="text-gray-600">
                Reach every resident with the message that Prosper deserves{' '}
                <strong className="text-navy">visionary, fiscally responsible leadership</strong>—through
                mailers, community outreach, and digital engagement.
              </p>
            </div>

            <div className="card text-center h-full">
              <div className="icon-container">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="text-xl font-bold text-navy mb-3">Community Events</h3>
              <p className="text-gray-600">
                Host <strong className="text-navy">meet-and-greets and town halls</strong> to{' '}
                <strong className="text-prosper-red">hear from residents</strong>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Spread the Word Section */}
      <section className="py-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="card bg-gradient-to-br from-navy/5 to-prosper-red/5">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-navy mb-2">Spread the Word</h2>
              <p className="text-gray-600">
                Can't contribute right now? Help{' '}
                <strong className="text-navy">connect more Prosper residents</strong> by sharing with
                friends and neighbors!
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {/* Email Share */}
              <div className="text-center">
                <a
                  href={`mailto:?subject=${encodeURIComponent(SHARE_SUBJECT)}&body=${encodeURIComponent(SHARE_MESSAGE)}`}
                  className="inline-flex items-center justify-center gap-3 w-full px-6 py-4 bg-navy text-white font-semibold rounded-lg hover:bg-navy/90 transition-all"
                >
                  <Mail className="w-5 h-5" />
                  Share via Email
                </a>
                <p className="text-sm text-gray-700 mt-3">
                  Opens your email app with a pre-written message. Choose who to send it to.
                </p>
              </div>

              {/* Text Share */}
              <div className="text-center">
                <a
                  href={`sms:?&body=${encodeURIComponent(SHARE_MESSAGE)}`}
                  className="inline-flex items-center justify-center gap-3 w-full px-6 py-4 bg-prosper-red text-white font-semibold rounded-lg hover:bg-prosper-red/90 transition-all"
                >
                  <MessageCircle className="w-5 h-5" />
                  Share via Text
                </a>
                <p className="text-sm text-gray-700 mt-3">
                  Opens your messaging app with a pre-written text. Select your contacts.
                </p>
              </div>
            </div>

            <p className="text-center text-xs text-gray-700 mt-6">
              Personal recommendations are the most powerful way to reach residents!
            </p>
          </div>
        </div>
      </section>

      {/* Legal Disclaimer */}
      <section className="py-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="card bg-gray-50/50">
            <p className="text-sm text-gray-600 leading-relaxed">
              Political advertising paid for by Doug Charles for Town of Prosper Town Council Place 5.
              <br />
              Robert Bye, Campaign Treasurer
              <br />
              <br />
              Contributions to Doug Charles for Prosper Town Council Place 5 are separate from
              Doug&apos;s official duties as a Town Council member. Contributions support campaign
              operations and constituent outreach in Doug&apos;s personal capacity.
              <br />
              <br />
              Under Texas law, contributions from corporations and labor organizations are
              prohibited. Individual contributions are not tax-deductible. By contributing, you
              confirm you are a U.S. citizen or permanent resident and this contribution is from
              your own funds.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
