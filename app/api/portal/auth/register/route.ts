import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

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

  // Definir si este usuario debe ser administrador:
  //  - SOLO si su email coincide con PORTAL_ADMIN_EMAIL (configurable en Netlify)
  //    y todavía no hay ningún administrador.
  //  ANTES: si no existía ningún admin, el primero que se registraba (cualquier
  //  persona de internet) quedaba como administrador. Eso se quitó.
  const adminEmail = process.env.PORTAL_ADMIN_EMAIL?.trim().toLowerCase()
  const adminCount = await prisma.portalUser.count({ where: { role: 'admin' } })
  const isAdmin = !!adminEmail && email.trim().toLowerCase() === adminEmail && adminCount === 0
  const role = isAdmin ? 'admin' : 'member'

  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.portalUser.create({
    data: { username, email, password: hashed, role },
  })
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  const session = await prisma.portalSession.create({
    // Token aleatorio fuerte (antes: cuid, que es más fácil de adivinar)
    data: { userId: user.id, expiresAt, token: randomBytes(32).toString('hex') },
  })
  const res = NextResponse.json({ ok: true, username: user.username, role: user.role })
  res.cookies.set('eg_portal_session', session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // solo por HTTPS
    path: '/',
    expires: expiresAt,
    sameSite: 'lax',
  })
  return res
}
