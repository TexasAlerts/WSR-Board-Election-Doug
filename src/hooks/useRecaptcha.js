'use client';

import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { useCallback } from 'react';

/**
 * Custom hook for reCAPTCHA v3
 * Provides a simple interface to execute reCAPTCHA and get tokens
 */
export function useRecaptcha() {
  const { executeRecaptcha } = useGoogleReCaptcha();

  /**
   * Execute reCAPTCHA and get a token
   * @param {string} action - The action name (e.g., 'submit_idea', 'endorse')
   * @returns {Promise<string|null>} The reCAPTCHA token or null if failed
   */
  const getToken = useCallback(
    async (action) => {
      if (!executeRecaptcha) {
        // reCAPTCHA not loaded yet or not configured
        return null;
      }

      try {
        const token = await executeRecaptcha(action);
        return token;
      } catch (error) {
        return null;
      }
    },
    [executeRecaptcha]
  );

  return {
    getToken,
    isReady: !!executeRecaptcha,
  };
}
