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
  const { name, icon, description } = await req.json()
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const cat = await prisma.category.create({ data: { name, slug, icon, description } })
  return NextResponse.json(cat)
}
