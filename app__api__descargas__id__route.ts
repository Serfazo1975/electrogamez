import { NextRequest, NextResponse } from 'next/server'
import { updateDescarga, deleteDescarga } from '@/lib/descargas'
import { ADMIN_COOKIE, verifyAdminToken } from '@/lib/admin-session'

export const dynamic = 'force-dynamic'

async function isAdmin(req: NextRequest) {
  return verifyAdminToken(req.cookies.get(ADMIN_COOKIE)?.value)
}

// Admin: editar una descarga
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
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
  if (!(await isAdmin(req))) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  try {
    await deleteDescarga(params.id)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'No se pudo eliminar' }, { status: 500 })
  }
}
