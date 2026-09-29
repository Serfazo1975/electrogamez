import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_COOKIE, ADMIN_TTL_SECONDS, createAdminToken } from '@/lib/admin-session'

export const dynamic = 'force-dynamic'

// ============================================================
// NUEVO: bloqueo por intentos fallidos (guardado en la base, así
// vale para todas las instancias de Netlify).
// 5 contraseñas incorrectas desde la misma IP en 15 min → 15 min bloqueado.
// Si la base no responde, el login sigue funcionando como antes.
// ============================================================
const MAX_FALLOS = 5
const VENTANA_MIN = 15

function ipDe(req: NextRequest) {
  return (request_ip(req) || 'desconocida').slice(0, 64)
}
function request_ip(req: NextRequest) {
  return (req.headers.get('x-nf-client-connection-ip')
    || req.headers.get('x-forwarded-for')?.split(',')[0]
    || '').trim()
}

async function db() {
  const url = process.env.DATABASE_URL
  if (!url || url.includes('file:')) return null
  try {
    const { prisma } = await import('@/lib/prisma')
    await prisma.$executeRawUnsafe(
      `CREATE TABLE IF NOT EXISTS login_intentos (id SERIAL PRIMARY KEY, ip TEXT NOT NULL, creado TIMESTAMPTZ DEFAULT NOW())`
    )
    return prisma
  } catch { return null }
}

async function fallosRecientes(prisma: any, ip: string): Promise<number> {
  try {
    const r: any[] = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*)::int AS n FROM login_intentos WHERE ip = $1 AND creado > NOW() - INTERVAL '${VENTANA_MIN} minutes'`, ip
    )
    return r[0]?.n ?? 0
  } catch { return 0 }
}

export async function POST(request: NextRequest) {
  // Sin contraseña configurada en el servidor NO se permite el acceso (no hay clave por defecto)
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) {
    return NextResponse.json(
      { error: 'Falta configurar ADMIN_PASSWORD en el servidor' },
      { status: 500 }
    )
  }

  const ip = ipDe(request)
  const prisma = await db()
  if (prisma && (await fallosRecientes(prisma, ip)) >= MAX_FALLOS) {
    return NextResponse.json(
      { error: `Demasiados intentos fallidos. Esperá ${VENTANA_MIN} minutos y volvé a probar.` },
      { status: 429 }
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
    if (prisma) {
      try {
        await prisma.$executeRawUnsafe(`INSERT INTO login_intentos (ip) VALUES ($1)`, ip)
        // limpieza de registros viejos
        await prisma.$executeRawUnsafe(`DELETE FROM login_intentos WHERE creado < NOW() - INTERVAL '1 day'`)
      } catch { /* sin base: sigue funcionando */ }
    }
    await new Promise((r) => setTimeout(r, 700)) // frena intentos por fuerza bruta
    return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
  }

  // Login correcto: se borran los fallos de esta IP
  if (prisma) { try { await prisma.$executeRawUnsafe(`DELETE FROM login_intentos WHERE ip = $1`, ip) } catch {} }

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
