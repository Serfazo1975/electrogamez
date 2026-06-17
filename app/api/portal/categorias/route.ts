import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const cats = await prisma.category.findMany({
    orderBy: { order: 'asc' },
    include: { _count: { select: { projects: { where: { published: true } } } } },
  })
  return NextResponse.json(cats)
}
