"use client";

import { useState } from 'react';

const DONATION_AMOUNTS = [25, 50, 100, 250, 500, 1000];

export default function DonatePage() {
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');

  const handleDonate = () => {
    const amount = selectedAmount || parseInt(customAmount, 10);
    if (!amount || amount < 1) {
      alert('Please select or enter a donation amount.');
      return;
    }
    // TODO: Replace with actual Anedot or payment processor URL
    alert(`Thank you for your interest in donating $${amount}! Online donations will be available soon. Please contact doug@dougcharles.com for now.`);
  };

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="bg-prosper-red text-white -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            Support the Campaign
          </h1>
          <p className="text-xl text-white/90">
            Your contribution helps us reach every voter in Prosper with a message of common sense leadership.
          </p>
        </div>
      </section>

      {/* Donation Form */}
      <section className="max-w-2xl mx-auto">
        <div className="card">
          <h2 className="text-xl font-bold text-navy mb-6 text-center">Choose Your Contribution</h2>

          {/* Amount Buttons */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {DONATION_AMOUNTS.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => {
                  setSelectedAmount(amount);
                  setCustomAmount('');
                }}
                className={`px-4 py-4 rounded-lg font-semibold text-lg transition-all ${
                  selectedAmount === amount
                    ? 'bg-prosper-red text-white shadow-lg ring-2 ring-prosper-red ring-offset-2'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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

          {/* Selected Amount Display */}
          {(selectedAmount || customAmount) && (
            <p className="text-center text-gray-600 mt-4">
              You're contributing: <strong className="text-prosper-red">${selectedAmount || customAmount}</strong>
            </p>
          )}
        </div>
      </section>

      {/* Why Donate */}
      <section className="bg-gray-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="section-title text-center mb-12">Your Support Makes a Difference</h2>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="card text-center">
              <h3 className="text-xl font-bold text-navy mb-3">Yard Signs</h3>
              <p className="text-gray-600">Help spread the message across Prosper neighborhoods.</p>
            </div>

            <div className="card text-center">
              <h3 className="text-xl font-bold text-navy mb-3">Voter Outreach</h3>
              <p className="text-gray-600">Connect with voters through mailers, door-to-door, and digital campaigns.</p>
            </div>

            <div className="card text-center">
              <h3 className="text-xl font-bold text-navy mb-3">Community Events</h3>
              <p className="text-gray-600">Host meet-and-greets and town halls to hear from residents.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Legal Disclaimer */}
      <section className="max-w-2xl mx-auto text-center">
        <div className="card bg-gray-50">
          <p className="text-sm text-gray-600 leading-relaxed">
            Political advertising paid for by Doug Charles for Prosper Town Council.
            <br /><br />
            Under Texas law, contributions from corporations and labor organizations are prohibited. Individual contributions are not tax-deductible. By contributing, you confirm you are a U.S. citizen or permanent resident and this contribution is from your own funds.
          </p>
        </div>
      </section>
    </div>
  );
}
