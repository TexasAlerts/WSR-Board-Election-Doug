'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to manage CSRF tokens for API requests.
 * Fetches a token on mount and provides a refresh function.
 *
 * @returns {{ token: string, refreshToken: () => Promise<void>, isLoading: boolean }}
 *
 * @example
 * const { token, refreshToken, isLoading } = useCSRF();
 *
 * const handleSubmit = async () => {
 *   const response = await fetch('/api/endpoint', {
 *     method: 'POST',
 *     headers: {
 *       'Content-Type': 'application/json',
 *       'x-csrf-token': token,
 *     },
 *     body: JSON.stringify(data),
 *   });
 *   // Refresh token after use for next request
 *   await refreshToken();
 * };
 */
export function useCSRF() {
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchToken = useCallback(async () => {
    try {
      const response = await fetch('/api/csrf');
      if (response.ok) {
        const data = await response.json();
        setToken(data.csrfToken || '');
      }
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  const refreshToken = useCallback(async () => {
    setIsLoading(true);
    await fetchToken();
  }, [fetchToken]);

  return { token, refreshToken, isLoading };
}

/**
 * Helper to create fetch options with CSRF token.
 *
 * @param {string} token - CSRF token
 * @param {RequestInit} options - Additional fetch options
 * @returns {RequestInit} Fetch options with CSRF header
 */
export function withCSRFHeader(token, options = {}) {
  return {
    ...options,
    headers: {
      ...options.headers,
      'x-csrf-token': token,
    },
  };
}
