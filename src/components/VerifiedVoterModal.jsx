'use client';

import { useState, useRef, useEffect } from 'react';

export default function VerifiedVoterModal({ onClose, onVerified }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState('form'); // form, sending, sent, error
  const [error, setError] = useState('');
  const modalRef = useRef(null);

  // Escape key and focus trap
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose();
      }
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    modalRef.current?.focus();
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !name) return;

    setStep('sending');
    setError('');

    try {
      const res = await fetch('/api/verified-voters/request-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json();

      if (data.ok && data.alreadyVerified) {
        // Already verified, set cookie and proceed
        onVerified?.({ email, name });
        return;
      }

      if (data.ok) {
        setStep('sent');
      } else if (data.isRegistered) {
        setError('This email is registered. Please sign in to vote.');
        setStep('error');
      } else {
        setError(data.error || 'Something went wrong.');
        setStep('error');
      }
    } catch {
      setError('Network error. Please try again.');
      setStep('error');
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="voter-modal-title"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative outline-none"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl"
          aria-label="Close verification form"
        >
          &times;
        </button>

        {step === 'form' && (
          <>
            <h2 id="voter-modal-title" className="text-lg font-semibold text-navy mb-2">Verify Your Email to Vote</h2>
            <p className="text-gray-600 text-sm mb-4">
              To vote on community polls, we need to verify your email address. This is a one-time process.
            </p>
            <form onSubmit={handleSubmit}>
              <label htmlFor="voter-name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                id="voter-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="First and Last Name"
                required
                className="w-full border rounded-md px-3 py-2 mb-3 text-sm"
              />
              <label htmlFor="voter-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                id="voter-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full border rounded-md px-3 py-2 mb-4 text-sm"
              />
              <button
                type="submit"
                className="w-full bg-prosper-red text-white py-2 px-4 rounded-md hover:bg-red-dark font-medium"
              >
                Send Verification Email
              </button>
            </form>
            <p className="text-xs text-gray-400 mt-3 text-center">
              Already a registered supporter? <a href="/auth/login" className="text-navy underline">Sign in</a>
            </p>
          </>
        )}

        {step === 'sending' && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-navy mx-auto mb-4" />
            <p className="text-gray-600">Sending verification email...</p>
          </div>
        )}

        {step === 'sent' && (
          <div className="text-center py-6">
            <div className="text-green-500 text-4xl mb-3">&#9993;</div>
            <h2 className="text-lg font-semibold text-navy mb-2">Check Your Email</h2>
            <p className="text-gray-600 text-sm">
              We sent a verification link to <strong>{email}</strong>. Click the link to verify and then return here to vote.
            </p>
            <p className="text-gray-400 text-xs mt-4">
              Didn&apos;t receive it? Check your spam folder or{' '}
              <button
                onClick={() => { setStep('form'); }}
                className="text-navy underline"
              >
                try again
              </button>.
            </p>
          </div>
        )}

        {step === 'error' && (
          <div className="text-center py-6" role="alert">
            <div className="text-red-500 text-4xl mb-3">&#10007;</div>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => setStep('form')}
              className="bg-navy text-white py-2 px-4 rounded-md hover:bg-navy/80"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
