/**
 * Session Tracking Module Tests
 *
 * Tests the sessionTracking library functions.
 * Ensures proper session management for visitor tracking.
 */

import crypto from 'crypto';

// Mock next/headers
const mockCookieStore = {
  get: jest.fn(),
  set: jest.fn(),
};

jest.mock('next/headers', () => ({
  cookies: jest.fn(() => Promise.resolve(mockCookieStore)),
}));

// Mock Supabase
const mockSupabaseFrom = jest.fn();
const mockSupabase = {
  from: mockSupabaseFrom,
  rpc: jest.fn(),
};

jest.mock('../lib/supabase', () => ({
  getSupabase: () => mockSupabase,
}));

// Mock logging
jest.mock('../lib/logging', () => ({
  parseUserAgent: jest.fn(() => ({
    browser: 'Chrome',
    os: 'Windows',
    device: 'desktop',
  })),
  getRequestMeta: jest.fn(() => ({
    ip: '192.168.1.1',
    userAgent: 'Mozilla/5.0 Chrome/100',
  })),
}));

describe('sessionTracking', () => {
  let sessionTracking;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetModules();

    // Reset cookie mock
    mockCookieStore.get.mockReturnValue(undefined);
    mockCookieStore.set.mockImplementation(() => {});

    // Import fresh module
    sessionTracking = await import('../lib/sessionTracking');
  });

  describe('generateCorrelationId', () => {
    it('returns a valid UUID', () => {
      const id = sessionTracking.generateCorrelationId();
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(id).toMatch(uuidRegex);
    });

    it('generates unique IDs', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(sessionTracking.generateCorrelationId());
      }
      expect(ids.size).toBe(100);
    });
  });

  describe('ActivityTypes', () => {
    it('exports all activity types', () => {
      expect(sessionTracking.ActivityTypes).toEqual({
        PAGE_VIEW: 'page_view',
        POLL_VOTE: 'poll_vote',
        IDEA_SUPPORT: 'idea_support',
        IDEA_CREATE: 'idea_create',
        COMMENT_CREATE: 'comment_create',
        DONATION_PAGE: 'donation_page',
        DONATION_AMOUNT: 'donation_amount',
        DONATION_CLICK: 'donation_click',
        FORM_SUBMIT: 'form_submit',
        LOGIN: 'login',
        REGISTER: 'register',
        ERROR: 'error',
        API_CALL: 'api_call',
      });
    });
  });

  describe('getOrCreateVisitorSession', () => {
    const mockRequest = {
      url: 'http://localhost:3000/donate?utm_source=facebook',
      headers: {
        get: jest.fn((name) => {
          if (name === 'referer') return 'https://facebook.com';
          return null;
        }),
      },
    };

    it('creates new session when no cookie exists', async () => {
      mockCookieStore.get.mockReturnValue(undefined);
      mockSupabaseFrom.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'new-session-id' },
              error: null,
            }),
          }),
        }),
      });

      const result = await sessionTracking.getOrCreateVisitorSession(mockRequest);

      expect(result.sessionId).toBe('new-session-id');
      expect(result.isNew).toBe(true);
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'vs_id',
        'new-session-id',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
        })
      );
    });

    it('returns existing session when cookie is valid and active', async () => {
      const existingSessionId = 'existing-session-123';
      mockCookieStore.get.mockReturnValue({ value: existingSessionId });

      // Session is active (last activity within 30 minutes)
      const recentTime = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      mockSupabaseFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: existingSessionId,
                last_activity_at: recentTime,
                supporter_id: null,
              },
              error: null,
            }),
          }),
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      });

      const result = await sessionTracking.getOrCreateVisitorSession(mockRequest);

      expect(result.sessionId).toBe(existingSessionId);
      expect(result.isNew).toBe(false);
    });

    it('creates new session when existing session timed out', async () => {
      const existingSessionId = 'timed-out-session';
      mockCookieStore.get.mockReturnValue({ value: existingSessionId });

      // Session timed out (last activity > 30 minutes ago)
      const oldTime = new Date(Date.now() - 35 * 60 * 1000).toISOString();
      mockSupabaseFrom
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: {
                  id: existingSessionId,
                  last_activity_at: oldTime,
                  supporter_id: null,
                },
                error: null,
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: null }),
          }),
        })
        .mockReturnValueOnce({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { id: 'new-session-after-timeout' },
                error: null,
              }),
            }),
          }),
        });

      const result = await sessionTracking.getOrCreateVisitorSession(mockRequest);

      expect(result.sessionId).toBe('new-session-after-timeout');
      expect(result.isNew).toBe(true);
    });

    it('captures UTM parameters', async () => {
      mockCookieStore.get.mockReturnValue(undefined);

      let capturedInsert;
      mockSupabaseFrom.mockReturnValue({
        insert: jest.fn((data) => {
          capturedInsert = data;
          return {
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { id: 'utm-session' },
                error: null,
              }),
            }),
          };
        }),
      });

      await sessionTracking.getOrCreateVisitorSession(mockRequest);

      expect(capturedInsert).toMatchObject({
        utm_source: 'facebook',
      });
    });

    it('returns null session ID on error', async () => {
      mockCookieStore.get.mockReturnValue(undefined);
      mockSupabaseFrom.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
            }),
          }),
        }),
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const result = await sessionTracking.getOrCreateVisitorSession(mockRequest);

      expect(result.sessionId).toBeNull();
      expect(result.isNew).toBe(false);
      consoleSpy.mockRestore();
    });
  });

  describe('getVisitorSessionId', () => {
    it('returns session ID from cookie', async () => {
      mockCookieStore.get.mockReturnValue({ value: 'cookie-session-id' });

      const result = await sessionTracking.getVisitorSessionId();

      expect(result).toBe('cookie-session-id');
    });

    it('returns null when no cookie exists', async () => {
      mockCookieStore.get.mockReturnValue(undefined);

      const result = await sessionTracking.getVisitorSessionId();

      expect(result).toBeNull();
    });
  });

  describe('logSessionActivity', () => {
    it('does nothing when visitorSessionId is null', async () => {
      await sessionTracking.logSessionActivity({
        visitorSessionId: null,
        activityType: 'page_view',
      });

      expect(mockSupabaseFrom).not.toHaveBeenCalled();
    });

    it('inserts activity record with correct data', async () => {
      let capturedInsert;
      mockSupabaseFrom.mockReturnValue({
        insert: jest.fn((data) => {
          capturedInsert = data;
          return Promise.resolve({ error: null });
        }),
      });
      mockSupabase.rpc.mockResolvedValue({ error: null });

      await sessionTracking.logSessionActivity({
        visitorSessionId: 'session-123',
        activityType: 'poll_vote',
        targetType: 'poll',
        targetId: 'poll-456',
        targetName: 'Best Ice Cream',
        correlationId: 'corr-789',
        latencyMs: 150,
      });

      expect(capturedInsert).toMatchObject({
        visitor_session_id: 'session-123',
        activity_type: 'poll_vote',
        target_type: 'poll',
        target_id: 'poll-456',
        target_name: 'Best Ice Cream',
        correlation_id: 'corr-789',
        latency_ms: 150,
      });
    });

    it('calls increment_session_stats RPC', async () => {
      mockSupabaseFrom.mockReturnValue({
        insert: jest.fn().mockResolvedValue({ error: null }),
      });
      mockSupabase.rpc.mockResolvedValue({ error: null });

      await sessionTracking.logSessionActivity({
        visitorSessionId: 'session-123',
        activityType: 'page_view',
      });

      expect(mockSupabase.rpc).toHaveBeenCalledWith('increment_session_stats', {
        p_session_id: 'session-123',
        p_is_page_view: true,
      });
    });

    it('sets is_page_view true only for page_view activity', async () => {
      mockSupabaseFrom.mockReturnValue({
        insert: jest.fn().mockResolvedValue({ error: null }),
      });
      mockSupabase.rpc.mockResolvedValue({ error: null });

      // Test page_view
      await sessionTracking.logSessionActivity({
        visitorSessionId: 'session-123',
        activityType: 'page_view',
      });

      expect(mockSupabase.rpc).toHaveBeenLastCalledWith('increment_session_stats', {
        p_session_id: 'session-123',
        p_is_page_view: true,
      });

      // Test non-page_view
      await sessionTracking.logSessionActivity({
        visitorSessionId: 'session-123',
        activityType: 'poll_vote',
      });

      expect(mockSupabase.rpc).toHaveBeenLastCalledWith('increment_session_stats', {
        p_session_id: 'session-123',
        p_is_page_view: false,
      });
    });
  });

  describe('linkSessionToSupporter', () => {
    it('updates session with supporter ID', async () => {
      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      });
      mockSupabaseFrom.mockReturnValue({ update: mockUpdate });

      await sessionTracking.linkSessionToSupporter('session-123', 'supporter-456');

      expect(mockUpdate).toHaveBeenCalledWith({ supporter_id: 'supporter-456' });
    });

    it('does nothing when sessionId is null', async () => {
      await sessionTracking.linkSessionToSupporter(null, 'supporter-456');

      expect(mockSupabaseFrom).not.toHaveBeenCalled();
    });

    it('does nothing when supporterId is null', async () => {
      await sessionTracking.linkSessionToSupporter('session-123', null);

      expect(mockSupabaseFrom).not.toHaveBeenCalled();
    });
  });
});
