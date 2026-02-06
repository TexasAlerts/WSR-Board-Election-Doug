'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

const DONATION_AMOUNTS = [25, 50, 100, 250, 500, 1000];

export default function DonateDynamic() {
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const ANEDOT_URL =
    'https://secure.anedot.com/doug-charles-for-town-of-prosper-town-council-place-5/af99e860-1f84-443a-9a3d-a90ee0c797d9';
  const DONATIONS_ENABLED = true;

  const handleDonate = () => {
    if (!DONATIONS_ENABLED) {
      setMessage({
        type: 'info',
        text: 'Online donations will be available soon. Please check back shortly!',
      });
      return;
    }
    const amount = selectedAmount || parseInt(customAmount, 10);
    if (!amount || amount < 1) {
      setMessage({ type: 'error', text: 'Please select or enter a donation amount.' });
      return;
    }
    // Redirect to Anedot with pre-selected amount
    window.open(`${ANEDOT_URL}?amount=${amount}`, '_blank');
  };

  return (
    <section className="py-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="card">
          <h2 className="text-2xl font-bold text-navy mb-8 text-center">
            Choose Your Contribution
          </h2>

          {/* Amount Buttons */}
          <div role="group" aria-label="Donation amount options">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
              {DONATION_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => {
                    setSelectedAmount(amount);
                    setCustomAmount('');
                  }}
                  aria-pressed={selectedAmount === amount}
                  className={`px-4 py-4 min-h-[44px] rounded-lg font-semibold text-lg transition-all duration-300 ${
                    selectedAmount === amount
                      ? 'bg-gradient-red text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-[1.02]'
                  }`}
                >
                  ${amount}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div className="mb-8">
            <label htmlFor="customAmount" className="form-label text-center block">
              Or enter a custom amount
            </label>
            <div className="relative max-w-[200px] mx-auto">
              <span
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-lg"
                aria-hidden="true"
              >
                $
              </span>
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
                className="form-input text-center text-lg pl-10 min-h-[44px]"
                aria-describedby="custom-amount-hint"
              />
            </div>
            <p id="custom-amount-hint" className="text-xs text-gray-500 text-center mt-2">
              Minimum $1
            </p>
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
            <div
              role="alert"
              aria-live="polite"
              className={`mt-6 p-4 rounded-lg flex items-start gap-3 ${
                message.type === 'error'
                  ? 'bg-red-50 border border-red-200'
                  : message.type === 'info'
                    ? 'bg-blue-50 border border-blue-200'
                    : 'bg-green-50 border border-green-200'
              }`}
            >
              {message.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              ) : message.type === 'info' ? (
                <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              )}
              <p
                className={`text-sm ${
                  message.type === 'error'
                    ? 'text-red-700'
                    : message.type === 'info'
                      ? 'text-blue-700'
                      : 'text-green-700'
                }`}
              >
                {message.text}
              </p>
            </div>
          )}

          {/* Selected Amount Display */}
          {(selectedAmount || customAmount) && (
            <p className="text-center text-gray-600 mt-4">
              You're contributing:{' '}
              <strong className="text-prosper-red text-xl">
                ${selectedAmount || customAmount}
              </strong>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
