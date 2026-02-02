/**
 * Client-side error logging utility
 * Sends errors to the server for admin dashboard tracking and superuser notifications
 */

/**
 * Log an error from the client side
 * @param {Object} params
 * @param {string} params.errorType - Type of error (client_error, validation_error, api_error)
 * @param {string} params.errorMessage - Human-readable error message
 * @param {string} [params.errorStack] - Stack trace if available
 * @param {string} [params.endpoint] - API endpoint or page where error occurred
 * @param {string} [params.component] - React component where error occurred
 * @param {Object} [params.context] - Additional context (user action, form data, etc.)
 */
export async function logClientError({
  errorType,
  errorMessage,
  errorStack = null,
  endpoint = null,
  component = null,
  context = null,
}) {
  try {
    // Don't log in development to avoid spam
    if (process.env.NODE_ENV === 'development') {
      console.error('[DEV] Client Error:', { errorType, errorMessage, component, context });
      return;
    }

    await fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error_type: errorType,
        error_message: errorMessage,
        error_stack: errorStack,
        endpoint: endpoint || window.location.pathname,
        context: context ? JSON.stringify(context) : null,
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
 * Log an API error response
 */
export async function logApiError(endpoint, method, statusCode, errorMessage, requestData = null) {
  return logClientError({
    errorType: 'api_error',
    errorMessage: `API Error: ${method} ${endpoint} - ${statusCode}: ${errorMessage}`,
    endpoint,
    context: {
      method,
      statusCode,
      requestData: requestData ? sanitizeRequestData(requestData) : null,
    },
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
  const sensitiveFields = ['password', 'confirmPassword', 'token', 'code', 'secret', 'ssn', 'credit_card'];

  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });

  return sanitized;
}

/**
 * Setup global error handlers
 * Call this once in the root layout
 */
export function setupGlobalErrorHandlers() {
  // Catch unhandled promise rejections
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      logClientError({
        errorType: 'client_error',
        errorMessage: `Unhandled Promise Rejection: ${event.reason?.message || event.reason}`,
        errorStack: event.reason?.stack,
        context: {
          promiseRejection: true,
        },
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
  }
}
