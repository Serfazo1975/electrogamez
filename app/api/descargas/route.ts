import { NextRequest, NextResponse } from 'next/server'
import { listDescargas, createDescarga } from '@/lib/descargas'

export const dynamic = 'force-dynamic'

function isAdmin(req: NextRequest) {
  return req.cookies.get('eg_admin')?.value === 'true'
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
  if (!isAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
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
