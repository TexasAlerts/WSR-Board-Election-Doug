# TypeScript Quick Reference

Quick reference for TypeScript patterns used in this project.

## Type Checking Commands

```bash
# Check types once
npm run type-check

# Watch mode for development
npm run type-check:watch

# Full verification
npm run type-check && npm run lint && npm run format
```

## Common Patterns

### Import Types

```typescript
// Import shared types
import type { Supporter, Poll, ApiResponse } from '@/types';

// Import React types
import type { ReactNode, FormEvent, ChangeEvent } from 'react';

// Import Next.js types
import { NextRequest, NextResponse } from 'next/server';
```

### Function Types

```typescript
// Basic function
export function sanitizeText(input: string | null): string {
  // Implementation
}

// Async function
export async function getSupporter(id: string): Promise<Supporter | null> {
  // Implementation
}

// Function with optional params
export function createSession(
  supporterId: string,
  request?: RequestHeaders
): Promise<SessionData | null> {
  // Implementation
}

// Arrow function
const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
  // Implementation
};
```

### React Components

```typescript
// Component with props
interface ButtonProps {
  text: string;
  onClick: () => void;
  disabled?: boolean;
}

export default function Button({ text, onClick, disabled }: ButtonProps): JSX.Element {
  return <button onClick={onClick} disabled={disabled}>{text}</button>;
}

// Component with children
interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export default function Layout({ children, className }: LayoutProps): JSX.Element {
  return <div className={className}>{children}</div>;
}

// Component with generic types
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => ReactNode;
}

export function List<T>({ items, renderItem }: ListProps<T>): JSX.Element {
  return <ul>{items.map(renderItem)}</ul>;
}
```

### Event Handlers

```typescript
// Form submit
const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
  e.preventDefault();
  // Handle submit
};

// Input change
const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
  setValue(e.target.value);
};

// Button click
const handleClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
  // Handle click
};
```

### API Routes (Next.js)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse, Supporter } from '@/types';

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<Supporter>>> {
  try {
    const supporter = await getSupporter(id);
    return NextResponse.json({
      success: true,
      data: supporter
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch supporter'
    }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await request.json();
    // Process request
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Request failed'
    }, { status: 500 });
  }
}
```

### State Management

```typescript
// Simple state
const [count, setCount] = useState<number>(0);

// Object state
const [user, setUser] = useState<Supporter | null>(null);

// Array state
const [items, setItems] = useState<Poll[]>([]);

// Complex state
interface FormState {
  email: string;
  password: string;
  errors: Record<string, string>;
}

const [form, setForm] = useState<FormState>({
  email: '',
  password: '',
  errors: {}
});
```

### Supabase Queries

```typescript
// The supabase client is fully typed
import { getSupabase } from '@/lib/supabase';
import type { Supporter } from '@/types';

const supabase = getSupabase();

// Select query
const { data, error } = await supabase
  .from('supporters')
  .select('*')
  .eq('id', id)
  .single();

// data is automatically typed as Supporter

// Insert query
const { error } = await supabase
  .from('supporters')
  .insert({
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    // ... other fields
  });

// Update query
const { data, error } = await supabase
  .from('supporters')
  .update({ status: 'approved' })
  .eq('id', id)
  .single();
```

### Type Guards

```typescript
// Type narrowing
function processValue(value: string | number): void {
  if (typeof value === 'string') {
    // value is string here
    console.log(value.toUpperCase());
  } else {
    // value is number here
    console.log(value.toFixed(2));
  }
}

// Null checking
function getDisplayName(supporter: Supporter | null): string {
  if (!supporter) {
    return 'Guest';
  }
  return `${supporter.first_name} ${supporter.last_name}`;
}

// Array checking
function processItems(items: Poll[] | undefined): void {
  if (!items || items.length === 0) {
    return;
  }
  items.forEach(item => console.log(item.title));
}
```

### Generic Types

```typescript
// Generic function
function findById<T extends { id: string }>(items: T[], id: string): T | undefined {
  return items.find(item => item.id === id);
}

// Generic interface
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Usage
const response: ApiResponse<Supporter> = {
  success: true,
  data: supporter
};
```

### Utility Types

```typescript
// Partial - make all properties optional
const updates: Partial<Supporter> = {
  email: 'new@example.com'
};

// Pick - select specific properties
type SupporterPreview = Pick<Supporter, 'id' | 'first_name' | 'last_name'>;

// Omit - exclude specific properties
type SupporterWithoutPassword = Omit<Supporter, 'password_hash'>;

// Record - object with string keys
const errors: Record<string, string> = {
  email: 'Invalid email',
  password: 'Too short'
};

// Custom utility types
import type { DeepPartial, RequireAtLeastOne } from '@/types';
```

## Converting Files Checklist

1. Rename file: `.js` → `.ts` or `.jsx` → `.tsx`
2. Add return types to all functions
3. Add parameter types
4. Define interfaces for objects
5. Import types from `@/types`
6. Replace `any` with specific types
7. Handle null/undefined cases
8. Run `npm run type-check`
9. Run `npm run format`
10. Test the file
11. Delete old JS file

## Common Errors and Fixes

### Error: "Cannot find module '@/types'"
**Fix**: Restart your IDE/TypeScript server

### Error: "Type 'X' is not assignable to type 'Y'"
**Fix**: Check the type definitions, may need type assertion: `as Type`

### Error: "Object is possibly 'null' or 'undefined'"
**Fix**: Add null check before accessing properties
```typescript
// Bad
const name = user.first_name;

// Good
const name = user?.first_name ?? 'Guest';
```

### Error: "Property 'X' does not exist on type 'Y'"
**Fix**: Update the type definition or check if property name is correct

## Tips

- Use `type` for unions/aliases, `interface` for object shapes
- Prefer `interface` for React component props
- Use `as const` for literal types
- Enable strict mode in tsconfig.json
- Avoid `any`, use `unknown` if type is truly dynamic
- Use optional chaining (`?.`) and nullish coalescing (`??`)

## Resources

- Type definitions: `src/types/index.ts`
- Migration guide: `TYPESCRIPT_MIGRATION.md`
- TypeScript docs: https://www.typescriptlang.org/docs/
- Next.js + TypeScript: https://nextjs.org/docs/app/building-your-application/configuring/typescript
