/**
 * DonateDynamic Component Tests
 *
 * Tests the donation funnel tracking integration.
 * Catches bugs like:
 * - Wrong destructuring from useCSRF hook
 * - Tracking calls not being made
 * - CSRF token not being sent in headers
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DonateDynamic from '../components/DonateDynamic';

// Track all fetch calls
const fetchCalls = [];

// Mock useCSRF hook
jest.mock('../hooks/useCSRF', () => ({
  useCSRF: () => ({
    token: 'mock-csrf-token-123',
    refreshToken: jest.fn(),
    isLoading: false,
  }),
}));

// Mock fetch
global.fetch = jest.fn((url, options) => {
  fetchCalls.push({ url, options });
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ ok: true }),
  });
});

// Mock window.open
const mockWindowOpen = jest.fn();
global.open = mockWindowOpen;

describe('DonateDynamic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchCalls.length = 0;
    mockWindowOpen.mockClear();
  });

  describe('Donation Tracking', () => {
    it('tracks page_view on mount with CSRF token', async () => {
      await act(async () => {
        render(<DonateDynamic />);
      });

      // Wait for useEffect to fire
      await waitFor(() => {
        const trackCall = fetchCalls.find(
          (c) => c.url === '/api/donation/track' && c.options?.body?.includes('page_view')
        );
        expect(trackCall).toBeDefined();
      });

      const trackCall = fetchCalls.find((c) => c.url === '/api/donation/track');
      expect(trackCall.options.headers['x-csrf-token']).toBe('mock-csrf-token-123');
    });

    it('sends CSRF token in x-csrf-token header (not missing due to wrong destructuring)', async () => {
      await act(async () => {
        render(<DonateDynamic />);
      });

      await waitFor(() => {
        expect(fetchCalls.some((c) => c.url === '/api/donation/track')).toBe(true);
      });

      const trackCalls = fetchCalls.filter((c) => c.url === '/api/donation/track');

      // Every tracking call must have the CSRF token
      trackCalls.forEach((call) => {
        expect(call.options.headers['x-csrf-token']).toBe('mock-csrf-token-123');
        // Specifically check it's not undefined (the bug Codex caught)
        expect(call.options.headers['x-csrf-token']).not.toBeUndefined();
      });
    });

    it('tracks amount_selected when preset amount clicked', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<DonateDynamic />);
      });

      // Clear initial page_view call
      await waitFor(() => {
        expect(fetchCalls.some((c) => c.options?.body?.includes('page_view'))).toBe(true);
      });
      const initialCallCount = fetchCalls.length;

      // Click $50 button
      const button50 = screen.getByRole('button', { name: '$50' });
      await user.click(button50);

      await waitFor(() => {
        expect(fetchCalls.length).toBeGreaterThan(initialCallCount);
      });

      const amountCall = fetchCalls.find(
        (c) => c.options?.body?.includes('amount_selected') && c.options?.body?.includes('5000')
      );
      expect(amountCall).toBeDefined();
      expect(JSON.parse(amountCall.options.body)).toMatchObject({
        eventType: 'amount_selected',
        selectedAmount: 5000, // $50 in cents
        isCustomAmount: false,
      });
    });

    it('tracks custom_amount when custom input loses focus', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<DonateDynamic />);
      });

      // Wait for initial load
      await waitFor(() => {
        expect(fetchCalls.some((c) => c.options?.body?.includes('page_view'))).toBe(true);
      });

      const customInput = screen.getByLabelText(/enter a custom amount/i);
      await user.type(customInput, '75');
      await user.tab(); // Trigger blur

      await waitFor(() => {
        const customCall = fetchCalls.find((c) => c.options?.body?.includes('custom_amount'));
        expect(customCall).toBeDefined();
      });

      const customCall = fetchCalls.find((c) => c.options?.body?.includes('custom_amount'));
      expect(JSON.parse(customCall.options.body)).toMatchObject({
        eventType: 'custom_amount',
        selectedAmount: 7500, // $75 in cents
        isCustomAmount: true,
      });
    });

    it('tracks donate_clicked before redirect', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<DonateDynamic />);
      });

      // Select amount first
      await user.click(screen.getByRole('button', { name: '$100' }));

      // Click donate button
      await user.click(screen.getByRole('button', { name: /contribute now/i }));

      await waitFor(() => {
        const donateCall = fetchCalls.find((c) => c.options?.body?.includes('donate_clicked'));
        expect(donateCall).toBeDefined();
      });

      const donateCall = fetchCalls.find((c) => c.options?.body?.includes('donate_clicked'));
      const body = JSON.parse(donateCall.options.body);
      expect(body.eventType).toBe('donate_clicked');
      expect(body.selectedAmount).toBe(10000); // $100 in cents
      expect(body.anedotRedirectUrl).toContain('anedot.com');
    });

    it('opens Anedot in new tab after tracking donate_clicked', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<DonateDynamic />);
      });

      await user.click(screen.getByRole('button', { name: '$25' }));
      await user.click(screen.getByRole('button', { name: /contribute now/i }));

      await waitFor(() => {
        expect(mockWindowOpen).toHaveBeenCalled();
      });

      expect(mockWindowOpen).toHaveBeenCalledWith(
        expect.stringContaining('anedot.com'),
        '_blank'
      );
    });
  });

  describe('UI Behavior', () => {
    it('renders all preset amounts', () => {
      render(<DonateDynamic />);

      expect(screen.getByRole('button', { name: '$25' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '$50' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '$100' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '$250' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '$500' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '$1000' })).toBeInTheDocument();
    });

    it('shows error when no amount selected', async () => {
      const user = userEvent.setup();
      render(<DonateDynamic />);

      await user.click(screen.getByRole('button', { name: /contribute now/i }));

      expect(screen.getByRole('alert')).toHaveTextContent(
        /please select or enter a donation amount/i
      );
    });

    it('shows selected amount when preset clicked', async () => {
      const user = userEvent.setup();
      render(<DonateDynamic />);

      await user.click(screen.getByRole('button', { name: '$250' }));

      expect(screen.getByText(/you're contributing/i)).toBeInTheDocument();
      // Use getAllByText since $250 appears in both button and display
      expect(screen.getAllByText('$250').length).toBeGreaterThanOrEqual(1);
    });

    it('has accessible amount buttons with aria-pressed', () => {
      render(<DonateDynamic />);

      const buttons = screen.getAllByRole('button', { name: /^\$\d+$/ });
      buttons.forEach((button) => {
        expect(button).toHaveAttribute('aria-pressed');
      });
    });
  });
});

describe('DonateDynamic CSRF Integration', () => {
  it('correctly uses token from useCSRF (not csrfToken)', async () => {
    // This test specifically verifies the P1 bug fix
    // The hook returns { token }, not { csrfToken }

    // We need to check that the component is actually using the token
    // If it destructures { csrfToken }, the token would be undefined

    await act(async () => {
      render(<DonateDynamic />);
    });

    await waitFor(() => {
      const calls = fetchCalls.filter((c) => c.url === '/api/donation/track');
      expect(calls.length).toBeGreaterThan(0);

      // The CSRF token should be our mock value, not undefined
      calls.forEach((call) => {
        const csrfHeader = call.options.headers['x-csrf-token'];
        expect(csrfHeader).toBe('mock-csrf-token-123');
        expect(csrfHeader).not.toBe('undefined');
        expect(csrfHeader).not.toBe(undefined);
      });
    });
  });
});
