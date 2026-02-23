'use client';

import { useEffect } from 'react';

/**
 * GlobalErrorHandler Component
 *
 * Sets up global error handlers for the entire application.
 * Catches and logs unhandled errors and promise rejections.
 *
 * This component should be included once in the root layout to ensure
 * all client-side errors are captured and logged to the server.
 *
 * @example
 * // In app/layout.tsx
 * <html>
 *   <body>
 *     <GlobalErrorHandler />
 *     {children}
 *   </body>
 * </html>
 *
 * Features:
 * - Catches unhandled promise rejections (e.g., failed API calls)
 * - Catches global JavaScript errors (window.onerror)
 * - Logs all errors to /api/errors endpoint
 * - Prevents error logging loops with silent failures
 * - Includes context: URL, user agent, stack trace
 * - Cleans up event listeners on unmount
 *
 * Error Types Caught:
 * - UNHANDLED_PROMISE_REJECTION - Failed promises without .catch()
 * - GLOBAL_ERROR - Uncaught JavaScript exceptions
 *
 * @returns {null} This component doesn't render any UI
 */
export default function GlobalErrorHandler() {
  useEffect(() => {
    /**
     * Handle unhandled promise rejections
     *
     * Catches promises that reject without a .catch() handler.
     * Common causes:
     * - Failed fetch() calls without error handling
     * - async functions that throw without try/catch
     * - Promise.all() failures
     *
     * @param {PromiseRejectionEvent} event - The promise rejection event
     * @param {Error|*} event.reason - The rejection reason (usually an Error)
     */
    const handleUnhandledRejection = (event) => {
      const error = event.reason;

      // Safari commonly rejects with undefined on network failures - not actionable
      if (error === undefined || error === null) {
        event.preventDefault();
        return;
      }

      const errorMessage = error?.message || String(error);

      // Filter out known third-party/browser errors we can't control
      const ignoredPatterns = [
        'performanceMetrics', // Vercel Speed Insights on privacy browsers
        'feature named', // Vercel Speed Insights missing features
        'Timeout', // Generic network timeouts
        'ResizeObserver', // Chrome layout bug
        'Script error', // Cross-origin script errors
        'Load failed', // Network failures
        'NetworkError', // Network failures
        'AbortError', // User navigated away
        'ChunkLoadError', // Webpack chunk loading
        'recaptcha', // reCAPTCHA issues
        'grecaptcha', // reCAPTCHA issues
        'runtime.sendMessage', // Browser extension errors
        'Extension context', // Browser extension errors
        'message channel closed', // Browser extension errors
        'Tab not found', // Browser extension errors
      ];

      if (ignoredPatterns.some((pattern) => errorMessage.includes(pattern))) {
        // Don't log these - they're from third-party code or network issues
        event.preventDefault();
        return;
      }

      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Unhandled Promise Rejection: ${error?.message || String(error)}`,
          stack: error?.stack || '',
          component: 'Global Promise Handler',
          url: window.location.href,
          userAgent: navigator.userAgent,
          errorType: 'UNHANDLED_PROMISE_REJECTION',
        }),
      }).catch(() => {
        // Silent fail to avoid error loops
      });

      // Prevent the default browser error console
      event.preventDefault();
    };

    /**
     * Handle global JavaScript errors
     *
     * Catches uncaught exceptions that bubble to window.onerror.
     * Common causes:
     * - Syntax errors
     * - Reference errors (undefined variables)
     * - Type errors
     * - Third-party script errors
     *
     * @param {ErrorEvent} event - The error event
     * @param {string} event.message - Error message
     * @param {string} event.filename - File where error occurred
     * @param {number} event.lineno - Line number
     * @param {number} event.colno - Column number
     * @param {Error} event.error - Error object with stack trace
     */
    const handleError = (event) => {
      const { message, filename, lineno, colno, error } = event;

      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Global Error: ${message}`,
          stack: error?.stack || `${filename}:${lineno}:${colno}`,
          component: filename || 'Unknown',
          url: window.location.href,
          userAgent: navigator.userAgent,
          errorType: 'GLOBAL_ERROR',
        }),
      }).catch(() => {
        // Silent fail
      });

      // Prevent the default browser error console
      event.preventDefault();
    };

    // Add event listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  // This component doesn't render anything
  return null;
}
