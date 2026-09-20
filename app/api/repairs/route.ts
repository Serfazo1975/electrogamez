import { NextRequest, NextResponse } from 'next/server'
import { dbReady, parseMoney } from '@/lib/api-helpers'
import { toDTO } from '@/lib/repair-dto'
import { getPaymentMap } from '@/lib/repair-payments'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!dbReady()) return NextResponse.json({ error: 'no-db' }, { status: 503 })
  try {
    const { prisma } = await import('@/lib/prisma')
    const repairs = await prisma.repair.findMany({
      orderBy: { receivedAt: 'desc' },
      include: { client: { select: { name: true } } },
    })
    const pays = await getPaymentMap()
    return NextResponse.json(repairs.map(r => toDTO(r, pays.get(r.id))))
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
    const email = body.email ? String(body.email).trim() : null

    // Buscar cliente existente por teléfono o por nombre; si no, crearlo.
    let client =
      (phone ? await prisma.client.findFirst({ where: { phone } }) : null) ??
      (await prisma.client.findFirst({ where: { name } }))
    if (!client) {
      client = await prisma.client.create({ data: { name, phone, email } })
    } else if (email && !client.email) {
      // completar email si el cliente no lo tenía
      client = await prisma.client.update({ where: { id: client.id }, data: { email } })
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
