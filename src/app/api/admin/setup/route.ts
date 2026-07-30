import { NextResponse } from 'next/server';
import { isAdminConfigured, setDbAdminPassword } from '@/lib/adminAuth';
import { hashPassword } from '@/lib/passwordHash';

export async function POST(request: Request) {
  if (await isAdminConfigured()) {
    return NextResponse.json({ error: 'Already configured' }, { status: 409 });
  }

  const { password } = await request.json();
  if (typeof password !== 'string' || password.length < 4) {
    return NextResponse.json({ error: 'Password too short' }, { status: 400 });
  }

  await setDbAdminPassword(await hashPassword(password));
  console.log('[admin-setup] admin password created and stored in database');
  return NextResponse.json({ success: true });
}
