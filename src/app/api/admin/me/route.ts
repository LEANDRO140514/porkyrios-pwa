import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';

// Lets the /admin page know whether the current session belongs to an admin
export async function GET(request: NextRequest) {
  const check = await requireAdmin(request);
  if (!check.ok) {
    return NextResponse.json({ isAdmin: false }, { status: check.status });
  }
  return NextResponse.json({ isAdmin: true, email: check.user.email });
}
