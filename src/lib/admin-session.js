import { randomUUID } from 'crypto';

const sessions = new Set();

export function createSession() {
  const token = randomUUID();
  sessions.add(token);
  return token;
}

export function requireAdmin(req) {
  const cookie = req.cookies.get('admin_session');
  return cookie && sessions.has(cookie.value);
}
