import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { listDescargas, createDescarga } from '@/lib/descargas'
import { CATALOGO_WINDOWS } from '@/lib/descargas-catalogo'
import { ADMIN_COOKIE, verifyAdminToken } from '@/lib/admin-session'

export const dynamic = 'force-dynamic'

// Admin: carga el catálogo de descargas para Windows. No borra nada y
// omite las que ya existen (mismo link), así que se puede tocar más de una vez.
export async function POST(req: NextRequest) {
  if (!(await verifyAdminToken(req.cookies.get(ADMIN_COOKIE)?.value))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }
  try {
    const existentes = new Set((await listDescargas()).map(d => d.linkDescarga))
    let agregadas = 0
    let omitidas = 0
    for (const item of CATALOGO_WINDOWS) {
      if (existentes.has(item.linkDescarga)) { omitidas++; continue }
      await createDescarga(item)
      agregadas++
    }
    revalidatePath('/')
    return NextResponse.json({ agregadas, omitidas })
  } catch {
    return NextResponse.json({ error: 'No se pudo cargar el catálogo' }, { status: 500 })
  }
}
