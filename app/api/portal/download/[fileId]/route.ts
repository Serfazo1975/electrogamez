import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPortalSession } from '@/lib/portal-auth'

export async function GET(req: NextRequest, { params }: { params: { fileId: string } }) {
  const token = req.cookies.get('eg_portal_session')?.value
  const session = await getPortalSession(token)
  if (!session) {
    return NextResponse.redirect(new URL('/portal/login?next=' + req.url, req.url))
  }
  const file = await prisma.projectFile.findUnique({
    where: { id: params.fileId },
    include: { project: true },
  })
  if (!file) return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 404 })
  await prisma.downloadLog.create({
    data: { userId: session.user.id, projectId: file.projectId, fileId: file.id },
  })
  return NextResponse.redirect(file.fileUrl)
}
