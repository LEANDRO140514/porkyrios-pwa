import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

/**
 * Admins are the users whose email is listed in ADMIN_EMAILS (comma-separated).
 * An empty or missing list means nobody is an admin.
 */
export function isAdminEmail(email: string | null | undefined, adminEmails = process.env.ADMIN_EMAILS): boolean {
  if (!email || !adminEmails) {
    return false;
  }
  const allowed = adminEmails
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.trim().toLowerCase());
}

export type AdminCheck =
  | { ok: true; user: { id: string; email: string } }
  | { ok: false; status: 401 | 403 };

/**
 * Validate the better-auth session (cookie or Bearer token) on the request
 * and require its email to be in ADMIN_EMAILS.
 */
export async function requireAdmin(request: Request): Promise<AdminCheck> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return { ok: false, status: 401 };
  }
  if (!isAdminEmail(session.user.email)) {
    return { ok: false, status: 403 };
  }
  return { ok: true, user: { id: session.user.id, email: session.user.email } };
}

/**
 * Route guard: returns a 401/403 response to send back, or null when the
 * request comes from an admin.
 *   const denied = await adminOnly(request);
 *   if (denied) return denied;
 */
export async function adminOnly(request: Request): Promise<NextResponse | null> {
  const check = await requireAdmin(request);
  if (check.ok) {
    return null;
  }
  return NextResponse.json(
    { error: check.status === 401 ? 'No autenticado' : 'No autorizado' },
    { status: check.status }
  );
}
