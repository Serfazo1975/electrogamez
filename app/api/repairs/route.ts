import { NextRequest, NextResponse } from 'next/server'
import { dbReady, fmtMoney, fmtDate, parseMoney } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

type RepairWithClient = {
  id: string
  trackingCode: string
  deviceType: string
  deviceBrand: string | null
  deviceModel: string | null
  issueDescription: string
  status: string
  priority: string
  estimatedCost: number | null
  receivedAt: Date
  client: { name: string } | null
}

function toDTO(r: RepairWithClient) {
  return {
    id: r.id,
    code: r.trackingCode,
    client: r.client?.name ?? '',
    device: [r.deviceBrand, r.deviceModel].filter(Boolean).join(' ') || r.deviceType,
    type: r.deviceType,
    issue: r.issueDescription,
    status: r.status,
    priority: r.priority,
    date: fmtDate(r.receivedAt),
    cost: fmtMoney(r.estimatedCost),
  }
}

export async function GET() {
  if (!dbReady()) return NextResponse.json({ error: 'no-db' }, { status: 503 })
  try {
    const { prisma } = await import('@/lib/prisma')
    const repairs = await prisma.repair.findMany({
      orderBy: { receivedAt: 'desc' },
      include: { client: { select: { name: true } } },
    })
    return NextResponse.json(repairs.map(toDTO))
  } catch {
    return NextResponse.json({ error: 'fail' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!dbReady()) return NextResponse.json({ error: 'no-db' }, { status: 503 })
  try {
    const { prisma } = await import('@/lib/prisma')
    const body = await req.json()
    const name = (body.client ?? '').trim() || 'Sin nombre'
    const phone = body.phone ? String(body.phone).trim() : null

    // Buscar cliente existente por teléfono o por nombre; si no, crearlo.
    let client =
      (phone ? await prisma.client.findFirst({ where: { phone } }) : null) ??
      (await prisma.client.findFirst({ where: { name } }))
    if (!client) {
      client = await prisma.client.create({ data: { name, phone } })
    }

    // Código de seguimiento incremental (EG-AÑO-NNNN)
    const year = new Date().getFullYear()
    const count = await prisma.repair.count()
    const trackingCode = `EG-${year}-${String(count + 1).padStart(4, '0')}`

    const repair = await prisma.repair.create({
      data: {
        trackingCode,
        clientId: client.id,
        deviceType: body.deviceType || 'other',
        deviceBrand: body.deviceBrand || null,
        deviceModel: body.deviceModel || null,
        issueDescription: body.issue || '',
        priority: body.priority || 'medium',
        status: 'received',
        estimatedCost: parseMoney(body.cost),
        statusHistory: { create: { status: 'received', note: 'Reparación registrada' } },
      },
      include: { client: { select: { name: true } } },
    })

    return NextResponse.json(toDTO(repair))
  } catch {
    return NextResponse.json({ error: 'fail' }, { status: 500 })
  }
}
