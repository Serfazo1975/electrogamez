import { NextRequest, NextResponse } from 'next/server'
import { dbReady, parseMoney } from '@/lib/api-helpers'
import { toDTO } from '@/lib/repair-dto'
import { getPayment, setPayment } from '@/lib/repair-payments'

export const dynamic = 'force-dynamic'

// PUT /api/repairs/editar  → corrige datos de una reparación y/o su estado de pago.
// Acepta campos parciales: { id, client?, device?, type?, issue?, priority?, cost?, payment? }
export async function PUT(req: NextRequest) {
  if (!dbReady()) return NextResponse.json({ error: 'no-db' }, { status: 503 })
  try {
    const { prisma } = await import('@/lib/prisma')
    const body = await req.json()
    const id = String(body.id ?? '')
    if (!id) return NextResponse.json({ error: 'id' }, { status: 400 })

    const current = await prisma.repair.findUnique({
      where: { id },
      include: { client: { select: { name: true } } },
    })
    if (!current) return NextResponse.json({ error: 'not-found' }, { status: 404 })

    const data: {
      clientId?: string
      deviceType?: string
      deviceBrand?: string | null
      deviceModel?: string | null
      issueDescription?: string
      priority?: string
      estimatedCost?: number | null
    } = {}

    // Cliente: si cambió el nombre, se busca uno existente o se crea (igual que al crear la reparación)
    if (typeof body.client === 'string') {
      const name = body.client.trim()
      if (name && name !== (current.client?.name ?? '')) {
        const client =
          (await prisma.client.findFirst({ where: { name } })) ??
          (await prisma.client.create({ data: { name, phone: null, email: null } }))
        data.clientId = client.id
      }
    }

    // Equipo: solo se toca si el texto realmente cambió
    if (typeof body.device === 'string') {
      const shown = [current.deviceBrand, current.deviceModel].filter(Boolean).join(' ') || current.deviceType
      const device = body.device.trim()
      if (device && device !== shown) {
        data.deviceBrand = device
        data.deviceModel = null
      }
    }

    if (typeof body.type === 'string' && body.type) data.deviceType = body.type
    if (typeof body.issue === 'string' && body.issue.trim()) data.issueDescription = body.issue.trim()
    if (['low', 'medium', 'high'].includes(body.priority)) data.priority = body.priority
    if ('cost' in body) data.estimatedCost = parseMoney(body.cost)

    if (Object.keys(data).length > 0) {
      await prisma.repair.update({ where: { id }, data: data as never })
    }

    if (body.payment === 'pending' || body.payment === 'paid') {
      await setPayment(id, body.payment)
    }

    const fresh = await prisma.repair.findUnique({
      where: { id },
      include: { client: { select: { name: true } } },
    })
    if (!fresh) return NextResponse.json({ error: 'not-found' }, { status: 404 })
    return NextResponse.json(toDTO(fresh, await getPayment(id)))
  } catch {
    return NextResponse.json({ error: 'fail' }, { status: 500 })
  }
}
