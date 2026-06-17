import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPortalSession } from '@/lib/portal-auth'

async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get('eg_portal_session')?.value
  const session = await getPortalSession(token)
  if (!session || session.user.role !== 'admin') return null
  return session
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin(req)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  await prisma.project.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin(req)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  const data = await req.json()
  const project = await prisma.project.update({
    where: { id: params.id },
    data: {
      title: data.title,
      description: data.description,
      thumbnail: data.thumbnail,
      version: data.version,
      categoryId: data.categoryId,
      tags: data.tags || [],
      featured: data.featured,
      published: data.published,
    },
  })
  return NextResponse.json(project)
}
