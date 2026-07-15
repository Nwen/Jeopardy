import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const grid = await prisma.grid.findUnique({ where: { id: params.id } });
  if (!grid) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({
    id: grid.id,
    name: grid.name,
    categories: JSON.parse(grid.data),
    createdAt: grid.createdAt,
    updatedAt: grid.updatedAt,
  });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { name, categories } = await request.json();
  const grid = await prisma.grid.update({
    where: { id: params.id },
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

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await prisma.grid.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
