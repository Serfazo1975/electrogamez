import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_COOKIE, ADMIN_TTL_SECONDS, createAdminToken } from '@/lib/admin-session'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  // Sin contraseña configurada en el servidor NO se permite el acceso (no hay clave por defecto)
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) {
    return NextResponse.json(
      { error: 'Falta configurar ADMIN_PASSWORD en el servidor' },
      { status: 500 }
    )
  }

  let password = ''
  try {
    const body = await request.json()
    password = typeof body?.password === 'string' ? body.password : ''
  } catch {
    /* cuerpo inválido */
  }

  if (password !== adminPassword) {
    await new Promise((r) => setTimeout(r, 700)) // frena intentos por fuerza bruta
    return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
  }

  const token = await createAdminToken()
  if (!token) {
    return NextResponse.json({ error: 'No se pudo crear la sesión' }, { status: 500 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: ADMIN_TTL_SECONDS,
    path: '/',
  })
  return response
}
