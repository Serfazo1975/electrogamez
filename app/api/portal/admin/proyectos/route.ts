import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPortalSession } from '@/lib/portal-auth'

async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get('eg_portal_session')?.value
  const session = await getPortalSession(token)
  if (!session || session.user.role !== 'admin') return null
  return session
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin(req)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const data = await req.json()
  const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const project = await prisma.project.create({
    data: {
      title: data.title,
      slug,
      description: data.description,
      thumbnail: data.thumbnail || null,
      version: data.version || null,
      categoryId: data.categoryId,
      tags: data.tags || [],
      featured: data.featured || false,
      published: data.published ?? true,
      files: {
        create: (data.files || []).map((f: { name: string; fileUrl: string; fileSize?: string; platform?: string }) => ({
          name: f.name,
          fileUrl: f.fileUrl,
          fileSize: f.fileSize || null,
          platform: f.platform || null,
        })),
      },
    },
    include: { files: true, category: true },
  })
  return NextResponse.json(project)
}

export async function GET(req: NextRequest) {
  const session = await requireAdmin(req)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  const projects = await prisma.project.findMany({
    include: { category: true, _count: { select: { files: true, downloads: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(projects)
}
