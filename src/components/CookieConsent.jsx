'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

/**
 * GDPR-compliant Cookie Consent Banner
 * Shows on first visit and stores consent in localStorage
 *
 * @returns {React.JSX.Element | null}
 */
export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Check if user has already consented
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  /** @returns {void} */
  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    window.dispatchEvent(new CustomEvent('cookieConsentChanged', { detail: 'accepted' }));
    setShowBanner(false);
  };

  /** @returns {void} */
  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    window.dispatchEvent(new CustomEvent('cookieConsentChanged', { detail: 'declined' }));
    setShowBanner(false);
  };

  // Don't render on server or if banner shouldn't show
  if (!isClient || !showBanner) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed bottom-16 sm:bottom-0 left-0 right-0 z-[100] bg-white border-t-2 border-navy shadow-[0_-4px_20px_rgba(0,0,0,0.15)] animate-slide-up"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1 text-sm sm:text-base text-gray-700">
            <p className="mb-2">
              <strong>We value your privacy.</strong> This website uses cookies to enhance your
              experience, analyze site traffic, and provide basic analytics.
            </p>
            <p className="text-xs sm:text-sm text-gray-700">
              By clicking "Accept", you consent to our use of cookies. Learn more in our{' '}
              <Link href="/privacy" className="text-navy underline hover:text-prosper-red">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0">
            <button
              onClick={handleDecline}
              className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-colors min-h-[44px] sm:min-h-[48px]"
              aria-label="Decline cookies"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="px-6 py-2.5 bg-navy text-white rounded-lg font-semibold hover:bg-navy/90 transition-colors min-h-[44px] sm:min-h-[48px]"
              aria-label="Accept cookies"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
