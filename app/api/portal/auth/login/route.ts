import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  const user = await prisma.portalUser.findFirst({
    where: { OR: [{ email }, { username: email }], active: true },
  })
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })
  }
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  const session = await prisma.portalSession.create({
    data: { userId: user.id, expiresAt },
  })
  const res = NextResponse.json({ ok: true, username: user.username, role: user.role })
  res.cookies.set('eg_portal_session', session.token, {
    httpOnly: true,
    path: '/',
    expires: expiresAt,
    sameSite: 'lax',
  })
  return res
}
