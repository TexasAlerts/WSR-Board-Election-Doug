'use client';

import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import type { ReactNode } from 'react';

interface RecaptchaProviderProps {
  children: ReactNode;
}

/**
 * reCAPTCHA Provider Component
 * Wraps the application with Google reCAPTCHA v3 context
 */
export default function RecaptchaProvider({ children }: RecaptchaProviderProps): ReactNode {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  // DEBUG: Log environment variable status (REMOVE AFTER TESTING)
  if (typeof window !== 'undefined') {
    console.log('[reCAPTCHA] Site key status:', siteKey ? 'FOUND' : 'NOT FOUND');
    console.log('[reCAPTCHA] Site key value:', siteKey ? `${siteKey.substring(0, 10)}...` : 'undefined');
  }

  // If no site key is configured, render children without reCAPTCHA
  // This allows development without requiring reCAPTCHA setup
  if (!siteKey) {
    console.warn('[reCAPTCHA] No site key configured - reCAPTCHA protection disabled');
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
