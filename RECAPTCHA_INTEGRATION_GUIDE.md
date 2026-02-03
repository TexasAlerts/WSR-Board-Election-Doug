# reCAPTCHA Integration Guide for Form Components

## Quick Reference

This guide shows how to add reCAPTCHA v3 to form components in the campaign website.

## Prerequisites

- reCAPTCHA is already set up in the root layout (`/src/app/layout.js`)
- Environment variables are configured (see `.env.example`)
- API routes are ready to accept `recaptchaToken` parameter

## Step-by-Step Integration

### 1. Import the Hook

Add the useRecaptcha hook to your component:

```javascript
import { useRecaptcha } from '../hooks/useRecaptcha';
```

### 2. Use the Hook in Your Component

```javascript
function MyFormComponent() {
  const { getToken, isReady } = useRecaptcha();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Your other state...
}
```

### 3. Add reCAPTCHA to Form Submit Handler

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    // Get reCAPTCHA token
    const recaptchaToken = await getToken('submit_my_form');

    // Submit with token
    const response = await fetch('/api/my-endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        recaptchaToken, // Include the token
      }),
    });

    const data = await response.json();

    if (data.ok) {
      // Success handling
    } else {
      // Error handling
    }
  } catch (error) {
    // Error handling
  } finally {
    setIsSubmitting(false);
  }
};
```

## Action Names

Use descriptive action names that match between client and server:

- `submit_idea` - For idea submissions
- `submit_endorsement` - For endorsements
- `submit_question` - For questions
- `submit_interest` - For volunteer/interest forms
- `submit_comment` - For comments
- `submit_poll_vote` - For poll votes

**Important:** The action name must match exactly between:
1. Client call: `getToken('submit_idea')`
2. Server verification: `verifyCaptcha(token, 'submit_idea')`

## Complete Example

Here's a complete example for a simple contact form:

```javascript
'use client';

import { useState } from 'react';
import { useRecaptcha } from '../hooks/useRecaptcha';

export default function ContactForm() {
  const { getToken, isReady } = useRecaptcha();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      // Get reCAPTCHA token
      const recaptchaToken = await getToken('submit_contact');

      // Submit form
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          recaptchaToken,
        }),
      });

      const data = await response.json();

      if (data.ok) {
        setStatus({
          type: 'success',
          message: 'Thank you! We will be in touch soon.',
        });
        // Reset form
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus({
          type: 'error',
          message: data.error || 'Something went wrong. Please try again.',
        });
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Network error. Please check your connection.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {status.message && (
        <div
          className={`p-4 rounded ${
            status.type === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {status.message}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-1">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={4}
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !isReady}
        className="w-full bg-navy text-white py-2 px-4 rounded font-semibold hover:bg-navy/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </button>

      <p className="text-xs text-gray-600 text-center">
        This site is protected by reCAPTCHA and the Google{' '}
        <a
          href="https://policies.google.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Privacy Policy
        </a>{' '}
        and{' '}
        <a
          href="https://policies.google.com/terms"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Terms of Service
        </a>{' '}
        apply.
      </p>
    </form>
  );
}
```

## Optional: Show reCAPTCHA Badge

If you want to show the reCAPTCHA badge (recommended for transparency):

```javascript
<p className="text-xs text-gray-600 text-center">
  This site is protected by reCAPTCHA and the Google{' '}
  <a
    href="https://policies.google.com/privacy"
    target="_blank"
    rel="noopener noreferrer"
    className="underline"
  >
    Privacy Policy
  </a>{' '}
  and{' '}
  <a
    href="https://policies.google.com/terms"
    target="_blank"
    rel="noopener noreferrer"
    className="underline"
  >
    Terms of Service
  </a>{' '}
  apply.
</p>
```

## Handling Errors

The API will return specific error messages:

```javascript
{
  ok: false,
  error: 'Security verification failed. Please try again.'
}
```

Show these to users in a user-friendly way:

```javascript
if (!data.ok) {
  if (data.error.includes('Security verification')) {
    setStatus({
      type: 'error',
      message: 'Security check failed. Please refresh and try again.',
    });
  } else {
    setStatus({
      type: 'error',
      message: data.error,
    });
  }
}
```

## Testing

### Local Development

In development mode (without reCAPTCHA keys configured):
- Forms will work normally
- reCAPTCHA verification is bypassed
- No token is required

### Production Testing

1. Get test keys from Google reCAPTCHA Admin
2. Add to `.env.local`:
   ```bash
   NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_test_site_key
   RECAPTCHA_SECRET_KEY=your_test_secret_key
   ```
3. Test form submissions
4. Check Google reCAPTCHA Admin Console for scores

### Check if reCAPTCHA is Ready

```javascript
const { isReady } = useRecaptcha();

// Disable submit button until ready
<button disabled={!isReady || isSubmitting}>
  Submit
</button>
```

## Troubleshooting

### "Security verification failed"

**Causes:**
- Missing or invalid reCAPTCHA token
- Token expired (tokens expire after 2 minutes)
- Score below threshold
- Domain not registered in reCAPTCHA Admin

**Solutions:**
- Ensure token is generated immediately before submission
- Check that domain matches in reCAPTCHA Admin Console
- Verify environment variables are set correctly
- Check browser console for errors

### reCAPTCHA Script Not Loading

**Causes:**
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` not set
- Ad blocker interfering
- Network error

**Solutions:**
- Verify environment variable is set and starts with `NEXT_PUBLIC_`
- Disable ad blockers for testing
- Check browser console for errors
- Verify reCAPTCHA scripts load in Network tab

### Form Submission Slow

reCAPTCHA adds ~100-200ms to form submissions. This is normal and expected.

If submissions are very slow (>1 second):
- Check network connection
- Verify reCAPTCHA servers are accessible
- Check for JavaScript errors in console

## Best Practices

1. **Action Names:** Use descriptive, unique action names for each form
2. **Error Handling:** Show user-friendly error messages
3. **Loading States:** Disable submit button while processing
4. **Token Timing:** Generate token immediately before submission (not on page load)
5. **Privacy Notice:** Always include reCAPTCHA privacy notice on forms
6. **Accessibility:** Ensure forms remain accessible with keyboard navigation
7. **Mobile:** Test on mobile devices (reCAPTCHA is fully mobile-compatible)

## Forms Currently Protected

The following forms already have reCAPTCHA protection:
- ✅ Ideas submission
- ✅ Endorsements
- ✅ Questions/Q&A
- ✅ Interest/volunteer forms

## Next Forms to Protect

Consider adding reCAPTCHA to:
- Comment submissions
- Poll voting (if spam becomes an issue)
- Contact forms
- Any other public-facing forms

## Questions?

See `SECURITY_COMPLIANCE_IMPLEMENTATION.md` for detailed documentation.
