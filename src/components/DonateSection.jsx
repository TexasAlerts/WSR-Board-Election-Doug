"use client";

import { useState } from 'react';

const DONATION_AMOUNTS = [25, 50, 100, 250, 500];

export default function DonateSection() {
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');

  const handleDonate = () => {
    const amount = selectedAmount || parseInt(customAmount, 10);
    if (!amount || amount < 1) {
      alert('Please select or enter a donation amount.');
      return;
    }
    // TODO: Replace with actual Anedot or payment processor URL
    // For now, show a message that donations aren't set up yet
    alert(`Thank you for your interest in donating $${amount}! Online donations will be available soon. Please contact doug@dougcharles.com for now.`);
  };

  return (
    <section id="donate" className="bg-prosper-red text-white py-12 px-4 sm:px-6 lg:px-8 rounded-xl -mx-4 sm:mx-0">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">Support the Campaign</h2>
        <p className="text-lg sm:text-xl opacity-95">
          Your contribution helps us reach every voter in Prosper with a message of common sense leadership.
        </p>

        {/* Donation Amount Buttons */}
        <div className="flex flex-wrap justify-center gap-3">
          {DONATION_AMOUNTS.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => {
                setSelectedAmount(amount);
                setCustomAmount('');
              }}
              className={`px-5 py-3 rounded-lg font-semibold transition-all min-w-[80px] ${
                selectedAmount === amount
                  ? 'bg-white text-prosper-red scale-105'
                  : 'bg-white/20 text-white hover:bg-white/30 border border-white/40'
              }`}
            >
              ${amount}
            </button>
          ))}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 font-semibold">$</span>
            <input
              type="number"
              min="1"
              placeholder="Other"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setSelectedAmount(null);
              }}
              className="w-24 px-5 py-3 pl-7 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/40 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>
        </div>

        {/* Contribute Button */}
        <button
          type="button"
          onClick={handleDonate}
          className="mt-4 px-8 py-4 bg-white text-prosper-red font-bold text-lg rounded-full hover:bg-gray-100 transition-colors shadow-lg"
        >
          Contribute Now
        </button>

        {/* Three Stars */}
        <div className="flex justify-center gap-2 text-2xl pt-4">
          <span>★</span>
          <span>★</span>
          <span>★</span>
        </div>

        {/* Legal Disclaimer */}
        <p className="text-sm opacity-80 pt-4">
          Political advertising paid for by Doug Charles for Prosper Town Council.
        </p>
      </div>
    </section>
  );
}
