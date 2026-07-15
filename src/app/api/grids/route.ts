import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const grids = await prisma.grid.findMany({
    orderBy: { updatedAt: 'desc' },
    select: { id: true, name: true, createdAt: true, updatedAt: true },
  });
  return NextResponse.json(grids);
}

export async function POST(request: Request) {
  const { name, categories } = await request.json();
  const grid = await prisma.grid.create({
    data: { name, data: JSON.stringify(categories) },
  });
  return NextResponse.json({
    id: grid.id,
    name: grid.name,
    categories: JSON.parse(grid.data),
    createdAt: grid.createdAt,
    updatedAt: grid.updatedAt,
  });
}
