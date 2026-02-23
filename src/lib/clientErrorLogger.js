/**
 * Client-side error logging utility
 *
 * Sends errors to the server for admin dashboard tracking and superuser notifications.
 * Captures comprehensive performance and visitor experience context.
 *
 * Features:
 * - Core Web Vitals (LCP, FID, CLS, FCP, TTFB, INP)
 * - Navigation and resource timing
 * - Memory usage (Chrome)
 * - Network conditions
 * - Visitor journey context
 * - User interaction history
 * - Viewport and device info
 */

import { getNetworkInfo, isOnline } from './fetchWithRetry';

// Store Web Vitals as they're collected
const webVitals = {
  lcp: null,  // Largest Contentful Paint
  fid: null,  // First Input Delay
  cls: null,  // Cumulative Layout Shift
  fcp: null,  // First Contentful Paint
  ttfb: null, // Time to First Byte
  inp: null,  // Interaction to Next Paint
};

// Store recent user interactions for context
const recentInteractions = [];
const MAX_INTERACTIONS = 20;

// Store navigation history within the session
const navigationHistory = [];
const MAX_NAVIGATION_HISTORY = 10;

/**
 * Initialize Web Vitals collection using PerformanceObserver
 * Call this once when the app loads
 */
export function initWebVitalsCollection() {
  if (typeof window === 'undefined' || !window.PerformanceObserver) return;

  try {
    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      webVitals.lcp = Math.round(lastEntry.startTime);
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      if (entries.length > 0) {
        webVitals.fid = Math.round(entries[0].processingStart - entries[0].startTime);
      }
    });
    fidObserver.observe({ type: 'first-input', buffered: true });

    // Cumulative Layout Shift
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      webVitals.cls = Math.round(clsValue * 1000) / 1000; // 3 decimal places
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });

    // First Contentful Paint
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fcpEntry = entries.find((e) => e.name === 'first-contentful-paint');
      if (fcpEntry) {
        webVitals.fcp = Math.round(fcpEntry.startTime);
      }
    });
    fcpObserver.observe({ type: 'paint', buffered: true });

    // Interaction to Next Paint (INP)
    const inpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Track worst interaction
        if (webVitals.inp === null || entry.duration > webVitals.inp) {
          webVitals.inp = Math.round(entry.duration);
        }
      }
    });
    inpObserver.observe({ type: 'event', buffered: true, durationThreshold: 16 });

  } catch {
    // PerformanceObserver not fully supported
  }

  // Navigation timing for TTFB
  try {
    const navEntries = performance.getEntriesByType('navigation');
    if (navEntries.length > 0) {
      webVitals.ttfb = Math.round(navEntries[0].responseStart);
    }
  } catch {
    // Fallback for older browsers
    if (performance.timing) {
      webVitals.ttfb = performance.timing.responseStart - performance.timing.navigationStart;
    }
  }
}

/**
 * Track user interaction for context
 */
export function trackInteraction(type, target, details = {}) {
  if (typeof window === 'undefined') return;

  const interaction = {
    type,
    target: target?.substring?.(0, 100) || target,
    timestamp: Date.now(),
    timeOnPage: getTimeOnPage(),
    ...details,
  };

  recentInteractions.push(interaction);
  if (recentInteractions.length > MAX_INTERACTIONS) {
    recentInteractions.shift();
  }
}

/**
 * Track navigation for journey context
 */
export function trackNavigation(path, title) {
  if (typeof window === 'undefined') return;

  navigationHistory.push({
    path,
    title,
    timestamp: Date.now(),
    timeOnPage: getTimeOnPage(),
  });

  if (navigationHistory.length > MAX_NAVIGATION_HISTORY) {
    navigationHistory.shift();
  }
}

/**
 * Get time on page in milliseconds
 */
function getTimeOnPage() {
  if (typeof window === 'undefined') return 0;

  try {
    const navEntries = performance.getEntriesByType('navigation');
    if (navEntries.length > 0) {
      return Math.round(performance.now());
    }
  } catch {
    // Fallback
  }

  if (performance.timing?.navigationStart) {
    return Date.now() - performance.timing.navigationStart;
  }

  return 0;
}

/**
 * Get comprehensive browser and environment info
 */
function getBrowserContext() {
  if (typeof window === 'undefined') return {};

  const context = {
    // Page info
    url: window.location.href,
    pathname: window.location.pathname,
    search: window.location.search || null,
    hash: window.location.hash || null,
    referrer: document.referrer || null,
    title: document.title || null,

    // Viewport and screen
    screenWidth: window.screen?.width,
    screenHeight: window.screen?.height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio,
    colorDepth: window.screen?.colorDepth,
    orientation: window.screen?.orientation?.type || null,

    // Browser capabilities
    language: navigator.language,
    languages: navigator.languages?.slice(0, 3),
    cookiesEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack === '1',
    hardwareConcurrency: navigator.hardwareConcurrency || null,
    maxTouchPoints: navigator.maxTouchPoints || 0,

    // Network
    isOnline: isOnline(),
    networkInfo: getNetworkInfo(),

    // Page state
    pageVisible: document.visibilityState === 'visible',
    documentReadyState: document.readyState,
    timeOnPage: getTimeOnPage(),

    // Scroll position (helpful for understanding where user was)
    scrollX: Math.round(window.scrollX),
    scrollY: Math.round(window.scrollY),
    scrollHeight: document.documentElement.scrollHeight,
    scrollPercentage: Math.round(
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    ) || 0,
  };

  // Memory info (Chrome only)
  if (performance?.memory) {
    context.memory = {
      usedMB: Math.round(performance.memory.usedJSHeapSize / 1048576),
      totalMB: Math.round(performance.memory.totalJSHeapSize / 1048576),
      limitMB: Math.round(performance.memory.jsHeapSizeLimit / 1048576),
      usagePercent: Math.round(
        (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100
      ),
    };
  }

  // Storage usage
  try {
    if (navigator.storage?.estimate) {
      navigator.storage.estimate().then((estimate) => {
        context.storageUsage = {
          usedMB: Math.round((estimate.usage || 0) / 1048576),
          quotaMB: Math.round((estimate.quota || 0) / 1048576),
        };
      });
    }
  } catch {
    // Storage API not available
  }

  return context;
}

/**
 * Get comprehensive performance metrics
 */
function getPerformanceMetrics() {
  if (typeof window === 'undefined' || !window.performance) return null;

  const metrics = {
    // Core Web Vitals
    webVitals: { ...webVitals },
  };

  // Navigation timing (using modern API)
  try {
    const navEntries = performance.getEntriesByType('navigation');
    if (navEntries.length > 0) {
      const nav = navEntries[0];
      metrics.navigation = {
        type: nav.type, // navigate, reload, back_forward, prerender
        redirectCount: nav.redirectCount,
        domContentLoaded: Math.round(nav.domContentLoadedEventEnd),
        loadComplete: Math.round(nav.loadEventEnd),
        domInteractive: Math.round(nav.domInteractive),
        responseStart: Math.round(nav.responseStart),
        responseEnd: Math.round(nav.responseEnd),
        transferSize: nav.transferSize,
        encodedBodySize: nav.encodedBodySize,
        decodedBodySize: nav.decodedBodySize,
      };
    }
  } catch {
    // Fallback to legacy timing API
    if (performance.timing) {
      const timing = performance.timing;
      const start = timing.navigationStart;
      metrics.navigation = {
        pageLoadTime: timing.loadEventEnd - start,
        domContentLoaded: timing.domContentLoadedEventEnd - start,
        firstByte: timing.responseStart - start,
        domInteractive: timing.domInteractive - start,
      };
    }
  }

  // Resource timing summary (top slow resources)
  try {
    const resources = performance.getEntriesByType('resource');
    const slowResources = resources
      .filter((r) => r.duration > 500) // Resources taking > 500ms
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5)
      .map((r) => ({
        name: r.name.split('/').pop()?.substring(0, 50),
        type: r.initiatorType,
        duration: Math.round(r.duration),
        size: r.transferSize || 0,
      }));

    if (slowResources.length > 0) {
      metrics.slowResources = slowResources;
    }

    // Total resource stats
    metrics.resourceSummary = {
      totalCount: resources.length,
      totalTransferSize: resources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
      averageDuration: Math.round(
        resources.reduce((sum, r) => sum + r.duration, 0) / resources.length
      ),
    };
  } catch {
    // Resource timing not available
  }

  // Long tasks (if any were observed)
  try {
    const longTasks = performance.getEntriesByType('longtask');
    if (longTasks.length > 0) {
      metrics.longTasks = {
        count: longTasks.length,
        totalDuration: Math.round(longTasks.reduce((sum, t) => sum + t.duration, 0)),
        maxDuration: Math.round(Math.max(...longTasks.map((t) => t.duration))),
      };
    }
  } catch {
    // Long task API not available
  }

  return metrics;
}

/**
 * Get visitor journey context
 */
function getVisitorJourneyContext() {
  return {
    recentInteractions: [...recentInteractions].slice(-10),
    navigationHistory: [...navigationHistory].slice(-5),
    interactionCount: recentInteractions.length,
    pagesVisited: navigationHistory.length,
  };
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
 * @param {string} [params.severity] - Error severity (critical, high, medium, low)
 */
export async function logClientError({
  errorType,
  errorMessage,
  errorStack = null,
  endpoint = null,
  component = null,
  context = null,
  networkContext = null,
  severity = null,
}) {
  try {
    // Don't log in development to avoid spam
    if (process.env.NODE_ENV === 'development') {
      console.error('[DEV] Client Error:', { errorType, errorMessage, component, context });
      return;
    }

    // Gather comprehensive context
    const browserContext = getBrowserContext();
    let performanceMetrics = null;
    try {
      performanceMetrics = getPerformanceMetrics();
    } catch (perfError) {
      // Silently ignore Vercel Speed Insights errors on privacy browsers
      if (perfError?.message?.includes('performanceMetrics') || perfError?.message?.includes('feature named')) {
        // Known issue with Vercel Speed Insights
      }
    }
    const journeyContext = getVisitorJourneyContext();

    // Determine severity based on error type if not provided
    const errorSeverity = severity || determineSeverity(errorType, errorMessage);

    const enrichedContext = {
      // Browser and environment
      ...browserContext,

      // Custom context passed in
      ...(context || {}),

      // Network context (retries, timeouts, etc.)
      ...(networkContext || {}),

      // Performance data
      performance: performanceMetrics,

      // Visitor journey
      journey: journeyContext,

      // Metadata
      timestamp: new Date().toISOString(),
      clientTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      severity: errorSeverity,
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
        severity: errorSeverity,
      }),
    });
  } catch (err) {
    // Silently fail - don't block the UI or create infinite error loops
    console.error('Failed to log error to server:', err);
  }
}

/**
 * Determine error severity based on type and message
 */
function determineSeverity(errorType, errorMessage) {
  const message = (errorMessage || '').toLowerCase();

  // Critical: System-breaking errors
  if (
    message.includes('chunk') ||
    message.includes('hydration') ||
    message.includes('cannot read') ||
    message.includes('undefined is not')
  ) {
    return 'high';
  }

  // API errors are usually medium
  if (errorType === 'api_error') {
    if (message.includes('500') || message.includes('503')) return 'high';
    if (message.includes('401') || message.includes('403')) return 'medium';
    return 'medium';
  }

  // Network errors
  if (errorType === 'network_error') {
    return 'medium';
  }

  // Validation errors are usually low
  if (errorType === 'validation_error') {
    return 'low';
  }

  return 'medium';
}

/**
 * Log a validation error from a form
 */
export async function logValidationError(formName, fieldName, errorMessage, context = {}) {
  trackInteraction('validation_error', `${formName}.${fieldName}`, { errorMessage });

  return logClientError({
    errorType: 'validation_error',
    errorMessage: `${formName} - ${fieldName}: ${errorMessage}`,
    component: formName,
    context: {
      ...context,
      field: fieldName,
    },
    severity: 'low',
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
  trackInteraction('api_error', endpoint, { method, statusCode });

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
  trackInteraction('component_error', componentName, { errorMessage });

  return logClientError({
    errorType: 'client_error',
    errorMessage: `React Error in ${componentName}: ${errorMessage}`,
    errorStack,
    component: componentName,
    context: {
      componentStack: componentStack?.substring(0, 500), // Limit size
    },
    severity: 'high',
  });
}

/**
 * Log a slow API response (for performance monitoring)
 */
export async function logSlowApi(endpoint, method, durationMs, threshold = 3000) {
  if (durationMs < threshold) return;

  trackInteraction('slow_api', endpoint, { durationMs });

  return logClientError({
    errorType: 'performance',
    errorMessage: `Slow API: ${method} ${endpoint} took ${durationMs}ms (threshold: ${threshold}ms)`,
    endpoint,
    context: {
      durationMs,
      threshold,
      method,
    },
    severity: durationMs > 10000 ? 'high' : 'medium',
  });
}

/**
 * Log a performance issue (e.g., poor Web Vitals)
 */
export function logPerformanceIssue(metric, value, threshold, rating) {
  if (rating === 'good') return;

  return logClientError({
    errorType: 'performance',
    errorMessage: `Poor ${metric}: ${value} (threshold: ${threshold}, rating: ${rating})`,
    context: {
      metric,
      value,
      threshold,
      rating,
    },
    severity: rating === 'poor' ? 'medium' : 'low',
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
    'csrfToken',
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
  trackInteraction('network_error', url, { errorName: error.name, retryAttempts });

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
  if (typeof window === 'undefined') return;

  // Initialize Web Vitals collection
  initWebVitalsCollection();

  // Track navigation
  trackNavigation(window.location.pathname, document.title);

  // Track clicks for interaction context
  document.addEventListener(
    'click',
    (event) => {
      const target = event.target;
      const tagName = target?.tagName?.toLowerCase();
      const text = target?.textContent?.substring(0, 50) || '';
      const id = target?.id || '';
      const className = target?.className?.toString()?.substring(0, 50) || '';

      if (['button', 'a', 'input', 'select'].includes(tagName)) {
        trackInteraction('click', `${tagName}#${id || className}`, { text });
      }
    },
    { passive: true }
  );

  // Track form submissions
  document.addEventListener(
    'submit',
    (event) => {
      const form = event.target;
      trackInteraction('form_submit', form?.id || form?.name || 'unknown_form');
    },
    { passive: true }
  );

  // Track route changes (for SPA navigation)
  let lastPathname = window.location.pathname;
  const checkNavigation = () => {
    if (window.location.pathname !== lastPathname) {
      lastPathname = window.location.pathname;
      trackNavigation(lastPathname, document.title);
    }
  };
  window.addEventListener('popstate', checkNavigation);
  // Also check periodically for client-side navigation
  setInterval(checkNavigation, 1000);

  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    // Build detailed error info for better debugging
    let errorMessage = 'Unknown rejection reason';
    let errorStack = null;
    let reasonType = 'unknown';

    if (event.reason === undefined) {
      // Safari commonly rejects with undefined on network failures - not actionable
      return;
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
      // Use safe serialization to avoid circular reference errors
      let serialized = '[Object]';
      try {
        serialized = JSON.stringify(event.reason).substring(0, 500);
      } catch {
        // JSON.stringify can throw on circular objects
        try {
          // Try to extract object keys at least
          serialized = `[Object with keys: ${Object.keys(event.reason).join(', ')}]`;
        } catch {
          serialized = '[Object - unable to serialize]';
        }
      }
      errorMessage = event.reason.message || event.reason.error || serialized;
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
      return;
    }

    // Extract network context if available
    const networkContext = event.reason?.context || null;

    // Try to get call stack from Error.stack if we don't have one
    if (!errorStack && reasonType === 'undefined') {
      try {
        const stackError = new Error('Stack trace capture');
        errorStack = stackError.stack?.split('\n').slice(2).join('\n');
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
        ...(event.reason && typeof event.reason === 'object'
          ? {
              reasonKeys: Object.keys(event.reason).slice(0, 10),
            }
          : {}),
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
        errorType: event.error?.name,
      },
    });
  });

  // Track when page becomes hidden (user switches tab/minimizes)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      trackInteraction('page_hidden', window.location.pathname);
    } else {
      trackInteraction('page_visible', window.location.pathname);
    }
  });

  // Listen for online/offline events
  window.addEventListener('online', () => {
    trackInteraction('network_online', window.location.pathname);
    if (process.env.NODE_ENV === 'development') {
      console.log('[Network] Connection restored');
    }
  });

  window.addEventListener('offline', () => {
    trackInteraction('network_offline', window.location.pathname);
    if (process.env.NODE_ENV === 'development') {
      console.log('[Network] Connection lost');
    }
  });

  // Report poor Web Vitals after page load
  window.addEventListener('load', () => {
    // Wait for vitals to be collected
    setTimeout(() => {
      // LCP > 2.5s is poor
      if (webVitals.lcp && webVitals.lcp > 2500) {
        logPerformanceIssue(
          'LCP',
          webVitals.lcp,
          2500,
          webVitals.lcp > 4000 ? 'poor' : 'needs-improvement'
        );
      }

      // CLS > 0.1 is poor
      if (webVitals.cls && webVitals.cls > 0.1) {
        logPerformanceIssue(
          'CLS',
          webVitals.cls,
          0.1,
          webVitals.cls > 0.25 ? 'poor' : 'needs-improvement'
        );
      }

      // INP > 200ms is poor
      if (webVitals.inp && webVitals.inp > 200) {
        logPerformanceIssue(
          'INP',
          webVitals.inp,
          200,
          webVitals.inp > 500 ? 'poor' : 'needs-improvement'
        );
      }
    }, 5000);
  });
}
