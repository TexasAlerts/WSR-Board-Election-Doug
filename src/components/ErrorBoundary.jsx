/**
 * React Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors to the server, and displays a fallback UI.
 *
 * @example
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 *
 * Features:
 * - Catches React rendering errors
 * - Logs errors to /api/errors endpoint
 * - Displays user-friendly fallback UI
 * - Allows user to reset error state
 * - Prevents app crash from propagating
 */

'use client';

import { Component } from 'react';

/**
 * ErrorBoundary class component
 *
 * @class
 * @extends {Component}
 *
 * @property {Object} state - Component state
 * @property {boolean} state.hasError - Whether an error has been caught
 * @property {Error|null} state.error - The caught error object
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  /**
   * React lifecycle method called when an error is thrown
   *
   * @param {Error} error - The error that was thrown
   * @returns {Object} New state with hasError set to true
   */
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  /**
   * React lifecycle method called after an error has been thrown
   * Logs the error to the server for tracking
   *
   * @param {Error} error - The error that was thrown
   * @param {Object} errorInfo - React error info with component stack
   */
  componentDidCatch(error, errorInfo) {
    // Log error to the error logging API
    this.logError(error, errorInfo);
  }

  /**
   * Log the error to the server via /api/errors endpoint
   *
   * Sends error details including:
   * - Error message and stack trace
   * - Component stack from React
   * - Current URL and pathname
   *
   * Silently fails if logging fails to prevent error loops.
   *
   * @param {Error} error - The error that was thrown
   * @param {Object} errorInfo - React error info
   * @param {string} errorInfo.componentStack - Component stack trace
   */
  async logError(error, errorInfo) {
    try {
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error_type: 'client_error',
          error_message: `React Error: ${error.message}`,
          error_stack: error.stack,
          endpoint: typeof window !== 'undefined' ? window.location.pathname : '',
          context: JSON.stringify({
            componentStack: errorInfo?.componentStack?.substring(0, 500),
            url: typeof window !== 'undefined' ? window.location.href : '',
          }),
        }),
      });
    } catch (logError) {
      // Silently fail
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-[50vh] flex items-center justify-center px-4"
          role="alert"
          aria-live="assertive"
        >
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold text-navy mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-6">
              We're sorry, but something unexpected happened. You can try again without
              losing your work, or refresh the page.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                }}
                className="bg-navy text-white px-6 py-3 min-h-[44px] rounded-lg font-semibold hover:bg-navy-light transition-colors"
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={() => {
                  window.location.reload();
                }}
                className="bg-gray-200 text-gray-700 px-6 py-3 min-h-[44px] rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Refresh Page
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left text-sm text-gray-700">
                <summary className="cursor-pointer">Error Details</summary>
                <pre className="mt-2 p-3 bg-gray-100 rounded overflow-auto max-h-40 text-xs">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
