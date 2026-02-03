import { sanitizeText, sanitizeObject } from '../lib/sanitize';

describe('sanitizeText', () => {
  it('strips HTML tags from input', () => {
    // DOMPurify completely removes script tags and their content for security
    expect(sanitizeText('<script>alert("xss")</script>Hello')).toBe('Hello');
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

  // DOMPurify-specific XSS protection tests
  it('removes script tags with various encodings', () => {
    // DOMPurify removes script tags and their content completely
    expect(sanitizeText('<script>alert(1)</script>')).toBe('');
    expect(sanitizeText('<SCRIPT>alert(1)</SCRIPT>')).toBe('');
  });

  it('removes event handlers', () => {
    expect(sanitizeText('<img src=x onerror=alert(1)>')).toBe('');
    expect(sanitizeText('<div onclick=alert(1)>Click</div>')).toBe('Click');
  });

  it('removes javascript: protocol', () => {
    expect(sanitizeText('<a href="javascript:alert(1)">Link</a>')).toBe('Link');
  });

  it('removes data URIs with scripts', () => {
    // DOMPurify completely removes dangerous content
    const result = sanitizeText('<img src="data:text/html,<script>alert(1)</script>">');
    expect(result).toBe('');
  });

  it('removes iframe tags', () => {
    expect(sanitizeText('<iframe src="evil.com"></iframe>')).toBe('');
  });

  it('removes object and embed tags', () => {
    expect(sanitizeText('<object data="evil.swf"></object>')).toBe('');
    expect(sanitizeText('<embed src="evil.swf">')).toBe('');
  });

  it('handles SVG-based XSS attempts', () => {
    expect(sanitizeText('<svg onload=alert(1)></svg>')).toBe('');
  });

  it('removes style tags with malicious content', () => {
    // DOMPurify removes style tags and their content
    expect(sanitizeText('<style>body{background:url("javascript:alert(1)")}</style>')).toBe('');
  });

  it('preserves safe special characters', () => {
    expect(sanitizeText('Price: $100 & Free shipping!')).toBe('Price: $100 & Free shipping!');
    expect(sanitizeText('Contact: name@email.com')).toBe('Contact: name@email.com');
  });

  it('handles unicode and emoji correctly', () => {
    expect(sanitizeText('Hello 👋 World 🌍')).toBe('Hello 👋 World 🌍');
    expect(sanitizeText('Café résumé naïve')).toBe('Café résumé naïve');
  });

  it('handles malformed HTML gracefully', () => {
    // DOMPurify removes the malicious content
    expect(sanitizeText('<<script>alert(1)</script>')).toBe('&lt;');
    expect(sanitizeText('<div><span>Unclosed tags')).toBe('Unclosed tags');
  });

  it('removes all attributes when stripping tags', () => {
    expect(sanitizeText('<div class="test" id="foo" data-attr="bar">Content</div>')).toBe(
      'Content'
    );
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

  it('sanitizes nested XSS attempts in object values', () => {
    const result = sanitizeObject({
      title: '<script>alert("xss")</script>My Title',
      description: '<img src=x onerror=alert(1)>Description',
      safe: 'Normal text',
    });
    expect(result).toEqual({
      title: 'My Title', // DOMPurify removes script tags and content
      description: 'Description',
      safe: 'Normal text',
    });
  });
});
