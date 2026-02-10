/**
 * Client-side error logging utility
 * Sends errors to the server for admin dashboard tracking and superuser notifications
 */

import { getNetworkInfo, isOnline } from './fetchWithRetry';

/**
 * Get browser and environment info
 */
function getBrowserContext() {
  if (typeof window === 'undefined') return {};

  const context = {
    url: window.location.href,
    pathname: window.location.pathname,
    referrer: document.referrer || null,
    screenWidth: window.screen?.width,
    screenHeight: window.screen?.height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio,
    language: navigator.language,
    cookiesEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack === '1',
    isOnline: isOnline(),
    networkInfo: getNetworkInfo(),
  };

  // Page visibility
  context.pageVisible = document.visibilityState === 'visible';

  // Time on page
  if (window.performance?.timing?.navigationStart) {
    context.timeOnPage = Math.round(Date.now() - window.performance.timing.navigationStart);
  }

  // Memory info (Chrome only)
  if (window.performance?.memory) {
    context.memoryUsed = Math.round(window.performance.memory.usedJSHeapSize / 1048576); // MB
    context.memoryTotal = Math.round(window.performance.memory.totalJSHeapSize / 1048576); // MB
  }

  return context;
}

/**
 * Get performance metrics if available
 */
function getPerformanceMetrics() {
  if (typeof window === 'undefined' || !window.performance) return null;

  const metrics = {};

  // Navigation timing
  const timing = window.performance.timing;
  if (timing) {
    metrics.pageLoadTime = timing.loadEventEnd - timing.navigationStart;
    metrics.domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
    metrics.firstByte = timing.responseStart - timing.navigationStart;
  }

  // Core Web Vitals (if available via PerformanceObserver)
  const entries = window.performance.getEntriesByType?.('paint') || [];
  entries.forEach((entry) => {
    if (entry.name === 'first-contentful-paint') {
      metrics.fcp = Math.round(entry.startTime);
    }
  });

  return Object.keys(metrics).length > 0 ? metrics : null;
}

/**
 * Log an error from the client side
 * @param {Object} params
 * @param {string} params.errorType - Type of error (client_error, validation_error, api_error)
 * @param {string} params.errorMessage - Human-readable error message
 * @param {string} [params.errorStack] - Stack trace if available
 * @param {string} [params.endpoint] - API endpoint or page where error occurred
 * @param {string} [params.component] - React component where error occurred
 * @param {Object} [params.context] - Additional context (user action, form data, etc.)
 * @param {Object} [params.networkContext] - Network/retry context from fetchWithRetry
 */
export async function logClientError({
  errorType,
  errorMessage,
  errorStack = null,
  endpoint = null,
  component = null,
  context = null,
  networkContext = null,
}) {
  try {
    // Don't log in development to avoid spam
    if (process.env.NODE_ENV === 'development') {
      console.error('[DEV] Client Error:', { errorType, errorMessage, component, context });
      return;
    }

    // Gather comprehensive context
    const browserContext = getBrowserContext();
    const performanceMetrics = getPerformanceMetrics();

    const enrichedContext = {
      ...browserContext,
      ...(context || {}),
      ...(networkContext || {}),
      performanceMetrics,
      timestamp: new Date().toISOString(),
    };

    await fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error_type: errorType,
        error_message: errorMessage,
        error_stack: errorStack,
        endpoint: endpoint || window.location.pathname,
        context: JSON.stringify(enrichedContext),
        component,
      }),
    });
  } catch (err) {
    // Silently fail - don't block the UI or create infinite error loops
    console.error('Failed to log error to server:', err);
  }
}

/**
 * Log a validation error from a form
 */
export async function logValidationError(formName, fieldName, errorMessage, context = {}) {
  return logClientError({
    errorType: 'validation_error',
    errorMessage: `${formName} - ${fieldName}: ${errorMessage}`,
    component: formName,
    context: {
      ...context,
      field: fieldName,
    },
  });
}

/**
 * Log an API error response with network context
 */
export async function logApiError(
  endpoint,
  method,
  statusCode,
  errorMessage,
  requestData = null,
  networkContext = null
) {
  return logClientError({
    errorType: 'api_error',
    errorMessage: `API Error: ${method} ${endpoint} - ${statusCode}: ${errorMessage}`,
    endpoint,
    context: {
      method,
      statusCode,
      requestData: requestData ? sanitizeRequestData(requestData) : null,
    },
    networkContext,
  });
}

/**
 * Log a React component error
 */
export async function logComponentError(componentName, errorMessage, errorStack, componentStack) {
  return logClientError({
    errorType: 'client_error',
    errorMessage: `React Error in ${componentName}: ${errorMessage}`,
    errorStack,
    component: componentName,
    context: {
      componentStack: componentStack?.substring(0, 500), // Limit size
    },
  });
}

/**
 * Sanitize request data to remove sensitive fields
 */
function sanitizeRequestData(data) {
  if (!data || typeof data !== 'object') return data;

  const sanitized = { ...data };
  const sensitiveFields = [
    'password',
    'confirmPassword',
    'token',
    'code',
    'secret',
    'ssn',
    'credit_card',
  ];

  sensitiveFields.forEach((field) => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });

  return sanitized;
}

/**
 * Log a network/fetch error with full context
 */
export async function logNetworkError(url, error, retryAttempts = 0) {
  return logClientError({
    errorType: 'network_error',
    errorMessage: `Network Error: ${error.name || 'Unknown'} - ${error.message}`,
    errorStack: error.stack,
    endpoint: url,
    networkContext: {
      errorName: error.name,
      retryAttempts,
      ...error.context,
    },
  });
}

/**
 * Setup global error handlers
 * Call this once in the root layout
 */
export function setupGlobalErrorHandlers() {
  // Catch unhandled promise rejections
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      // Build detailed error info for better debugging
      let errorMessage = 'Unknown rejection reason';
      let errorStack = null;
      let reasonType = 'unknown';

      if (event.reason === undefined) {
        errorMessage = 'Promise rejected with undefined (no error provided)';
        reasonType = 'undefined';
      } else if (event.reason === null) {
        errorMessage = 'Promise rejected with null';
        reasonType = 'null';
      } else if (typeof event.reason === 'string') {
        errorMessage = event.reason;
        reasonType = 'string';
      } else if (event.reason instanceof Error) {
        errorMessage = event.reason.message || 'Error with no message';
        errorStack = event.reason.stack;
        reasonType = event.reason.name || 'Error';
      } else if (typeof event.reason === 'object') {
        // Try to extract useful info from object
        errorMessage = event.reason.message || event.reason.error || JSON.stringify(event.reason).substring(0, 500);
        errorStack = event.reason.stack;
        reasonType = 'object';
      } else {
        errorMessage = String(event.reason);
        reasonType = typeof event.reason;
      }

      // Filter out known third-party/browser errors we can't control
      const ignoredPatterns = [
        'performanceMetrics', // Vercel Speed Insights on privacy browsers
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
        'feature named', // Vercel Speed Insights missing features
      ];

      if (ignoredPatterns.some((pattern) => errorMessage.includes(pattern))) {
        // Don't log these - they're from third-party code or browser issues
        return;
      }

      // Extract network context if available
      const networkContext = event.reason?.context || null;

      // Try to get call stack from Error.stack if we don't have one
      if (!errorStack && reasonType === 'undefined') {
        try {
          // Create an error to capture the current stack trace
          const stackError = new Error('Stack trace capture');
          errorStack = stackError.stack?.split('\n').slice(2).join('\n'); // Remove first 2 lines
        } catch {
          // Ignore
        }
      }

      logClientError({
        errorType: 'client_error',
        errorMessage: `Unhandled Promise Rejection: ${errorMessage}`,
        errorStack,
        context: {
          promiseRejection: true,
          reasonType,
          reasonUndefined: event.reason === undefined,
          // Include any custom properties from the rejection
          ...(event.reason && typeof event.reason === 'object' ? {
            reasonKeys: Object.keys(event.reason).slice(0, 10),
          } : {}),
        },
        networkContext,
      });
    });

    // Catch global JavaScript errors
    window.addEventListener('error', (event) => {
      // Don't log React errors here - ErrorBoundary will handle those
      if (event.message?.includes('React')) return;

      logClientError({
        errorType: 'client_error',
        errorMessage: event.message || 'Unknown error',
        errorStack: event.error?.stack,
        endpoint: event.filename,
        context: {
          line: event.lineno,
          column: event.colno,
        },
      });
    });

    // Listen for online/offline events
    window.addEventListener('online', () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Network] Connection restored');
      }
    });

    window.addEventListener('offline', () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Network] Connection lost');
      }
    });
  }
}
