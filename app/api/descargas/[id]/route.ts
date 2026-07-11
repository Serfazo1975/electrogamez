import { NextRequest, NextResponse } from 'next/server'
import { updateDescarga, deleteDescarga } from '@/lib/descargas'

export const dynamic = 'force-dynamic'

function isAdmin(req: NextRequest) {
  return req.cookies.get('eg_admin')?.value === 'true'
}

// Admin: editar una descarga
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  const d = await req.json()
  try {
    await updateDescarga(params.id, d)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'No se pudo actualizar' }, { status: 500 })
  }
}

// Admin: eliminar una descarga
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  try {
    await deleteDescarga(params.id)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'No se pudo eliminar' }, { status: 500 })
  }
}
