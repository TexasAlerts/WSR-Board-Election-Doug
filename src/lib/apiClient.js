/**
 * API Client with automatic error logging
 *
 * This wrapper around fetch automatically logs all API errors to the error_logs table
 * and provides consistent error handling across the application.
 *
 * Usage:
 * import { apiCall } from '../lib/apiClient';
 *
 * const { ok, data, error } = await apiCall('/api/polls', { method: 'GET' });
 * if (ok) {
 *   // Handle success
 * } else {
 *   // Handle error (already logged)
 * }
 */

/**
 * Make an API call with automatic error logging
 * @param {string} url - The API endpoint URL
 * @param {RequestInit} options - Fetch options (method, headers, body, etc.)
 * @returns {Promise<{ok: boolean, data?: any, error?: string, status: number}>}
 */
export async function apiCall(url, options = {}) {
  const startTime = Date.now();

  try {
    const response = await fetch(url, options);
    const responseTime = Date.now() - startTime;

    // Try to parse JSON response
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      // If response isn't JSON, use text
      data = { error: await response.text() };
    }

    // Log failed API responses (4xx, 5xx)
    if (!response.ok) {
      // Only log to database if we're in the browser (avoid server-side logging loops)
      if (typeof window !== 'undefined') {
        try {
          await fetch('/api/errors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: `API Error: ${data.error || `HTTP ${response.status}`}`,
              component: 'API Client',
              action: `${options.method || 'GET'} ${url}`,
              url: window.location.href,
              statusCode: response.status,
              responseTime,
              errorDetails: data,
            }),
          }).catch(() => {
            // Silent fail on logging error to avoid infinite loops
          });
        } catch (logError) {
          // Silent fail
        }
      }

      return {
        ok: false,
        error: data.error || `Request failed with status ${response.status}`,
        status: response.status,
        data
      };
    }

    return { ok: true, data, status: response.status };

  } catch (error) {
    const responseTime = Date.now() - startTime;

    // Log network/fetch errors (connection failed, timeout, etc.)
    if (typeof window !== 'undefined') {
      try {
        await fetch('/api/errors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `Network Error: ${error.message}`,
            stack: error.stack || '',
            component: 'API Client',
            action: `${options.method || 'GET'} ${url}`,
            url: window.location.href,
            responseTime,
            errorType: 'NETWORK_ERROR',
          }),
        }).catch(() => {
          // Silent fail on logging error
        });
      } catch (logError) {
        // Silent fail
      }
    }

    return {
      ok: false,
      error: error.message || 'Network error occurred',
      status: 0
    };
  }
}

/**
 * Helper for GET requests
 */
export async function get(url) {
  return apiCall(url, { method: 'GET' });
}

/**
 * Helper for POST requests
 */
export async function post(url, body) {
  return apiCall(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

/**
 * Helper for PUT requests
 */
export async function put(url, body) {
  return apiCall(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

/**
 * Helper for DELETE requests
 */
export async function del(url) {
  return apiCall(url, { method: 'DELETE' });
}
