import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ required: Boolean(process.env.ADMIN_PASSWORD) });
}
