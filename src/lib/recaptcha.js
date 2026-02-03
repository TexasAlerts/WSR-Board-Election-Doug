/**
 * reCAPTCHA v3 Utility Functions
 * Provides server-side verification for Google reCAPTCHA v3
 */

/**
 * Verify reCAPTCHA token on the server side
 * @param {string} token - The reCAPTCHA token from the client
 * @param {string} action - The action name (e.g., 'submit_idea', 'endorse', 'question')
 * @returns {Promise<{success: boolean, score?: number, error?: string}>}
 */
export async function verifyCaptcha(token, action) {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    // In development, you might want to skip verification
    if (process.env.NODE_ENV === 'development') {
      return { success: true, score: 1.0 };
    }
    return { success: false, error: 'reCAPTCHA secret key not configured' };
  }

  if (!token) {
    return { success: false, error: 'No reCAPTCHA token provided' };
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    });

    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        error: 'reCAPTCHA verification failed',
        errorCodes: data['error-codes'],
      };
    }

    // Check if the action matches
    if (data.action !== action) {
      return {
        success: false,
        error: 'Action mismatch',
      };
    }

    // reCAPTCHA v3 returns a score from 0.0 to 1.0
    // 1.0 is very likely a good interaction, 0.0 is very likely a bot
    // You can adjust the threshold based on your needs
    const threshold = parseFloat(process.env.RECAPTCHA_SCORE_THRESHOLD || '0.5');

    if (data.score < threshold) {
      return {
        success: false,
        score: data.score,
        error: 'Score below threshold',
      };
    }

    return {
      success: true,
      score: data.score,
    };
  } catch (error) {
    return {
      success: false,
      error: 'reCAPTCHA verification request failed',
    };
  }
}

/**
 * Middleware to check rate limits and trigger CAPTCHA requirement
 * @param {Request} req - The request object
 * @returns {boolean} Whether CAPTCHA is required
 */
export function shouldRequireCaptcha(req) {
  // For now, always require CAPTCHA for public forms
  // You could implement more sophisticated rate limiting here
  return true;
}
