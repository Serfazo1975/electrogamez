import { NextRequest, NextResponse } from 'next/server'
import { dbReady } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

// Actualizar stock de un repuesto
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!dbReady()) return NextResponse.json({ error: 'no-db' }, { status: 503 })
  try {
    const { prisma } = await import('@/lib/prisma')
    const body = await req.json()
    const stock = Math.max(0, parseInt(body.stock))
    if (!Number.isFinite(stock)) {
      return NextResponse.json({ error: 'stock inválido' }, { status: 400 })
    }
    await prisma.part.update({ where: { id: params.id }, data: { stock } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'fail' }, { status: 500 })
  }
}

// Eliminar un repuesto
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!dbReady()) return NextResponse.json({ error: 'no-db' }, { status: 503 })
  try {
    const { prisma } = await import('@/lib/prisma')
    await prisma.part.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'fail' }, { status: 500 })
  }
}
