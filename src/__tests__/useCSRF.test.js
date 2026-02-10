/**
 * useCSRF Hook Tests
 *
 * These tests ensure the CSRF hook returns the correct shape.
 * This catches bugs like destructuring { csrfToken } instead of { token }.
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useCSRF } from '../hooks/useCSRF';

// Mock fetch globally
global.fetch = jest.fn();

describe('useCSRF', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns token, refreshToken, and isLoading properties', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ csrfToken: 'test-token-123' }),
    });

    const { result } = renderHook(() => useCSRF());

    // Check initial state has correct shape
    expect(result.current).toHaveProperty('token');
    expect(result.current).toHaveProperty('refreshToken');
    expect(result.current).toHaveProperty('isLoading');

    // Verify types
    expect(typeof result.current.token).toBe('string');
    expect(typeof result.current.refreshToken).toBe('function');
    expect(typeof result.current.isLoading).toBe('boolean');
  });

  it('does NOT return csrfToken property (common destructuring mistake)', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ csrfToken: 'test-token-123' }),
    });

    const { result } = renderHook(() => useCSRF());

    // This is the bug Codex caught - if you destructure { csrfToken } from useCSRF,
    // you get undefined because the hook returns { token }, not { csrfToken }
    expect(result.current.csrfToken).toBeUndefined();
    expect(result.current).not.toHaveProperty('csrfToken');
  });

  it('populates token after successful fetch', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ csrfToken: 'abc123' }),
    });

    const { result } = renderHook(() => useCSRF());

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.token).toBe('abc123');
  });

  it('handles fetch failure gracefully', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useCSRF());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.token).toBe('');
    consoleSpy.mockRestore();
  });

  it('refreshToken function refetches the token', async () => {
    const { act } = await import('@testing-library/react');

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ csrfToken: 'first-token' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ csrfToken: 'second-token' }),
      });

    const { result } = renderHook(() => useCSRF());

    await waitFor(() => {
      expect(result.current.token).toBe('first-token');
    });

    await act(async () => {
      await result.current.refreshToken();
    });

    await waitFor(() => {
      expect(result.current.token).toBe('second-token');
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('calls /api/csrf endpoint', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ csrfToken: 'test' }),
    });

    renderHook(() => useCSRF());

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/csrf');
    });
  });
});
