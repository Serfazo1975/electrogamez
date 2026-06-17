import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const token = req.cookies.get('eg_portal_session')?.value
  if (token) {
    await prisma.portalSession.deleteMany({ where: { token } }).catch(() => {})
  }
  const res = NextResponse.json({ ok: true })
  res.cookies.set('eg_portal_session', '', { maxAge: 0, path: '/' })
  return res
}
