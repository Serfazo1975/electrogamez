import { NextRequest, NextResponse } from 'next/server'
import { dbReady } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

const VALID = ['received','diagnosing','waiting_parts','in_progress','ready','completed','delivered','cancelled']

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!dbReady()) return NextResponse.json({ error: 'no-db' }, { status: 503 })
  try {
    const { prisma } = await import('@/lib/prisma')
    const { status, note } = await req.json()
    if (!VALID.includes(status)) return NextResponse.json({ error: 'estado inválido' }, { status: 400 })
    await prisma.repair.update({
      where: { id: params.id },
      data: {
        status,
        ...(status === 'completed' || status === 'delivered' ? { completedAt: new Date() } : {}),
        statusHistory: { create: { status, note: note || null } },
      },
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'fail' }, { status: 500 })
  }
}
