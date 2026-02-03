# Custom React Hooks

This directory contains custom React hooks used throughout the application.

## Table of Contents

- [useRecaptcha](#userecaptcha)

---

## useRecaptcha

React hook for Google reCAPTCHA v3 integration.

**File:** `useRecaptcha.js`

### Overview

Provides a simple interface to execute reCAPTCHA v3 and get tokens for form submissions. Wraps the `react-google-recaptcha-v3` library with error handling and loading state.

### Usage

```javascript
import { useRecaptcha } from '@/hooks/useRecaptcha';

function MyForm() {
  const { getToken, isReady } = useRecaptcha();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Get reCAPTCHA token with action name
    const token = await getToken('submit_form');

    if (!token) {
      console.error('Failed to get reCAPTCHA token');
      return;
    }

    // Send token to server for verification
    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, ...formData }),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit" disabled={!isReady}>
        Submit
      </button>
    </form>
  );
}
```

### API

#### Returns

```javascript
{
  getToken: (action: string) => Promise<string | null>,
  isReady: boolean
}
```

**`getToken(action)`**
- **Purpose:** Execute reCAPTCHA and get a token
- **Parameters:**
  - `action` (string) - The action name for this verification (e.g., 'submit_idea', 'endorse', 'login')
- **Returns:** Promise<string | null>
  - Returns the reCAPTCHA token on success
  - Returns null if reCAPTCHA is not loaded or execution fails
- **Example:**
  ```javascript
  const token = await getToken('poll_vote');
  ```

**`isReady`**
- **Purpose:** Indicates whether reCAPTCHA has loaded
- **Type:** boolean
- **Usage:** Disable submit buttons until reCAPTCHA is ready
- **Example:**
  ```javascript
  <button disabled={!isReady}>Submit</button>
  ```

### Action Naming Convention

Use descriptive action names that match the form/operation:

- `'submit_idea'` - Creating a new idea
- `'submit_poll_vote'` - Voting on a poll
- `'submit_comment'` - Posting a comment
- `'submit_endorsement'` - Submitting an endorsement
- `'submit_question'` - Asking a question
- `'register'` - User registration
- `'login'` - User login
- `'forgot_password'` - Password reset request

Action names are validated on the server side to prevent token reuse.

### Server-Side Verification

The token must be verified on the server using the `verifyCaptcha()` function:

```javascript
import { verifyCaptcha } from '@/lib/recaptcha';

export async function POST(request) {
  const { token, ...data } = await request.json();

  const captchaResult = await verifyCaptcha(token, 'submit_idea');

  if (!captchaResult.success) {
    return NextResponse.json(
      { error: 'reCAPTCHA verification failed' },
      { status: 400 }
    );
  }

  // captchaResult.score is between 0.0 and 1.0
  // 1.0 = very likely a human
  // 0.0 = very likely a bot

  // Process the form...
}
```

### Configuration

This hook requires the `RecaptchaProvider` to be configured in your app layout:

```javascript
import { RecaptchaProvider } from '@/components/RecaptchaProvider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <RecaptchaProvider>
          {children}
        </RecaptchaProvider>
      </body>
    </html>
  );
}
```

**Environment Variables:**
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` - reCAPTCHA v3 site key (client-side)
- `RECAPTCHA_SECRET_KEY` - reCAPTCHA v3 secret key (server-side)

Get keys from: https://www.google.com/recaptcha/admin

### Error Handling

The hook gracefully handles errors:

- Returns `null` if reCAPTCHA is not loaded yet
- Returns `null` if token generation fails
- Check `isReady` before attempting to get a token

```javascript
const { getToken, isReady } = useRecaptcha();

if (!isReady) {
  console.log('reCAPTCHA not ready yet');
}

const token = await getToken('submit_form');
if (!token) {
  // Handle error - maybe show message to user
  console.error('Failed to verify you are human. Please try again.');
}
```

### reCAPTCHA v3 Score Interpretation

reCAPTCHA v3 returns a score from 0.0 to 1.0:

- **1.0** - Very likely a good interaction
- **0.9-1.0** - Very likely human
- **0.5-0.9** - Probably human
- **0.0-0.5** - Likely bot

The default threshold is 0.5 (configurable via `RECAPTCHA_SCORE_THRESHOLD`).

### Best Practices

1. **Use descriptive action names** - Each form should have a unique action name
2. **Check isReady** - Don't call getToken() before reCAPTCHA loads
3. **Handle null tokens** - Always check if token generation succeeded
4. **Don't reuse tokens** - Get a new token for each form submission
5. **Validate on server** - Always verify tokens server-side using `verifyCaptcha()`
6. **User experience** - reCAPTCHA v3 is invisible, no user interaction needed

### Example: Form with reCAPTCHA

```javascript
'use client';

import { useState } from 'react';
import { useRecaptcha } from '@/hooks/useRecaptcha';

export default function IdeaSubmissionForm() {
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { getToken, isReady } = useRecaptcha();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get reCAPTCHA token
      const token = await getToken('submit_idea');

      if (!token) {
        alert('Failed to verify you are human. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // Submit to server
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, recaptchaToken: token }),
      });

      const result = await response.json();

      if (result.ok) {
        alert('Idea submitted successfully!');
        setFormData({ title: '', description: '' });
      } else {
        alert(result.error || 'Submission failed');
      }
    } catch (error) {
      console.error('Error submitting idea:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        placeholder="Idea Title"
        required
      />
      <textarea
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        placeholder="Description"
        required
      />
      <button
        type="submit"
        disabled={!isReady || isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Idea'}
      </button>
      {!isReady && <p className="text-sm text-gray-500">Loading security check...</p>}
    </form>
  );
}
```

### Troubleshooting

**Token is always null:**
- Verify `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is set
- Check browser console for reCAPTCHA errors
- Ensure `RecaptchaProvider` is in your layout
- Verify domain is registered in reCAPTCHA admin console

**Server verification fails:**
- Check `RECAPTCHA_SECRET_KEY` is set correctly
- Verify action name matches between client and server
- Check score threshold (default 0.5)

**reCAPTCHA badge not showing:**
- reCAPTCHA v3 is invisible by default
- Badge shows in bottom-right corner when loaded
- Can be hidden with CSS if needed (but must follow Google's terms)

---

## Future Hooks

Additional custom hooks may be added to this directory:

- `useAuth()` - Hook for authentication state and actions
- `useLocalStorage()` - Hook for persisting state to localStorage
- `useDebounce()` - Hook for debouncing input values
- `useMediaQuery()` - Hook for responsive breakpoints
- `useForm()` - Hook for form state management

---

## Hook Guidelines

When creating new hooks:

1. **Naming** - Prefix with `use` (e.g., `useRecaptcha`)
2. **Single Responsibility** - Each hook should do one thing well
3. **Documentation** - Add comprehensive JSDoc comments
4. **Error Handling** - Handle errors gracefully, don't crash
5. **TypeScript** - Use TypeScript for type safety
6. **Testing** - Write unit tests using React Testing Library
7. **README** - Update this README when adding new hooks
