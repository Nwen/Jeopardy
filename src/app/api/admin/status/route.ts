import { NextResponse } from 'next/server';

export async function GET() {
  const required = Boolean(process.env.ADMIN_PASSWORD);
  console.log(`[admin-status] ADMIN_PASSWORD is ${required ? 'set' : 'not set'}`);
  return NextResponse.json({ required });
}
