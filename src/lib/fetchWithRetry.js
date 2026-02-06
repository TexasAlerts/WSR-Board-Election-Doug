/**
 * Enhanced fetch wrapper with retry logic, network detection, and error context
 */

/**
 * Get network connection info if available
 */
export function getNetworkInfo() {
  if (typeof navigator === 'undefined') {
    return { type: 'unknown', effectiveType: 'unknown', downlink: null, rtt: null };
  }

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

  if (!connection) {
    return { type: 'unknown', effectiveType: 'unknown', downlink: null, rtt: null };
  }

  return {
    type: connection.type || 'unknown',
    effectiveType: connection.effectiveType || 'unknown',
    downlink: connection.downlink || null,
    rtt: connection.rtt || null,
    saveData: connection.saveData || false,
  };
}

/**
 * Check if the browser is online
 */
export function isOnline() {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

/**
 * Sleep for a specified duration
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff delay
 */
function getBackoffDelay(attempt, baseDelay = 1000, maxDelay = 10000) {
  const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  // Add jitter to prevent thundering herd
  return delay + Math.random() * 500;
}

/**
 * Fetch with automatic retry, timeout, and enhanced error context
 *
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options plus retry configuration
 * @param {number} options.timeout - Request timeout in ms (default: 10000)
 * @param {number} options.retries - Number of retries (default: 2)
 * @param {number} options.retryDelay - Base delay between retries in ms (default: 1000)
 * @param {boolean} options.retryOnNetworkError - Retry on network errors (default: true)
 * @param {Function} options.onRetry - Callback when retrying (attempt, error) => void
 * @returns {Promise<Response>}
 */
export async function fetchWithRetry(url, options = {}) {
  const {
    timeout = 10000,
    retries = 2,
    retryDelay = 1000,
    retryOnNetworkError = true,
    onRetry,
    ...fetchOptions
  } = options;

  let lastError;
  const startTime = Date.now();

  for (let attempt = 0; attempt <= retries; attempt++) {
    // Check if offline before attempting
    if (!isOnline()) {
      const offlineError = new Error('No internet connection');
      offlineError.name = 'OfflineError';
      offlineError.context = {
        url,
        attempt,
        networkInfo: getNetworkInfo(),
        isOnline: false,
      };
      throw offlineError;
    }

    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Don't retry on client errors (4xx) except 429 (rate limit)
      if (!response.ok && response.status !== 429 && response.status >= 400 && response.status < 500) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        error.name = 'HTTPError';
        error.status = response.status;
        error.response = response;
        error.context = {
          url,
          attempt,
          duration: Date.now() - startTime,
          networkInfo: getNetworkInfo(),
        };
        throw error;
      }

      // Retry on server errors (5xx) or rate limiting (429)
      if (!response.ok && (response.status >= 500 || response.status === 429)) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        error.name = 'HTTPError';
        error.status = response.status;
        error.retryable = true;
        lastError = error;

        if (attempt < retries) {
          const delay = getBackoffDelay(attempt, retryDelay);
          if (onRetry) onRetry(attempt + 1, error);
          await sleep(delay);
          continue;
        }
      }

      // Add timing info to successful response
      response.timing = {
        duration: Date.now() - startTime,
        attempts: attempt + 1,
      };

      return response;
    } catch (error) {
      lastError = error;

      // Enhance error with context
      error.context = {
        url,
        attempt: attempt + 1,
        totalAttempts: retries + 1,
        duration: Date.now() - startTime,
        networkInfo: getNetworkInfo(),
        isOnline: isOnline(),
      };

      // Handle abort (timeout)
      if (error.name === 'AbortError') {
        error.name = 'TimeoutError';
        error.message = `Request timed out after ${timeout}ms`;
      }

      // Check if we should retry
      const isNetworkError =
        error.name === 'TypeError' ||
        error.name === 'TimeoutError' ||
        error.message?.includes('Failed to fetch') ||
        error.message?.includes('NetworkError') ||
        error.message?.includes('Load failed');

      const shouldRetry = retryOnNetworkError && isNetworkError && attempt < retries;

      if (shouldRetry) {
        const delay = getBackoffDelay(attempt, retryDelay);
        if (onRetry) onRetry(attempt + 1, error);
        await sleep(delay);
        continue;
      }

      throw error;
    }
  }

  // Should not reach here, but just in case
  throw lastError;
}

/**
 * Wrapper for JSON API calls with automatic parsing
 */
export async function fetchJSON(url, options = {}) {
  const response = await fetchWithRetry(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();

  return {
    data,
    status: response.status,
    ok: response.ok,
    timing: response.timing,
  };
}

/**
 * POST JSON data with retry
 */
export async function postJSON(url, body, options = {}) {
  return fetchJSON(url, {
    method: 'POST',
    body: JSON.stringify(body),
    ...options,
  });
}
