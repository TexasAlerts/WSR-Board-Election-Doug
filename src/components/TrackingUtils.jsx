'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid'];

/**
 * Captures UTM parameters and fbclid from the URL into sessionStorage
 * on initial page load. Preserves attribution across SPA navigations.
 *
 * @returns {null}
 */
export default function TrackingUtils() {
  const searchParams = useSearchParams();

  // Capture UTM params and fbclid on landing
  useEffect(() => {
    if (!searchParams) return;

    // Only capture on initial landing (don't overwrite during session)
    if (sessionStorage.getItem('utm_captured')) return;

    let captured = false;
    for (const key of UTM_KEYS) {
      const value = searchParams.get(key);
      if (value) {
        sessionStorage.setItem(key, value);
        captured = true;
      }
    }

    if (captured) {
      sessionStorage.setItem('utm_captured', '1');
      sessionStorage.setItem('landing_page', window.location.pathname);
    }
  }, [searchParams]);

  // Track Contact event on mailto link clicks
  useEffect(() => {
    /** @param {MouseEvent} e */
    const handleClick = (e) => {
      const anchor = e.target.closest('a[href^="mailto:"]');
      if (anchor) {
        trackFbEvent('Contact', { content_name: 'email' });
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return null;
}

/**
 * Get stored UTM parameters for inclusion in form submissions.
 * @returns {Record<string, string>}
 */
export function getUtmParams() {
  const params = {};
  for (const key of UTM_KEYS) {
    const value = sessionStorage.getItem(key);
    if (value) params[key] = value;
  }
  const landing = sessionStorage.getItem('landing_page');
  if (landing) params.landing_page = landing;
  return params;
}

/**
 * Fire a Facebook Pixel event (consent-gated).
 * Only fires if consent has been granted.
 *
 * @param {string} eventName - Standard FB event name (Lead, Contact, etc.)
 * @param {Record<string, unknown>} [params] - Optional event parameters
 * @returns {void}
 */
export function trackFbEvent(eventName, params) {
  if (typeof window === 'undefined' || !window.fbq) return;
  if (localStorage.getItem('cookieConsent') !== 'accepted') return;
  if (params) {
    window.fbq('track', eventName, params);
  } else {
    window.fbq('track', eventName);
  }
}
