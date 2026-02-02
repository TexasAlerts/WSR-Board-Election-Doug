/**
 * Name formatting utilities for public-facing displays.
 * Formats names as "First L." to protect user privacy while maintaining personalization.
 *
 * @module formatDisplayName
 */

/**
 * Format a name as "First L." for public display.
 * Uses only the first name and last initial to protect user privacy.
 *
 * @param {string} firstName - User's first name
 * @param {string} lastName - User's last name
 * @returns {string} Formatted name like "John D." or "Anonymous" if no first name
 *
 * @example
 * formatDisplayName('John', 'Doe'); // 'John D.'
 * formatDisplayName('Jane', ''); // 'Jane'
 * formatDisplayName('', 'Smith'); // 'Anonymous'
 */
export function formatDisplayName(firstName, lastName) {
  if (!firstName) return 'Anonymous';
  const lastInitial = lastName ? lastName.charAt(0).toUpperCase() + '.' : '';
  return `${firstName} ${lastInitial}`.trim();
}

/**
 * Extract and format a display name from a user object.
 * Handles various user object shapes (supporters, verified voters, etc.)
 * and extracts the appropriate name fields.
 *
 * @param {Object} user - User object (supporter or verified voter)
 * @param {string} [user.first_name] - User's first name
 * @param {string} [user.last_name] - User's last name
 * @param {string} [user.last_initial] - User's last initial
 * @param {string} [user.name] - User's full name
 * @returns {string} Formatted display name like "John D." or "Anonymous"
 *
 * @example
 * getUserDisplayName({ first_name: 'John', last_name: 'Doe' }); // 'John D.'
 * getUserDisplayName({ first_name: 'Jane', last_initial: 'S' }); // 'Jane S.'
 * getUserDisplayName({ name: 'Bob Smith' }); // 'Bob S.'
 * getUserDisplayName(null); // 'Anonymous'
 */
export function getUserDisplayName(user) {
  if (!user) return 'Anonymous';

  if (user.first_name && user.last_name) {
    return formatDisplayName(user.first_name, user.last_name);
  }

  if (user.first_name && user.last_initial) {
    return `${user.first_name} ${user.last_initial}.`;
  }

  if (user.name) {
    const parts = user.name.trim().split(/\s+/);
    const firstName = parts[0];
    const lastName = parts.length > 1 ? parts[parts.length - 1] : '';
    return formatDisplayName(firstName, lastName);
  }

  return 'Anonymous';
}

/**
 * Parse a full name string into separate first name and last initial.
 * Extracts the first word as first name and the last word's initial as last initial.
 *
 * @param {string} name - Full name string (e.g., "John Doe" or "Jane Mary Smith")
 * @returns {{first_name: string, last_initial: string}} Parsed name parts
 * @returns {string} return.first_name - First word of the name
 * @returns {string} return.last_initial - First letter of the last word (uppercase)
 *
 * @example
 * parseNameParts('John Doe'); // { first_name: 'John', last_initial: 'D' }
 * parseNameParts('Jane Mary Smith'); // { first_name: 'Jane', last_initial: 'S' }
 * parseNameParts('Bob'); // { first_name: 'Bob', last_initial: '' }
 * parseNameParts(''); // { first_name: '', last_initial: '' }
 */
export function parseNameParts(name) {
  if (!name) return { first_name: '', last_initial: '' };
  const parts = name.trim().split(/\s+/);
  const first_name = parts[0];
  const last_initial = parts.length > 1 ? parts[parts.length - 1].charAt(0).toUpperCase() : '';
  return { first_name, last_initial };
}
