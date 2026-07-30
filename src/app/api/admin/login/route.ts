import { NextResponse } from 'next/server';
import { isAdminAuthorized } from '@/lib/adminAuth';

export async function POST(request: Request) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ success: true });
}
