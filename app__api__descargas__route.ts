import { NextRequest, NextResponse } from 'next/server'
import { listDescargas, createDescarga } from '@/lib/descargas'
import { ADMIN_COOKIE, verifyAdminToken } from '@/lib/admin-session'

export const dynamic = 'force-dynamic'

async function isAdmin(req: NextRequest) {
  return verifyAdminToken(req.cookies.get(ADMIN_COOKIE)?.value)
}

// Público: lista de descargas para la web
export async function GET() {
  try {
    return NextResponse.json(await listDescargas())
  } catch {
    return NextResponse.json([])
  }
}

// Admin: crear una descarga
export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  const d = await req.json()
  if (!d.titulo || !d.linkDescarga) {
    return NextResponse.json({ error: 'Faltan título o link' }, { status: 400 })
  }
  try {
    const res = await createDescarga(d)
    return NextResponse.json(res)
  } catch {
    return NextResponse.json({ error: 'No se pudo guardar' }, { status: 500 })
  }
}
