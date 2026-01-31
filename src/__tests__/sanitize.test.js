import { sanitizeText, sanitizeObject } from '../lib/sanitize';

describe('sanitizeText', () => {
  it('strips HTML tags from input', () => {
    expect(sanitizeText('<script>alert("xss")</script>Hello')).toBe('alert("xss")Hello');
  });

  it('strips nested HTML tags', () => {
    expect(sanitizeText('<b><i>Bold italic</i></b>')).toBe('Bold italic');
  });

  it('trims whitespace', () => {
    expect(sanitizeText('  hello world  ')).toBe('hello world');
  });

  it('returns empty string for non-string input', () => {
    expect(sanitizeText(null)).toBe('');
    expect(sanitizeText(undefined)).toBe('');
    expect(sanitizeText(123)).toBe('');
  });

  it('passes through clean text unchanged', () => {
    expect(sanitizeText('Doug Charles for Prosper')).toBe('Doug Charles for Prosper');
  });
});

describe('sanitizeObject', () => {
  it('sanitizes all string values', () => {
    const result = sanitizeObject({
      name: '<b>Doug</b>',
      email: 'doug@test.com',
      count: 5,
    });
    expect(result).toEqual({
      name: 'Doug',
      email: 'doug@test.com',
      count: 5,
    });
  });
});
