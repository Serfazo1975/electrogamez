import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const project = await prisma.project.findUnique({
    where: { slug: params.slug, published: true },
    include: { category: true, files: true, _count: { select: { downloads: true } } },
  })
  if (!project) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  await prisma.project.update({ where: { id: project.id }, data: { views: { increment: 1 } } })
  return NextResponse.json(project)
}
