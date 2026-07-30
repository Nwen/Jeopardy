import { NextResponse } from 'next/server';
import { isAdminConfigured } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const required = await isAdminConfigured();
  console.log(`[admin-status] admin password is ${required ? 'configured' : 'not configured'}`);
  return NextResponse.json({ required, needsSetup: !required });
}
