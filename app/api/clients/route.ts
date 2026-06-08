import { NextRequest, NextResponse } from 'next/server'
import { dbReady, fmtDate } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!dbReady()) return NextResponse.json({ error: 'no-db' }, { status: 503 })
  try {
    const { prisma } = await import('@/lib/prisma')
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { repairs: true } },
        repairs: { orderBy: { receivedAt: 'desc' }, take: 1, select: { receivedAt: true } },
      },
    })
    return NextResponse.json(clients.map(c => ({
      id: c.id,
      name: c.name,
      phone: c.phone ?? '',
      email: c.email ?? '',
      repairs: c._count.repairs,
      lastRepair: c.repairs[0] ? fmtDate(c.repairs[0].receivedAt) : '—',
    })))
  } catch {
    return NextResponse.json({ error: 'fail' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!dbReady()) return NextResponse.json({ error: 'no-db' }, { status: 503 })
  try {
    const { prisma } = await import('@/lib/prisma')
    const body = await req.json()
    const client = await prisma.client.create({
      data: {
        name: (body.name ?? '').trim() || 'Sin nombre',
        phone: body.phone ? String(body.phone).trim() : null,
        email: body.email ? String(body.email).trim() : null,
      },
    })
    return NextResponse.json({
      id: client.id,
      name: client.name,
      phone: client.phone ?? '',
      email: client.email ?? '',
      repairs: 0,
      lastRepair: fmtDate(client.createdAt),
    })
  } catch {
    return NextResponse.json({ error: 'fail' }, { status: 500 })
  }
}
