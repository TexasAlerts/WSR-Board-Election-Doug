'use client';

import { useState } from 'react';
import { useRecaptcha } from '../hooks/useRecaptcha';
import { trackFbEvent } from './TrackingUtils';

/**
 * Lightweight inline email signup form for the homepage Stay Connected section.
 * Submits to the interest API as an "updates" type subscription.
 *
 * @returns {React.JSX.Element}
 */
export default function HomepageSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const { getToken } = useRecaptcha();

  /** @param {React.FormEvent} e */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('submitting');
    setMessage('');

    try {
      const recaptchaToken = await getToken('submit_interest');

      const res = await fetch('/api/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'updates',
          name: 'Newsletter Subscriber',
          email: email.trim(),
          phone: null,
          message: '',
          consentEmail: true,
          consentSms: false,
          recaptchaToken,
        }),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        trackFbEvent('Lead', { content_name: 'homepage_signup' });
        if (data.needsVerification) {
          setMessage('Check your email to confirm your subscription.');
        } else {
          setMessage('You\'re signed up for updates!');
        }
        setStatus('success');
        setEmail('');
      } else {
        setMessage(data.error || 'Something went wrong. Please try again.');
        setStatus('error');
      }
    } catch {
      setMessage('Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <p className="text-white/90 text-lg mt-6" role="status">
        {message}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 max-w-md mx-auto">
      <label htmlFor="homepage-email" className="sr-only">
        Email address
      </label>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          id="homepage-email"
          type="email"
          required
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 px-4 py-3 rounded-lg text-charcoal text-base focus:outline-none focus:ring-2 focus:ring-white/50 min-h-[48px]"
          disabled={status === 'submitting'}
        />
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="px-6 py-3 bg-white text-navy font-semibold rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 min-h-[48px] whitespace-nowrap"
        >
          {status === 'submitting' ? 'Signing up...' : 'Get Updates'}
        </button>
      </div>
      {message && status === 'error' && (
        <p className="text-red-200 text-sm mt-2" role="alert">
          {message}
        </p>
      )}
      <p className="text-white/60 text-xs mt-2">
        We respect your privacy. Unsubscribe anytime.
      </p>
    </form>
  );
}
