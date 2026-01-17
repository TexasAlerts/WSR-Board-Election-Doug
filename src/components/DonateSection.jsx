"use client";

import { useState } from 'react';

const DONATION_AMOUNTS = [25, 50, 100, 250, 500];

export default function DonateSection() {
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');

  const ANEDOT_URL = 'https://secure.anedot.com/doug-charles-for-town-of-prosper-town-council-place-5/af99e860-1f84-443a-9a3d-a90ee0c797d9';
  const DONATIONS_ENABLED = false; // Set to true when Anedot is approved

  const handleDonate = () => {
    if (!DONATIONS_ENABLED) {
      alert('Online donations will be available soon. Please check back shortly!');
      return;
    }
    const amount = selectedAmount || parseInt(customAmount, 10);
    if (!amount || amount < 1) {
      alert('Please select or enter a donation amount.');
      return;
    }
    // Redirect to Anedot with pre-selected amount
    window.open(`${ANEDOT_URL}?amount=${amount}`, '_blank');
  };

  return (
    <section id="donate" className="bg-prosper-red -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
          Support the Campaign
        </h2>
        <p className="text-lg text-white/90 mb-6">
          Your contribution helps us reach every voter in Prosper with a message of <strong>Common Sense</strong> leadership.
        </p>
        {!DONATIONS_ENABLED && (
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-4 mb-10 inline-block">
            <p className="text-white font-semibold">
              🔒 Coming Soon — We're activating our secure donation partner to protect your payment information.
            </p>
          </div>
        )}
        {DONATIONS_ENABLED && <div className="mb-10" />}

        {/* Donation Amount Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {DONATION_AMOUNTS.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => {
                setSelectedAmount(amount);
                setCustomAmount('');
              }}
              className={`px-6 py-3 rounded-lg font-semibold transition-all min-w-[80px] ${
                selectedAmount === amount
                  ? 'bg-white text-prosper-red shadow-lg scale-105'
                  : 'bg-white/10 text-white border border-white/30 hover:bg-white/20'
              }`}
            >
              ${amount}
            </button>
          ))}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 font-semibold">$</span>
            <input
              type="number"
              min="1"
              placeholder="Other"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setSelectedAmount(null);
              }}
              className="w-28 px-6 py-3 pl-8 rounded-lg bg-white/10 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/20"
            />
          </div>
        </div>

        {/* Contribute Button */}
        <button
          type="button"
          onClick={handleDonate}
          className="px-10 py-4 bg-white text-prosper-red font-bold text-lg rounded-lg hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl"
        >
          Contribute Now
        </button>

        {/* Legal Disclaimer */}
        <p className="text-sm text-white/70 mt-10">
          Political advertising paid for by Doug Charles for Prosper Town Council.
        </p>
      </div>
    </section>
  );
}
