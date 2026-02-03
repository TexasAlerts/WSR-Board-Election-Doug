# Components

This directory contains React components used throughout the application.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Page-Level Components](#page-level-components)
- [Utility Components](#utility-components)
- [Modal Components](#modal-components)
- [Admin Components](#admin-components)
- [Shared Components](#shared-components)
- [Component Guidelines](#component-guidelines)

---

## Architecture Overview

The component architecture follows these principles:

1. **Dynamic Imports** - Page-level components use `Dynamic` suffix and are loaded via `next/dynamic` to reduce initial bundle size
2. **Client-Side Only** - Most components are client-side ('use client') due to interactive features
3. **Separation of Concerns** - Admin components separated into `/admin` subdirectory
4. **Shared UI** - Reusable components in `/shared` subdirectory
5. **Error Boundaries** - GlobalErrorHandler wraps the app to catch React errors

---

## Page-Level Components

These are the main components for each page route.

### HomeDynamic.jsx

**Route:** `/`

Homepage component with hero section.

**Features:**
- Hero section with call-to-action
- Responsive design
- Links to polls, ideas, and registration

**Usage:**
```javascript
import dynamic from 'next/dynamic';
const HomeDynamic = dynamic(() => import('@/components/HomeDynamic'), { ssr: false });
```

### PollsDynamic.jsx

**Route:** `/polls`

Polls listing and voting interface.

**Features:**
- Display active and closed polls
- Voting for authenticated supporters and verified voters
- Anonymous voting for public polls
- Real-time vote counts
- Comment threads with replies
- Vote history tracking
- Restricted polls (supporter-only)

**State Management:**
- User authentication status
- Poll voting state
- Comment submission
- Reply threading

**Props:**
- `initialPolls` - Server-fetched polls data
- `user` - Current user/supporter

**Key Functions:**
- `handleVote(pollId, optionId)` - Submit poll vote
- `handleComment(pollId, content)` - Submit comment
- `handleReply(commentId, content)` - Submit reply

### GetInvolvedDynamic.jsx

**Route:** `/get-involved`

Campaign volunteer and engagement form.

**Features:**
- Multi-step form (interest selection, contact info, preferences)
- Email and SMS opt-in
- reCAPTCHA v3 integration
- Address validation (USPS)
- Phone validation
- Email verification flow

**State Management:**
- Form step progression
- Validation errors
- Submission status

**Integrations:**
- reCAPTCHA (via `useRecaptcha` hook)
- USPS address validation
- Resend email service

### EndorsementsDynamic.jsx

**Route:** `/endorsements`

Public endorsements display and submission.

**Features:**
- Display approved endorsements
- Endorsement submission form
- Admin approval required
- reCAPTCHA protection

**State Management:**
- Endorsement list
- Form state
- Submission status

### QnaDynamic.jsx

**Route:** `/questions`

Q&A / Ask Doug interface.

**Features:**
- Submit questions
- View answered questions
- Categorized questions
- Admin moderation

**State Management:**
- Question list
- Form state

### DonateDynamic.jsx

**Route:** `/donate`

Donation information and external payment links.

**Features:**
- Campaign finance disclosure
- Links to ActBlue/other platforms
- Donation tier options

---

## Utility Components

### ErrorBoundary.jsx

React Error Boundary component.

**Purpose:**
- Catch React component errors
- Display fallback UI
- Log errors to server (via `logComponentError`)

**Usage:**
```javascript
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

**Props:**
- `children` - Components to wrap
- `fallback` - Optional custom fallback UI

**Features:**
- Logs to `/api/errors` endpoint
- Displays user-friendly error message
- Reset button to recover

### GlobalErrorHandler.jsx

Global error handler that wraps the entire app.

**Purpose:**
- Setup global error listeners
- Catch unhandled promise rejections
- Catch window.onerror events
- Log all errors to server

**Usage:**
```javascript
// In layout.tsx
<GlobalErrorHandler>
  <body>{children}</body>
</GlobalErrorHandler>
```

**Features:**
- Calls `setupGlobalErrorHandlers()` from `clientErrorLogger`
- Prevents error loops
- Silent logging failures

### CookieConsent.js

GDPR/CCPA cookie consent banner.

**Features:**
- First-visit banner
- Accept/decline options
- Persists choice to localStorage
- Auto-hide after acceptance

**State:**
- Stored in `localStorage` as `cookieConsent`

**Values:**
- `'accepted'` - User accepted cookies
- `'declined'` - User declined cookies
- `null` - No choice made yet

### RecaptchaProvider.js

Wrapper for Google reCAPTCHA v3.

**Purpose:**
- Load reCAPTCHA script
- Provide reCAPTCHA context to app
- Required for `useRecaptcha` hook

**Usage:**
```javascript
// In layout.tsx
<RecaptchaProvider>
  {children}
</RecaptchaProvider>
```

**Configuration:**
- Requires `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`

### ScrollToTop.jsx

Scroll-to-top button.

**Features:**
- Appears when scrolled down
- Smooth scroll to top
- Fade in/out animation

**Behavior:**
- Shows when scrollY > 300px
- Hidden on top of page

---

## Modal Components

### AdminModal.jsx

Admin password authentication modal.

**Purpose:**
- Password-based admin login
- Creates admin session (8hr expiry)
- Alternative to email/password login

**Features:**
- Password input
- Session creation
- Error handling
- Auto-redirect on success

**Usage:**
```javascript
import AdminModal from '@/components/AdminModal';

<AdminModal isOpen={showAdminModal} onClose={() => setShowAdminModal(false)} />
```

**Props:**
- `isOpen` - boolean to show/hide modal
- `onClose` - callback when modal closes

**Flow:**
1. User enters admin password
2. POST to `/api/admin/login`
3. Sets `admin_session` cookie
4. Redirects to `/admin`

### VerifiedVoterModal.jsx

Email verification modal for lightweight voting.

**Purpose:**
- Allow non-registered users to vote
- Email verification only (no account creation)
- Creates `verified_voters` record

**Features:**
- Email input
- Optional name and address
- Email verification flow
- Sets `verified_voter_id` cookie

**Usage:**
```javascript
import VerifiedVoterModal from '@/components/VerifiedVoterModal';

<VerifiedVoterModal
  isOpen={showVoterModal}
  onClose={() => setShowVoterModal(false)}
  onVerified={() => setCanVote(true)}
/>
```

**Props:**
- `isOpen` - boolean
- `onClose` - callback
- `onVerified` - callback after successful verification

**Flow:**
1. User enters email (and optional name/address)
2. POST to `/api/voter/register`
3. Email sent with verification link
4. User clicks link → verified
5. Cookie set → can vote

### VotingOptionsModal.jsx

Modal to choose voting method.

**Purpose:**
- Show voting options for unauthenticated users
- Options: Login, Sign Up, or Verify Email

**Features:**
- Three voting paths explained
- Links to appropriate flows

**Usage:**
```javascript
import VotingOptionsModal from '@/components/VotingOptionsModal';

<VotingOptionsModal
  isOpen={showOptions}
  onClose={() => setShowOptions(false)}
  onSelectVerifiedVoter={() => setShowVoterModal(true)}
/>
```

**Props:**
- `isOpen` - boolean
- `onClose` - callback
- `onSelectVerifiedVoter` - callback when "Verify Email" is clicked

---

## Admin Components

Located in `/admin` subdirectory. All require admin authentication.

### AuditLogsTab.jsx

Display audit log entries.

**Features:**
- Filterable by event type
- Search by user, IP, or event
- Pagination
- Export to CSV
- View event details (JSON)

**Audit Event Types:**
- LOGIN_SUCCESS, LOGIN_FAILED
- REGISTER, EMAIL_VERIFIED, PHONE_VERIFIED
- POLL_VOTE, IDEA_VOTE, COMMENT_CREATED
- SUPPORTER_APPROVED, COMMENT_APPROVED
- etc.

**Data Shown:**
- Timestamp
- Event type
- Supporter
- IP address
- User agent (browser/OS/device)
- Details (JSON)

### ErrorLogsTab.jsx

Display and manage error logs.

**Features:**
- View errors with occurrence count
- Filter by type and status
- Mark as resolved/ignored
- View stack traces
- Device/browser info

**Error Types:**
- `api_error`
- `client_error`
- `server_error`
- `validation_error`
- `auth_error`
- `database_error`
- `external_service`

**Status:**
- `new` - Unresolved error
- `resolved` - Fixed by admin
- `ignored` - Acknowledged but not actionable

**Actions:**
- Mark as resolved
- Mark as ignored
- View full stack trace
- View request details

### SupportersTab.jsx

Manage supporter accounts.

**Features:**
- View all supporters
- Filter by status (pending, approved, suspended)
- Approve/suspend accounts
- Change roles (supporter, admin, super_admin)
- View supporter details
- Export to CSV

**Supporter Statuses:**
- `pending_email` - Email not verified
- `pending_phone` - Phone not verified
- `approved` - Active account
- `suspended` - Account disabled

**Roles:**
- `supporter` - Regular user
- `admin` - Moderator access
- `super_admin` - Full admin access

**Actions:**
- Approve account
- Suspend account
- Change role
- View activity
- Delete account

### CommentsTab.jsx

Moderate comments and replies.

**Features:**
- View pending comments
- Approve/reject comments
- View comment context (poll/idea)
- Send notifications to users

**Comment Statuses:**
- `pending` - Awaiting moderation
- `approved` - Visible to public
- `rejected` - Not approved

**Actions:**
- Approve comment
- Reject with reason
- View on poll/idea page

### IdeasTab.jsx

Manage community ideas.

**Features:**
- View all ideas
- Filter by status
- Change idea status
- View votes and comments
- Export to CSV

**Idea Statuses:**
- `submitted` - New idea
- `under_review` - Being considered
- `approved` - Accepted for implementation
- `implemented` - Already done
- `not_feasible` - Cannot be done

### EndorsementsTab.jsx

Moderate public endorsements.

**Features:**
- Approve/reject endorsements
- View submitter info
- Publish to endorsements page

**Endorsement Statuses:**
- `pending` - Awaiting approval
- `approved` - Published
- `rejected` - Not approved

### QuestionsTab.jsx

Manage Q&A submissions.

**Features:**
- View questions
- Mark as answered
- Add answer text
- Publish to Q&A page

### InterestTab.jsx

View and manage volunteer interest submissions.

**Features:**
- View interest forms
- Filter by interest type (volunteer, yard sign, etc.)
- Export contact list
- Email/SMS consent status

### VerifiedVotersTab.jsx

Manage lightweight verified voter accounts.

**Features:**
- View verified voters
- Suspend/unsuspend voters
- View voting history
- Delete voters

**Actions:**
- Suspend voter
- Unsuspend voter
- Delete voter record

### BroadcastsTab.jsx

Send email/SMS broadcasts.

**Features:**
- Compose email broadcasts
- Select recipient groups
- Preview before sending
- Track sent/failed counts
- Email/SMS consent filtering

**Recipient Groups:**
- All supporters
- Email consent only
- SMS consent only
- Specific ZIP codes
- Custom filters

### ReportsTab.jsx

Generate and export reports.

**Features:**
- Supporter reports
- Poll results
- Idea submissions
- Audit logs
- Error logs
- Export as CSV
- Date range filtering

**Report Types:**
- Supporters by status
- Supporters by ZIP code
- Poll participation
- Idea submissions
- Comment activity
- Login activity

---

## Shared Components

Located in `/shared` subdirectory. Reusable UI components.

Currently minimal. Future additions may include:

- `Button.jsx` - Styled button component
- `Input.jsx` - Form input component
- `Card.jsx` - Card container
- `Modal.jsx` - Generic modal wrapper
- `Spinner.jsx` - Loading spinner
- `Alert.jsx` - Alert/toast notifications

---

## Component Guidelines

When creating new components:

### File Organization

```
src/components/
├── [PageName]Dynamic.jsx       # Page-level components
├── [UtilityName].jsx           # Utility components
├── admin/
│   └── [AdminFeature]Tab.jsx   # Admin dashboard tabs
└── shared/
    └── [SharedComponent].jsx   # Reusable UI components
```

### Naming Conventions

- **Page Components:** `[PageName]Dynamic.jsx` (e.g., `PollsDynamic.jsx`)
- **Admin Tabs:** `[Feature]Tab.jsx` (e.g., `SupportersTab.jsx`)
- **Modals:** `[Purpose]Modal.jsx` (e.g., `VerifiedVoterModal.jsx`)
- **Utilities:** `[Purpose].jsx` (e.g., `ErrorBoundary.jsx`)

### Component Structure

```javascript
'use client'; // If using hooks, state, or browser APIs

import { useState } from 'react';
import { someUtil } from '@/lib/someUtil';

/**
 * ComponentName - Brief description
 *
 * @param {Object} props - Component props
 * @param {string} props.propName - Prop description
 * @returns {JSX.Element}
 */
export default function ComponentName({ propName }) {
  const [state, setState] = useState(initialValue);

  // Event handlers
  const handleAction = async () => {
    // Implementation
  };

  // Effects
  useEffect(() => {
    // Side effects
  }, [dependencies]);

  return (
    <div className="container">
      {/* JSX */}
    </div>
  );
}
```

### State Management

- **Local State:** Use `useState` for component-specific state
- **Form State:** Track form data, validation errors, submission status
- **Loading States:** Show loading indicators during async operations
- **Error States:** Display user-friendly error messages

### Error Handling

```javascript
const [error, setError] = useState(null);
const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async () => {
  setIsLoading(true);
  setError(null);

  try {
    const response = await fetch('/api/endpoint', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!result.ok) {
      setError(result.error || 'Request failed');
      return;
    }

    // Success handling
  } catch (err) {
    setError('An unexpected error occurred');
    console.error(err);
  } finally {
    setIsLoading(false);
  }
};
```

### Async Operations

Always use try/catch with async functions:

```javascript
const fetchData = async () => {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    setData(data);
  } catch (error) {
    console.error('Failed to fetch data:', error);
    setError(error.message);
  }
};
```

### Form Submission

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();

  // Validate
  if (!validateForm()) {
    return;
  }

  setIsSubmitting(true);

  try {
    // Get reCAPTCHA token if needed
    const token = await getToken('action_name');

    const response = await fetch('/api/endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, recaptchaToken: token }),
    });

    const result = await response.json();

    if (result.ok) {
      // Success
      setFormData(initialState);
      setMessage('Success!');
    } else {
      setError(result.error);
    }
  } catch (error) {
    setError('Submission failed');
  } finally {
    setIsSubmitting(false);
  }
};
```

### Accessibility

- Use semantic HTML elements
- Add `aria-label` to icon buttons
- Include keyboard navigation support
- Provide focus indicators
- Use proper heading hierarchy
- Add `alt` text to images

### Performance

- Use `React.memo()` for expensive components
- Debounce search inputs
- Lazy load images with `loading="lazy"`
- Use `next/dynamic` for code splitting
- Avoid inline function definitions in JSX (for re-rendered components)

### Styling

- Use Tailwind CSS utility classes
- Follow responsive design patterns
- Mobile-first approach
- Consistent spacing and colors
- Dark mode support (if applicable)

---

## Testing Components

When testing components:

1. **Unit Tests** - Test individual component logic
2. **Integration Tests** - Test component interactions
3. **E2E Tests** - Test user flows with Playwright/Cypress

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders without crashing', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<MyComponent onClick={handleClick} />);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

---

## Common Patterns

### Loading States

```javascript
if (isLoading) {
  return <div>Loading...</div>;
}

if (error) {
  return <div className="error">{error}</div>;
}

return <div>{data}</div>;
```

### Conditional Rendering

```javascript
{user ? (
  <UserDashboard user={user} />
) : (
  <LoginPrompt />
)}
```

### Lists with Keys

```javascript
{items.map((item) => (
  <ItemCard key={item.id} item={item} />
))}
```

### Event Handlers

```javascript
// Good - defined outside JSX
const handleClick = () => {
  doSomething();
};

<button onClick={handleClick}>Click</button>

// Avoid - creates new function on each render
<button onClick={() => doSomething()}>Click</button>
```

---

## Future Enhancements

Planned component additions:

- Toast notification system
- Confirmation dialog component
- Table component with sorting/filtering
- Pagination component
- Skeleton loading states
- Form field components with validation
- File upload component
- Rich text editor integration
