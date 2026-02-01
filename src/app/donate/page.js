import Image from 'next/image';
import { Mail, MessageCircle } from 'lucide-react';
import DonateDynamic from '../../components/DonateDynamic';

const SHARE_MESSAGE = "I'm supporting Doug Charles for Prosper Town Council Place 5! Learn more about his Common Sense leadership for ALL of Prosper at www.dougcharles.com";
const SHARE_SUBJECT = "Check out Doug Charles for Prosper Town Council";

export default function DonatePage() {
  return (
    <div className="space-y-0">
      {/* Hero */}
      <section className="bg-gradient-red text-white -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        </div>
        {/* Logo accent */}
        <Image
          src="/campaign-logo.webp"
          alt="Doug Charles for Prosper Town Council Place 5"
          width={96}
          height={64}
          className="absolute top-4 right-4 w-16 sm:w-20 md:w-24 h-auto opacity-40 pointer-events-none brightness-200"
        />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            Support the Campaign
          </h1>
          <p className="text-xl text-white/90">
            Your contribution helps us reach every voter in Prosper with a message of <strong>Common Sense</strong> leadership for <strong>ALL</strong> of Prosper.
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
          <p className="section-subtitle text-center">Every dollar helps build a stronger campaign</p>

          <div className="grid gap-6 md:grid-cols-3 mt-12">
            <div className="card text-center h-full">
              <div className="icon-container">
                <span className="text-2xl">🏠</span>
              </div>
              <h3 className="text-xl font-bold text-navy mb-3">Yard Signs</h3>
              <p className="text-gray-600">Help <strong className="text-navy">spread the message</strong> across <strong className="text-prosper-red">Prosper neighborhoods</strong>.</p>
            </div>

            <div className="card text-center h-full">
              <div className="icon-container">
                <span className="text-2xl">📬</span>
              </div>
              <h3 className="text-xl font-bold text-navy mb-3">Voter Outreach</h3>
              <p className="text-gray-600">Connect with voters through <strong className="text-navy">mailers, door-to-door, and digital campaigns</strong>.</p>
            </div>

            <div className="card text-center h-full">
              <div className="icon-container">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="text-xl font-bold text-navy mb-3">Community Events</h3>
              <p className="text-gray-600">Host <strong className="text-navy">meet-and-greets and town halls</strong> to <strong className="text-prosper-red">hear from residents</strong>.</p>
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
                Can't donate right now? Help us <strong className="text-navy">reach more Prosper residents</strong> by sharing with friends and neighbors!
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
                <p className="text-sm text-gray-500 mt-3">
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
                <p className="text-sm text-gray-500 mt-3">
                  Opens your messaging app with a pre-written text. Select your contacts.
                </p>
              </div>
            </div>

            <p className="text-center text-xs text-gray-400 mt-6">
              Personal recommendations are the most powerful way to reach voters!
            </p>
          </div>
        </div>
      </section>

      {/* Legal Disclaimer */}
      <section className="py-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="card bg-gray-50/50">
            <p className="text-sm text-gray-600 leading-relaxed">
              Political advertising paid for by Doug Charles for Prosper Town Council.
              <br /><br />
              Under Texas law, contributions from corporations and labor organizations are prohibited. Individual contributions are not tax-deductible. By contributing, you confirm you are a U.S. citizen or permanent resident and this contribution is from your own funds.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
