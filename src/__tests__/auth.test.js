import { generateToken, isAdmin, isSuperAdmin } from '../lib/auth';

describe('generateToken', () => {
  it('generates a token of specified length', () => {
    const token = generateToken(32);
    expect(token).toHaveLength(32);
  });

  it('generates different tokens each call', () => {
    const t1 = generateToken(32);
    const t2 = generateToken(32);
    expect(t1).not.toBe(t2);
  });

  it('uses only alphanumeric characters', () => {
    const token = generateToken(100);
    expect(token).toMatch(/^[A-Za-z0-9]+$/);
  });
});

describe('isAdmin', () => {
  it('returns true for admin role', () => {
    expect(isAdmin({ role: 'admin' })).toBe(true);
  });

  it('returns true for super_admin role', () => {
    expect(isAdmin({ role: 'super_admin' })).toBe(true);
  });

  it('returns false for regular user', () => {
    expect(isAdmin({ role: 'user' })).toBe(false);
  });

  it('returns false for null', () => {
    expect(isAdmin(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isAdmin(undefined)).toBe(false);
  });
});

describe('isSuperAdmin', () => {
  it('returns true for super_admin', () => {
    expect(isSuperAdmin({ role: 'super_admin' })).toBe(true);
  });

  it('returns false for admin', () => {
    expect(isSuperAdmin({ role: 'admin' })).toBe(false);
  });
});
