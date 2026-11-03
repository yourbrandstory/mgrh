import type { AdminRole, SessionUser } from './types';

export const ADMIN_SESSION_KEY = 'mgrh-admin-user';

function isRole(value: unknown): value is AdminRole {
  return value === 'Admin' || value === 'Editor';
}

export function readAdminSession(): SessionUser | null {
  try {
    const raw = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { name?: unknown; role?: unknown };
    if (typeof parsed.name !== 'string' || !isRole(parsed.role)) return null;
    return { name: parsed.name.trim() || 'Hospital staff', role: parsed.role };
  } catch {
    return null;
  }
}

export function writeAdminSession(user: SessionUser): void {
  try {
    sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(user));
  } catch {
    /* private browsing can block storage; the in-memory session still works */
  }
}

export function clearAdminSession(): void {
  try {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export function adminRequestHeaders(): Record<string, string> {
  const user = readAdminSession();
  if (!user) throw new Error('Sign in again to make changes.');
  return {
    'content-type': 'application/json',
    'x-admin-name': encodeURIComponent(user.name),
    'x-admin-role': user.role,
  };
}
