import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('categoria')
  const search = searchParams.get('q')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 12

  const where: Record<string, unknown> = { published: true }
  if (category) where.category = { slug: category }
  if (search) where.title = { contains: search, mode: 'insensitive' }

  const [total, projects] = await Promise.all([
    prisma.project.count({ where }),
    prisma.project.findMany({
      where,
      include: { category: true, _count: { select: { files: true, downloads: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  return NextResponse.json({ projects, total, page, pages: Math.ceil(total / limit) })
}
