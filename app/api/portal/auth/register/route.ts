import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const { username, email, password } = await req.json()
  if (!username || !email || !password) {
    return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })
  }
  const exists = await prisma.portalUser.findFirst({
    where: { OR: [{ email }, { username }] },
  })
  if (exists) {
    return NextResponse.json({ error: 'Usuario o email ya registrado' }, { status: 409 })
  }
  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.portalUser.create({
    data: { username, email, password: hashed },
  })
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
