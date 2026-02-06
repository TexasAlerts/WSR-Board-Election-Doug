'use client';

import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

/**
 * reCAPTCHA Provider Component
 * Wraps the application with Google reCAPTCHA v3 context
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {React.ReactNode}
 */
export default function RecaptchaProvider({ children }) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  // If no site key is configured, render children without reCAPTCHA
  // This allows development without requiring reCAPTCHA setup
  if (!siteKey) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[reCAPTCHA] No site key configured - reCAPTCHA protection disabled');
    }
    return children;
  }

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={siteKey}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: 'head',
      }}
    >
      {children}
    </GoogleReCaptchaProvider>
  );
}
