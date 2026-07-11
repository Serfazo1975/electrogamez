import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

function isAdmin(req: NextRequest) {
  return req.cookies.get('eg_admin')?.value === 'true'
}

// Admin: editar una descarga
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  const d = await req.json()
  const item = await prisma.appDownload.update({
    where: { id: params.id },
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

// Admin: eliminar una descarga
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  await prisma.appDownload.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
