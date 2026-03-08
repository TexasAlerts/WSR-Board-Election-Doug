'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const FB_PIXEL_ID = '101306642490599';

/**
 * Facebook Pixel with consent gating and SPA route tracking.
 *
 * - Loads the pixel script immediately but revokes consent by default
 * - Grants consent only when cookieConsent === 'accepted' in localStorage
 * - Tracks PageView on initial load (if consented) and on every route change
 * - Listens for consent changes via a custom 'cookieConsentChanged' event
 *
 * @returns {null}
 */
export default function FacebookPixel() {
  const pathname = usePathname();
  const initialized = useRef(false);
  const consented = useRef(false);

  // Initialize pixel script once (consent revoked by default)
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Load fbevents.js (Meta's standard snippet)
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);

    window.fbq = window.fbq || function () {
      (window.fbq.q = window.fbq.q || []).push(arguments);
    };
    window._fbq = window._fbq || window.fbq;
    window.fbq.push = window.fbq;
    window.fbq.loaded = true;
    window.fbq.version = '2.0';
    window.fbq.queue = window.fbq.queue || [];

    window.fbq('consent', 'revoke');
    window.fbq('init', FB_PIXEL_ID);

    // Check if user already consented
    if (localStorage.getItem('cookieConsent') === 'accepted') {
      window.fbq('consent', 'grant');
      window.fbq('track', 'PageView');
      consented.current = true;
    }
  }, []);

  // Listen for consent changes from CookieConsent component
  useEffect(() => {
    /** @param {CustomEvent} e */
    const handleConsentChange = (e) => {
      if (!window.fbq) return;
      if (e.detail === 'accepted') {
        window.fbq('consent', 'grant');
        window.fbq('track', 'PageView');
        consented.current = true;
      } else {
        window.fbq('consent', 'revoke');
        consented.current = false;
      }
    };

    window.addEventListener('cookieConsentChanged', handleConsentChange);
    return () => window.removeEventListener('cookieConsentChanged', handleConsentChange);
  }, []);

  // Track PageView on SPA route changes
  useEffect(() => {
    if (!consented.current || !window.fbq) return;
    window.fbq('track', 'PageView');
  }, [pathname]);

  return null;
}
