import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

function isAdmin(req: NextRequest) {
  return req.cookies.get('eg_admin')?.value === 'true'
}

// Público: lista de descargas para la web
export async function GET() {
  try {
    const items = await prisma.appDownload.findMany({ orderBy: { fechaAgregado: 'desc' } })
    return NextResponse.json(items)
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
  const item = await prisma.appDownload.create({
    data: {
      titulo: d.titulo,
      descripcion: d.descripcion || '',
      imagen: d.imagen || '',
      linkDescarga: d.linkDescarga,
      sitioFuente: d.sitioFuente || '',
      categoria: d.categoria || 'Utilidades',
      destacado: !!d.destacado,
    },
  })
  return NextResponse.json(item)
}
