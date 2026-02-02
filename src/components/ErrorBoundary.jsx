"use client";

import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to the error logging API
    this.logError(error, errorInfo);
  }

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
        <div className="min-h-[50vh] flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold text-navy mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-6">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="bg-navy text-white px-6 py-3 rounded-lg font-semibold hover:bg-navy-light transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
