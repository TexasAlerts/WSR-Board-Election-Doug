# TypeScript Migration Guide

This document outlines the TypeScript migration strategy for the WSR Board Election application and provides guidance for continuing the migration.

## Migration Status

### Completed (Foundation)

1. **TypeScript Configuration**
   - ✅ Installed TypeScript and type definitions (`typescript`, `@types/react`, `@types/node`, `@types/bcryptjs`)
   - ✅ Created `tsconfig.json` with strict mode enabled
   - ✅ Configured Next.js for TypeScript support
   - ✅ Added type-checking scripts to `package.json`

2. **Type Definitions**
   - ✅ Created comprehensive type definitions in `src/types/index.ts`
   - ✅ Database models for all tables (Supporters, Polls, Ideas, Comments, etc.)
   - ✅ API response types
   - ✅ Form submission types
   - ✅ Component prop types
   - ✅ Utility types

3. **Converted Utility Libraries**
   - ✅ `src/lib/sanitize.js` → `sanitize.ts`
   - ✅ `src/lib/supabase.js` → `supabase.ts`
   - ✅ `src/lib/auth.js` → `auth.ts`

4. **Converted Components (Examples)**
   - ✅ `src/components/RecaptchaProvider.js` → `RecaptchaProvider.tsx`
   - ✅ `src/components/CookieConsent.js` → `CookieConsent.tsx`
   - ✅ `src/components/ScrollToTop.jsx` → `ScrollToTop.tsx`

## TypeScript Configuration

The project uses strict TypeScript settings for maximum type safety:

```json
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "noImplicitReturns": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true
}
```

Path aliases are configured for cleaner imports:
- `@/types/*` → `src/types/*`
- `@/lib/*` → `src/lib/*`
- `@/components/*` → `src/components/*`

## Type-Checking Scripts

Two new npm scripts have been added:

```bash
# One-time type check
npm run type-check

# Watch mode for development
npm run type-check:watch
```

Run these regularly during development to catch type errors early.

## Migration Patterns

### 1. Converting Utility Libraries

**Before (JavaScript):**
```javascript
export function sanitizeText(input) {
  if (typeof input !== 'string') return '';
  return input.replace(/<[^>]*>/g, '').trim();
}
```

**After (TypeScript):**
```typescript
export function sanitizeText(input: string | null | undefined): string {
  if (typeof input !== 'string') return '';
  return input.replace(/<[^>]*>/g, '').trim();
}
```

### 2. Converting React Components

**Before (JavaScript):**
```javascript
export default function RecaptchaProvider({ children }) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  // ...
}
```

**After (TypeScript):**
```typescript
import type { ReactNode } from 'react';

interface RecaptchaProviderProps {
  children: ReactNode;
}

export default function RecaptchaProvider({ children }: RecaptchaProviderProps): ReactNode {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  // ...
}
```

### 3. Using Shared Types

Import types from the central type definitions:

```typescript
import type { Supporter, Poll, Idea, ApiResponse } from '@/types';

export async function getSupporter(id: string): Promise<Supporter | null> {
  // Implementation
}
```

### 4. Supabase Client with Types

The Supabase client is now fully typed:

```typescript
import { getSupabase } from '@/lib/supabase';
import type { Supporter } from '@/types';

const supabase = getSupabase();
const { data, error } = await supabase
  .from('supporters')
  .select('*')
  .eq('email', email)
  .single();

// data is automatically typed as Supporter
```

## Continuing the Migration

### Recommended Order

1. **Phase 2: Remaining Utility Libraries** (Priority: High)
   - `src/lib/phoneValidation.js`
   - `src/lib/rateLimit.js`
   - `src/lib/emailService.js`
   - `src/lib/smsService.js`
   - `src/lib/env.js`
   - `src/lib/logging.js`
   - `src/lib/notifications.js`

2. **Phase 3: API Routes** (Priority: High)
   - Convert `src/app/api/**/*.js` to TypeScript
   - Add request/response typing
   - Use Zod for runtime validation alongside TypeScript

3. **Phase 4: Small Components** (Priority: Medium)
   - Convert remaining small components (<100 lines)
   - ErrorBoundary, GlobalErrorHandler
   - Modal components

4. **Phase 5: Large Components** (Priority: Medium)
   - Admin dashboard components
   - Form components
   - Dynamic page components

5. **Phase 6: Pages** (Priority: Low)
   - Convert `src/app/**/*.js` files
   - Usually simpler than components

### Migration Checklist (Per File)

When migrating a file:

- [ ] Rename `.js`/`.jsx` to `.ts`/`.tsx`
- [ ] Add explicit return types to functions
- [ ] Add type annotations to parameters
- [ ] Define interfaces for objects and component props
- [ ] Import and use shared types from `@/types`
- [ ] Replace `any` with specific types
- [ ] Add null/undefined handling
- [ ] Run `npm run type-check` to verify
- [ ] Test the converted file
- [ ] Delete the old `.js` file

### Common Patterns

#### API Route Handler

```typescript
import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse, Supporter } from '@/types';

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Supporter>>> {
  try {
    const body = await request.json();
    // Process request
    return NextResponse.json({ success: true, data: supporter });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error message' }, { status: 500 });
  }
}
```

#### Component with Props

```typescript
import type { Poll, PollChoice } from '@/types';

interface PollCardProps {
  poll: Poll;
  choices: PollChoice[];
  onVote?: (pollId: string, choiceIds: string[]) => Promise<void>;
  className?: string;
}

export default function PollCard({ poll, choices, onVote, className }: PollCardProps): JSX.Element {
  // Implementation
}
```

#### Event Handlers

```typescript
import type { FormEvent, ChangeEvent } from 'react';

export default function MyForm(): JSX.Element {
  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    // Handle submit
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    // Handle change
  };

  return (
    <form onSubmit={handleSubmit}>
      <input onChange={handleChange} />
    </form>
  );
}
```

## Gradual Adoption Strategy

The project is configured to allow **gradual migration**:

- `allowJs: true` - JavaScript and TypeScript can coexist
- `checkJs: false` - JavaScript files are not type-checked
- Old `.js` files continue working alongside new `.ts` files

This means:
1. You can convert files one at a time
2. No need to convert everything at once
3. Existing JavaScript code continues working
4. New code should be written in TypeScript

## Benefits Achieved

1. **Type Safety**: Catch errors at compile time instead of runtime
2. **Better IDE Support**: Autocomplete, inline documentation, refactoring
3. **Self-Documenting Code**: Types serve as inline documentation
4. **Easier Refactoring**: Rename/restructure with confidence
5. **Reduced Bugs**: Many common bugs caught before deployment

## Troubleshooting

### Common Issues

**Issue**: `Cannot find module '@/types'`
**Solution**: Make sure `tsconfig.json` includes the `paths` configuration and restart your IDE.

**Issue**: Type errors in Supabase queries
**Solution**: Ensure you're importing types from `@/types` and the query matches the schema.

**Issue**: `any` type warnings
**Solution**: Replace `any` with specific types. Use `unknown` if the type is truly dynamic.

**Issue**: Next.js server component types
**Solution**: Use `Promise<JSX.Element>` for async server components.

### Getting Help

- Check existing converted files for patterns
- Review `src/types/index.ts` for available types
- TypeScript documentation: https://www.typescriptlang.org/docs/
- Next.js TypeScript docs: https://nextjs.org/docs/app/building-your-application/configuring/typescript

## Testing TypeScript Changes

After converting files:

```bash
# Type check
npm run type-check

# Run tests
npm test

# Build check
npm run build

# Lint check
npm run lint
```

## Notes

- **Don't rush**: Quality over speed. Proper typing takes time.
- **Be strict**: Use strict types, avoid `any` unless absolutely necessary.
- **Document complex types**: Add JSDoc comments for complex type definitions.
- **Reuse types**: Import from `@/types` instead of defining inline.
- **Update as you go**: When touching a file for other reasons, convert it to TypeScript.

---

**Last Updated**: 2026-02-02
**Status**: Foundation complete, ready for continued migration
