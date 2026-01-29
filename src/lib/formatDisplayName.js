/**
 * Format display name as "First L." for public-facing displays.
 */
export function formatDisplayName(firstName, lastName) {
  if (!firstName) return 'Anonymous';
  const lastInitial = lastName ? lastName.charAt(0).toUpperCase() + '.' : '';
  return `${firstName} ${lastInitial}`.trim();
}

/**
 * Get display name from a user object (supporter or verified voter).
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
 * Parse a full name into first_name and last_initial.
 */
export function parseNameParts(name) {
  if (!name) return { first_name: '', last_initial: '' };
  const parts = name.trim().split(/\s+/);
  const first_name = parts[0];
  const last_initial = parts.length > 1 ? parts[parts.length - 1].charAt(0).toUpperCase() : '';
  return { first_name, last_initial };
}
