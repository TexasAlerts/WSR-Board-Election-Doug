/**
 * Donation Track API Tests
 *
 * Tests the /api/donation/track endpoint logic.
 * Catches bugs like:
 * - Using getVisitorSessionId instead of getOrCreateVisitorSession
 * - Missing CSRF protection
 * - Invalid request validation
 *
 * Note: Uses direct code inspection since NextRequest isn't available in jsdom.
 */

import fs from 'fs';
import path from 'path';

describe('/api/donation/track route code inspection', () => {
  let routeCode;

  beforeAll(() => {
    // Read the actual route file
    const routePath = path.join(
      __dirname,
      '../app/api/donation/track/route.js'
    );
    routeCode = fs.readFileSync(routePath, 'utf-8');
  });

  describe('Session Creation (P2 Bug Fix)', () => {
    it('imports getOrCreateVisitorSession, NOT getVisitorSessionId', () => {
      // The P2 bug was using getVisitorSessionId instead of getOrCreateVisitorSession
      // getVisitorSessionId only reads existing session, doesn't create new ones
      expect(routeCode).toContain('getOrCreateVisitorSession');
      expect(routeCode).not.toMatch(/import.*getVisitorSessionId.*from/);
    });

    it('calls getOrCreateVisitorSession with request parameter', () => {
      // Must pass request to create session with proper device info
      expect(routeCode).toMatch(/getOrCreateVisitorSession\s*\(\s*request\s*\)/);
    });

    it('extracts sessionId from result object (not .id)', () => {
      // The function returns { sessionId, isNew }, not { id, isNew }
      // Must use .sessionId, not .id
      expect(routeCode).toMatch(/visitorSession\?\.sessionId|visitorSession\.sessionId/);
      // Should NOT use .id (that's the bug)
      expect(routeCode).not.toMatch(/visitorSession\?\.id[^a-zA-Z]|visitorSession\.id[^a-zA-Z]/);
    });
  });

  describe('CSRF Protection', () => {
    it('imports withCSRF wrapper', () => {
      expect(routeCode).toContain("import { withCSRF }");
    });

    it('wraps POST handler with withCSRF', () => {
      expect(routeCode).toMatch(/export\s+const\s+POST\s*=\s*withCSRF\s*\(/);
    });
  });

  describe('Request Validation', () => {
    it('uses Zod for validation', () => {
      expect(routeCode).toContain("import { z } from 'zod'");
    });

    it('validates eventType as enum', () => {
      expect(routeCode).toContain("z.enum");
      expect(routeCode).toContain("'page_view'");
      expect(routeCode).toContain("'amount_selected'");
      expect(routeCode).toContain("'donate_clicked'");
    });

    it('validates selectedAmount as positive integer', () => {
      expect(routeCode).toMatch(/selectedAmount.*z\.number\(\)\.int\(\)\.positive\(\)/);
    });
  });

  describe('Error Handling', () => {
    it('imports logError for error tracking', () => {
      expect(routeCode).toContain('logError');
    });

    it('has try-catch block', () => {
      expect(routeCode).toContain('try {');
      expect(routeCode).toContain('} catch');
    });

    it('returns 500 status on error', () => {
      expect(routeCode).toContain('status: 500');
    });
  });

  describe('Tracking Call', () => {
    it('imports trackDonationEvent', () => {
      expect(routeCode).toContain('trackDonationEvent');
    });

    it('passes visitorSessionId to tracking', () => {
      expect(routeCode).toMatch(/trackDonationEvent\s*\(\s*\{[\s\S]*visitorSessionId/);
    });

    it('passes supporterId to tracking', () => {
      expect(routeCode).toMatch(/trackDonationEvent\s*\(\s*\{[\s\S]*supporterId/);
    });
  });
});

describe('Donation tracking code correctness', () => {
  it('does not have the P2 bug pattern (getVisitorSessionId without create)', () => {
    const routePath = path.join(
      __dirname,
      '../app/api/donation/track/route.js'
    );
    const routeCode = fs.readFileSync(routePath, 'utf-8');

    // The bug was:
    // const visitorSessionId = await getVisitorSessionId();
    // This only reads, doesn't create sessions

    // Correct pattern is:
    // const visitorSession = await getOrCreateVisitorSession(request);
    // const visitorSessionId = visitorSession?.id || null;

    // Should NOT have direct getVisitorSessionId call
    expect(routeCode).not.toMatch(
      /const\s+visitorSessionId\s*=\s*await\s+getVisitorSessionId\s*\(/
    );

    // Should have getOrCreateVisitorSession call
    expect(routeCode).toMatch(/await\s+getOrCreateVisitorSession\s*\(\s*request\s*\)/);
  });
});
