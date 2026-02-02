"use client";

import { useEffect } from 'react';

/**
 * GlobalErrorHandler
 *
 * Catches all unhandled errors and promise rejections
 * and logs them to the error_logs table.
 *
 * This should be included in the root layout to catch all client-side errors.
 */
export default function GlobalErrorHandler() {
  useEffect(() => {
    // Catch unhandled promise rejections
    const handleUnhandledRejection = (event) => {
      const error = event.reason;

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

    // Catch global JavaScript errors
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
