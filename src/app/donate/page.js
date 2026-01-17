"use client";

import { useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import Reveal from '../../components/Reveal';

const DONATION_AMOUNTS = [25, 50, 100, 250, 500, 1000];

export default function DonatePage() {
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleDonate = () => {
    const amount = selectedAmount || parseInt(customAmount, 10);
    if (!amount || amount < 1) {
      setMessage({ type: 'error', text: 'Please select or enter a donation amount.' });
      return;
    }
    // TODO: Replace with actual Anedot or payment processor URL
    setMessage({
      type: 'success',
      text: `Thank you for your interest in donating $${amount}! Online donations will be available soon. Please contact doug@dougcharles.com for now.`
    });
  };

  return (
    <div className="space-y-0">
      {/* Hero */}
      <section className="bg-gradient-red text-white -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        </div>
        {/* Logo accent */}
        <img
          src="/wsr-logo.png"
          alt=""
          className="absolute top-4 right-4 w-16 sm:w-20 md:w-24 opacity-40 pointer-events-none brightness-200"
        />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 animate-fade-in-down">
            Support the Campaign
          </h1>
          <p className="text-xl text-white/90 animate-fade-in animate-delay-200">
            Your contribution helps us reach every voter in Prosper with a message of common sense leadership.
          </p>
        </div>
      </section>

      {/* Donation Form */}
      <section className="py-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Reveal>
            <div className="card">
              <h2 className="text-2xl font-bold text-navy mb-8 text-center">Choose Your Contribution</h2>

              {/* Amount Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                {DONATION_AMOUNTS.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => {
                      setSelectedAmount(amount);
                      setCustomAmount('');
                    }}
                    className={`px-4 py-4 rounded-lg font-semibold text-lg transition-all duration-300 ${
                      selectedAmount === amount
                        ? 'bg-gradient-red text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-[1.02]'
                    }`}
                  >
                    ${amount}
                  </button>
                ))}
              </div>

              {/* Custom Amount */}
              <div className="mb-8">
                <label htmlFor="customAmount" className="form-label text-center block">
                  Or enter a custom amount
                </label>
                <div className="relative max-w-[200px] mx-auto">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-lg">$</span>
                  <input
                    id="customAmount"
                    type="number"
                    min="1"
                    placeholder="Other"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setSelectedAmount(null);
                    }}
                    className="form-input text-center text-lg pl-10"
                  />
                </div>
              </div>

              {/* Donate Button */}
              <button
                type="button"
                onClick={handleDonate}
                className="btn-secondary w-full text-lg py-4"
              >
                Contribute Now
              </button>

              {/* Message Display */}
              {message.text && (
                <div className={`mt-6 p-4 rounded-lg flex items-start gap-3 ${
                  message.type === 'error'
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-green-50 border border-green-200'
                }`}>
                  {message.type === 'error' ? (
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  )}
                  <p className={`text-sm ${message.type === 'error' ? 'text-red-700' : 'text-green-700'}`}>
                    {message.text}
                  </p>
                </div>
              )}

              {/* Selected Amount Display */}
              {(selectedAmount || customAmount) && (
                <p className="text-center text-gray-600 mt-4">
                  You're contributing: <strong className="text-prosper-red text-xl">${selectedAmount || customAmount}</strong>
                </p>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Why Donate */}
      <section className="priorities-gradient -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-20 relative">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-1 accent-line-full"></div>

        <div className="max-w-4xl mx-auto">
          <Reveal>
            <h2 className="section-title text-center mb-4">Your Support Makes a Difference</h2>
            <p className="section-subtitle text-center">Every dollar helps build a stronger campaign</p>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-3 mt-12">
            <Reveal delay={0}>
              <div className="card text-center h-full">
                <div className="icon-container">
                  <span className="text-2xl">🏠</span>
                </div>
                <h3 className="text-xl font-bold text-navy mb-3">Yard Signs</h3>
                <p className="text-gray-600">Help spread the message across Prosper neighborhoods.</p>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="card text-center h-full">
                <div className="icon-container">
                  <span className="text-2xl">📬</span>
                </div>
                <h3 className="text-xl font-bold text-navy mb-3">Voter Outreach</h3>
                <p className="text-gray-600">Connect with voters through mailers, door-to-door, and digital campaigns.</p>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="card text-center h-full">
                <div className="icon-container">
                  <span className="text-2xl">🤝</span>
                </div>
                <h3 className="text-xl font-bold text-navy mb-3">Community Events</h3>
                <p className="text-gray-600">Host meet-and-greets and town halls to hear from residents.</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Legal Disclaimer */}
      <section className="py-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <Reveal>
            <div className="card bg-gray-50/50">
              <p className="text-sm text-gray-600 leading-relaxed">
                Political advertising paid for by Doug Charles for Prosper Town Council.
                <br /><br />
                Under Texas law, contributions from corporations and labor organizations are prohibited. Individual contributions are not tax-deductible. By contributing, you confirm you are a U.S. citizen or permanent resident and this contribution is from your own funds.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
